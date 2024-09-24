import React, { useEffect, useState } from "react";

import './TaskDialog.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { Button, DialogActions, DialogContent, Switch } from "@mui/material";
import TextField from '@mui/material/TextField';
// import FormControl from '@mui/material/FormControl';
// import InputLabel from '@mui/material/InputLabel';
// import Input from '@mui/material/Input';
// import FormHelperText from '@mui/material/FormHelperText';


const TaskDialog = (props) => {
    const { open, setOpen, type, changes, setChanges, task } = props;

    const [taskName, setTaskName] = useState('');
    const [url, setUrl] = useState('');
    const [interval, setInterval] = useState('');
    const [active, setActive] = useState(true);
    const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
    const [discordWebhookColor, setDiscordWebhookColor] = useState('');
    // const [userEmail, setUserEmail] = useState(localStorage.getItem('user').email);
    // const [userName, setUserName] = useState(localStorage.getItem('user').name);

    useEffect(() => {
        if (type == 'Edit') {
            // console.log(task);

            setTaskName(task.task_name);
            setUrl(task.url);
            setInterval(task.interval);
            setActive(task.active);
            setDiscordWebhookUrl(task.discord_webhook_url);
            setDiscordWebhookColor(task.discord_webhook_color);
        }
    }, [])

    const handleCancel = () => {
        setOpen(false);

        setTaskName(task.task_name);
        setUrl(task.url);
        setInterval(task.interval);
        setActive(task.active)
        setDiscordWebhookUrl(task.discord_webhook_url);
        setDiscordWebhookColor(task.discord_webhook_color);
    }  


    const handleSave = () => {
        // setOpen(false);
        console.log('Save button clicked');

        const newData = {
            id: task.id,
            task_name: taskName,
            url: url,
            interval: interval,
            active: active,
            discord_webhook_url: discordWebhookUrl,
            discord_webhook_color: discordWebhookColor,
            user_name: task.user_name,
            user_email: task.user_email,
            notify_admin: task.notify_admin
        }

        if (type == 'Edit') {
            const newChanges = changes.update;
            newChanges.push(newData);
            setChanges({ ...changes, update: newChanges, changes: true });
        }
    }

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle className='dialog-title'>{type} Task</DialogTitle>
            <DialogContent>
                <div className='dialog-input-container'>
                    <TextField
                        required
                        id="outlined-basic"
                        label="Task Name"
                        variant="outlined"
                        fullWidth={true}
                        value={taskName}
                        margin="normal"
                        onChange={(e) => setTaskName(e.target.value)}
                    />
                    <TextField
                        required
                        id="outlined-basic"
                        label="Target URL"
                        variant="outlined"
                        fullWidth={true}
                        value={url}
                        margin="normal"
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <TextField
                        required
                        id="outlined-basic"
                        label="Interval"
                        variant="outlined"
                        fullWidth={true}
                        value={interval}
                        margin="normal"
                        onChange={(e) => setInterval(e.target.value)}
                        helperText="Interval in seconds"

                    />

                    <TextField
                        id="outlined-basic"
                        label="Discord Webhook URL (optional)"
                        variant="outlined"
                        fullWidth={true}
                        value={discordWebhookUrl}
                        margin="normal"
                        onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                        helperText='The discord webhook url to send the notifications'

                    />

                    <TextField
                        id="outlined-basic"
                        label="Discord Webhook Color(optional)"
                        variant="outlined"
                        fullWidth={true}
                        value={discordWebhookColor}
                        margin="normal"
                        onChange={(e) => setDiscordWebhookColor(e.target.value)}
                        helperText='Hex only, dont include #, DEFAULT: ffffff'

                    />

                    <div className='enable-switch-container'>
                        <p className="enable-text">ENABLE</p>
                        <Switch
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                        />
                    </div>

                </div>


            </DialogContent>
            <DialogActions>
                <button className='dialog-btns' onClick={handleCancel}>Cancel</button>
                <button className='dialog-btns' onClick={handleSave}>Save</button>
            </DialogActions>
        </Dialog>

    )
}

export { TaskDialog }