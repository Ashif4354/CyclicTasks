import { analytics, auth } from "../../../../../config/firebase";
import { logEvent } from "firebase/analytics";

const handleSave = async (type, task, taskName, url, interval,
    active, discordWebhookUrl, discordWebhookColor, setTask, tasks, setTasks,
    setOpen, setTaskNameError, setUrlError, setIntervalError, setDiscordWebhookUrlError,
    setDiscordWebhookColorError, setTaskNameHelperText, setUrlHelperText, setIntervalHelperText,
    setDiscordWebhookUrlHelperText, setDiscordWebhookColorHelperText, recaptchaRef, setLoadingOpen, setSaveBtnDisabled,    
    setSuccessUpdateSnackBarOpen, setFailedUpdateSnackBarOpen, setSuccessAddSnackBarOpen, setFailedAddSnackBarOpen,
    setServerErrorMessage, setFormDisabled
) => {
    
    setServerErrorMessage('');
    
    let validData = validate(
        taskName, url, interval, discordWebhookUrl, discordWebhookColor,
        setTaskNameError, setUrlError, setIntervalError, setDiscordWebhookUrlError,
        setDiscordWebhookColorError, setTaskNameHelperText, setUrlHelperText, setIntervalHelperText,
        setDiscordWebhookUrlHelperText, setDiscordWebhookColorHelperText 
    ); 
    
    if (!validData) {
        setLoadingOpen(false);
        setSaveBtnDisabled(false);
        
        return;
    }
    
    const recaptchaToken = await recaptchaRef.current.executeAsync();
    recaptchaRef.current.reset();
    setFormDisabled(true);

    const user = auth.currentUser

    const newData = {
        id: (type == 'Add' ? 'no id' : task.id),
        task_name: taskName,
        url: url,
        interval: parseInt(interval),
        active: active,
        discord_webhook_url: discordWebhookUrl,
        discord_webhook_color: discordWebhookColor,
        user_name: (task != undefined ? task.user_name : user.displayName),
        user_email: (task != undefined ? task.user_email : user.email),
        notify_admin: (task ? task.notify_admin : false),
    }

    const body = {
        task: newData,
        recaptchaToken: recaptchaToken
    }

    fetch(import.meta.env.VITE_CT_SERVER_URL + (type == 'Add' ? '/tasks/newtask' : '/tasks/updatetask'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await auth.currentUser.getIdToken(true)
        },
        body: JSON.stringify(body)
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                if (type == 'Add') {
                    logEvent(analytics, 'successful-add-task')

                    newData.id = response.new_task_id;
                    setTasks([...tasks, newData])
                    setSuccessAddSnackBarOpen(true);
                } else {
                    logEvent(analytics, 'successful-update-task')

                    setTask(newData)
                    setSuccessUpdateSnackBarOpen(true);
                }
                setOpen(false);
                
            } else {
                if (type == 'Add') {
                    logEvent(analytics, 'failed-add-task')
                    setFailedAddSnackBarOpen(true);
                } else {
                    logEvent(analytics, 'failed-update-task')
                    setFailedUpdateSnackBarOpen(true);
                }
                setServerErrorMessage("*" + response.message);
            }
            
            setLoadingOpen(false);
            setSaveBtnDisabled(false);
            setFormDisabled(false);
        })
        .catch(error => {
            if (type == 'Add') {
                logEvent(analytics, 'failed-add-task')
            } else {
                logEvent(analytics, 'failed-update-task')
            }
            
            setLoadingOpen(false);
            setSaveBtnDisabled(false);
            setFormDisabled(false);

            if (type == 'Add') {
                setFailedAddSnackBarOpen(true);
            } else {
                setFailedUpdateSnackBarOpen(true);
            }

            setServerErrorMessage("*An error occurred. Please try again later.", error);
        });
}


const validate = (
    taskName, url, interval, discordWebhookUrl,
    discordWebhookColor, setTaskNameError, setUrlError,
    setIntervalError, setDiscordWebhookUrlError, setDiscordWebhookColorError,
    setTaskNameHelperText, setUrlHelperText, setIntervalHelperText,
    setDiscordWebhookUrlHelperText, setDiscordWebhookColorHelperText
) => {

    let validData = true;

    if (taskName == '') {
        setTaskNameError(true);
        setTaskNameHelperText('Task name cannot be empty');
        validData = false;
    } else {
        setTaskNameError(false);
        setTaskNameHelperText('');
    }

    if (url == '') {
        setUrlError(true);
        setUrlHelperText('URL cannot be empty');
        validData = false;
    } else {
        setUrlError(false);
        setUrlHelperText('');
    }

    try {
        new URL(url);
        setUrlError(false);
        setUrlHelperText('');
    } catch {
        setUrlError(true);
        setUrlHelperText('Invalid URL');
        validData = false;
    }

    if (isNaN(parseInt(interval))) {
        setIntervalError(true);
        setIntervalHelperText('Interval should be a number');
        validData = false;
    } else if (parseInt(interval) < 60) {
        setIntervalError(true);
        setIntervalHelperText('Interval should be at least 60 seconds');
        validData = false;
    } else if (parseInt(interval) > 31536000) {
        setIntervalError(true);
        setIntervalHelperText('Interval should not exceed 1 year');
        validData = false;
    } else {
        setIntervalError(false);
        setIntervalHelperText('Interval in seconds');
    }

    if (discordWebhookUrl != '') {
        try {
            new URL(discordWebhookUrl);
            setDiscordWebhookUrlError(false);
            setDiscordWebhookUrlHelperText('The discord webhook url to send notifications or updates');
        } catch {
            setDiscordWebhookUrlError(true);
            setDiscordWebhookUrlHelperText('Invalid URL');
            validData = false;
        }
    } else {
        setDiscordWebhookUrlError(false);
        setDiscordWebhookUrlHelperText('The discord webhook url to send notifications or updates');
    }

    if (discordWebhookColor != '') {
        const characters = "0123456789abcdef";
        if (discordWebhookColor.length != 6) {
            setDiscordWebhookColorError(true);
            setDiscordWebhookColorHelperText('Color should be 6 characters long');
            validData = false;
        } else {
            setDiscordWebhookColorError(false);
            setDiscordWebhookColorHelperText("Hex only, don't include #, DEFAULT: ffffff");
        }
        for (let i = 0; i < discordWebhookColor.length; i++) {
            if (!characters.includes(discordWebhookColor[i])) {
                setDiscordWebhookColorError(true);
                setDiscordWebhookColorHelperText('Not a valid hex color');
                validData = false;
                break;
            }
        }
    }

    if (validData) {
        setTaskNameError(false);
        setUrlError(false);
        setIntervalError(false);
        setDiscordWebhookUrlError(false);
        setDiscordWebhookColorError(false);
        setTaskNameHelperText('');
        setUrlHelperText('');
        setIntervalHelperText('Interval in seconds');
        setDiscordWebhookUrlHelperText('The discord webhook url to send notifications or updates');
        setDiscordWebhookColorHelperText("Hex only, don't include #, DEFAULT: ffffff");

        return true;
    } else {
        return false;
    }
}

export { handleSave };