import React, { useEffect, useState, useRef } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { Button, CircularProgress, DialogActions, DialogContent, Switch } from "@mui/material";
import TextField from '@mui/material/TextField';
import ReCAPTCHA from "react-google-recaptcha";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { analytics } from '../../../../config/firebase';
import { logEvent } from 'firebase/analytics';

import './TaskDialog.css';
import { handleSave } from "./scripts/handleSave";

const TaskDialog = (props) => {
    const { open, setOpen, type, task, setTask, tasks, setTasks,
        setSuccessUpdateSnackBarOpen, setFailedUpdateSnackBarOpen, setSuccessAddSnackBarOpen, setFailedAddSnackBarOpen } = props;

    const [loadingOpen, setLoadingOpen] = useState(false);
    const [saveBtnDisabled, setSaveBtnDisabled] = useState(true);
    const [serverErrorMessage, setServerErrorMessage] = useState('');
    const [formDisabled, setFormDisabled] = useState(false);

    const [taskName, setTaskName] = useState('');
    const [url, setUrl] = useState('');
    const [interval, setInterval] = useState('');
    const [active, setActive] = useState(false);
    const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
    const [discordWebhookColor, setDiscordWebhookColor] = useState('');

    const [taskNameError, setTaskNameError] = useState(false);
    const [urlError, setUrlError] = useState(false);
    const [intervalError, setIntervalError] = useState(false);
    const [discordWebhookUrlError, setDiscordWebhookUrlError] = useState(false);
    const [discordWebhookColorError, setDiscordWebhookColorError] = useState(false);

    const [taskNameHelperText, setTaskNameHelperText] = useState('');
    const [urlHelperText, setUrlHelperText] = useState('');
    const [intervalHelperText, setIntervalHelperText] = useState('Interval in seconds');
    const [discordWebhookUrlHelperText, setDiscordWebhookUrlHelperText] = useState('The discord webhook url to send notifications or updates');
    const [discordWebhookColorHelperText, setDiscordWebhookColorHelperText] = useState("Hex only, don't include #, DEFAULT: ffffff");

    const recaptchaRef = useRef();

    const [dataChanges, setDataChanges] = useState(
        {
            taskName: false,
            url: false,
            interval: false,
            active: false,
            discordWebhookUrl: false,
            discordWebhookColor: false
        }
    );

    useEffect(() => {
        if (type == 'Update') {

            setTaskName(task.task_name);
            setUrl(task.url);
            setInterval(task.interval);
            setActive(task.active);
            setDiscordWebhookUrl(task.discord_webhook_url);
            setDiscordWebhookColor(task.discord_webhook_color);
        }
    }, [])

    useEffect(() => {
        if (!open && type == 'Add') {
            setTaskName('');
            setUrl('');
            setInterval('');
            setActive(false);
            setDiscordWebhookUrl('');
            setDiscordWebhookColor('');
        } else if (!open && type == 'Update') {
            setSaveBtnDisabled(true);
        }
    }, [open])

    const handleCancelClose = () => {
        logEvent(analytics, 'task-dialog-cancel-close')

        setOpen(false);
        if (type == 'Update') {
            logEvent(analytics, 'update-task-dialog-cancel-close')
            setTaskName(task.task_name);
            setUrl(task.url);
            setInterval(task.interval);
            setActive(task.active);
            setDiscordWebhookUrl(task.discord_webhook_url);
            setDiscordWebhookColor(task.discord_webhook_color);
        }

        if (type == 'Add') {
            logEvent(analytics, 'add-task-dialog-cancel-close')
        }

        setTaskNameError(false);
        setUrlError(false);
        setIntervalError(false);
        setDiscordWebhookUrlError(false);
        setDiscordWebhookColorError(false);
        setFormDisabled(false);

        setTaskNameHelperText('');
        setUrlHelperText('');
        setIntervalHelperText('Interval in seconds');
        setDiscordWebhookUrlHelperText('The discord webhook url to send notifications or updates');
        setDiscordWebhookColorHelperText("Hex only, don't include #, DEFAULT: ffffff");

        setSaveBtnDisabled(true);
        setLoadingOpen(false);
        setServerErrorMessage('');
        recaptchaRef.current.reset();
    }

    const handleDataChange = (e, dataName, defaultValue, setFunction) => {

        if (!defaultValue) {
            defaultValue = ''
        }

        let value

        if (dataName == 'active') {
            value = e.target.checked;
        } else {
            value = e.target.value;
        }

        setFunction(value);

        let prevData = dataChanges

        if (value != defaultValue) {
            prevData[dataName] = true
            setDataChanges(prevData)
        } else {
            prevData[dataName] = false
            setDataChanges(prevData)
        }

        Object.values(dataChanges).includes(true) ? setSaveBtnDisabled(false) : setSaveBtnDisabled(true)
    }

    return (
        <Dialog open={open} onClose={handleCancelClose} fullWidth>
            <DialogTitle className='dialog-title' fontWeight={'bold'} fontFamily={'Vicasso'} fontSize={'1.5rem'}>
                {type} Task

                <IconButton
                    sx={{ position: 'absolute', right: '5px', top: '5px', '&:hover': { backgroundColor: '#ffffff10' } }}
                    onClick={handleCancelClose}
                >
                    <CloseIcon sx={{ color: 'white' }} />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <div className='dialog-input-container'>
                    <TextField
                        disabled={formDisabled}
                        error={taskNameError}
                        required
                        id="outlined-basic"
                        label="Task Name (max 30 characters)"
                        variant="outlined"
                        fullWidth
                        inputProps={{ maxLength: 50 }}
                        value={taskName}
                        margin="normal"
                        helperText={taskNameHelperText}
                        onChange={(e) => {
                            handleDataChange(e, 'taskName', task?.task_name, setTaskName);
                            setTaskNameError(false);
                            setTaskNameHelperText('');
                        }}
                    />
                    <TextField
                        disabled={formDisabled}
                        error={urlError}
                        required
                        id="outlined-basic"
                        label="Target URL"
                        variant="outlined"
                        fullWidth={true}
                        value={url}
                        margin="normal"
                        helperText={urlHelperText}
                        onChange={(e) => {
                            handleDataChange(e, 'url', task?.url, setUrl);
                            setUrlError(false);
                            setUrlHelperText('');
                        }}
                    />
                    <TextField
                        disabled={formDisabled}
                        error={intervalError}
                        required
                        id="outlined-basic"
                        label="Interval"
                        variant="outlined"
                        fullWidth={true}
                        value={interval}
                        margin="normal"
                        helperText={intervalHelperText}
                        onChange={(e) => {
                            handleDataChange(e, 'interval', task?.interval, setInterval);
                            setIntervalError(false);
                            setIntervalHelperText('Interval in seconds');
                        }}

                    />

                    <TextField
                        disabled={formDisabled}
                        error={discordWebhookUrlError}
                        id="outlined-basic"
                        label="Discord Webhook URL (optional)"
                        variant="outlined"
                        fullWidth={true}
                        value={discordWebhookUrl}
                        margin="normal"
                        helperText={discordWebhookUrlHelperText}
                        onChange={(e) => {
                            handleDataChange(e, 'discordWebhookUrl', task?.discord_webhook_url, setDiscordWebhookUrl);
                            setDiscordWebhookUrlError(false);
                            setDiscordWebhookUrlHelperText('The discord webhook url to send notifications or updates');
                        }}

                    />

                    <TextField
                        disabled={formDisabled}
                        error={discordWebhookColorError}
                        id="outlined-basic"
                        label="Discord Webhook Color(optional)"
                        variant="outlined"
                        fullWidth={true}
                        value={discordWebhookColor}
                        margin="normal"
                        helperText={discordWebhookColorHelperText}
                        onChange={(e) => {
                            handleDataChange(e, 'discordWebhookColor', task?.discord_webhook_color, setDiscordWebhookColor);
                            setDiscordWebhookColorError(false);
                            setDiscordWebhookColorHelperText("Hex only, don't include #, DEFAULT: ffffff");
                        }}

                    />

                    <div className='enable-switch-container'>
                        <p className="enable-text">ENABLE</p>
                        <Switch
                            disabled={formDisabled}
                            checked={active}
                            onChange={(e) => {
                                handleDataChange(e, 'active', task?.active, setActive);
                            }}
                        />
                    </div>

                    <p style={{ color: 'red', fontWeight: 'bold' }}>{serverErrorMessage}</p>

                    <ReCAPTCHA
                        sitekey={import.meta.env.VITE_G_RECAPTCHA_SITE_KEY}
                        size='invisible'
                        ref={recaptchaRef}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <button className='dialog-btns' onClick={handleCancelClose}>Cancel</button>
                <button className='dialog-btns'
                    disabled={saveBtnDisabled}
                    onClick={() => {
                        setLoadingOpen(true);
                        setSaveBtnDisabled(true);
                        handleSave(
                            type,
                            task,
                            taskName,
                            url,
                            interval,
                            active,
                            discordWebhookUrl,
                            discordWebhookColor,
                            setTask,
                            tasks,
                            setTasks,
                            setOpen,
                            setTaskNameError,
                            setUrlError,
                            setIntervalError,
                            setDiscordWebhookUrlError,
                            setDiscordWebhookColorError,
                            setTaskNameHelperText,
                            setUrlHelperText,
                            setIntervalHelperText,
                            setDiscordWebhookUrlHelperText,
                            setDiscordWebhookColorHelperText,
                            recaptchaRef,
                            setLoadingOpen,
                            setSaveBtnDisabled,
                            setSuccessUpdateSnackBarOpen,
                            setFailedUpdateSnackBarOpen,
                            setSuccessAddSnackBarOpen,
                            setFailedAddSnackBarOpen,
                            setServerErrorMessage,
                            setFormDisabled,
                        )
                    }}
                >
                    {
                        loadingOpen ? (
                            <CircularProgress size={20} color='inherit' />
                        ) : (
                            "Save"
                        )
                    }
                </button>
            </DialogActions>
        </Dialog>
    )
}

export { TaskDialog }