import { useRef, useState } from 'react';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ReCAPTCHA from 'react-google-recaptcha';

import { analytics } from '../../../../config/firebase';
import { logEvent } from 'firebase/analytics';

import './DeleteTaskDialog.css'

const DeleteTaskDialog = (props) => {
    const { open, setOpen, task, tasks, setTasks, setSuccessDeleteSnackBarOpen, setFailedDeleteSnackBarOpen } = props;

    const [currentTask, setCurrentTask] = useState(task);
    const [loadingOpen, setLoadingOpen] = useState(false);
    const [deleteBtnDisabled, setDeleteBtnDisabled] = useState(false);
    const [serverErrorMessage, setServerErrorMesssage] = useState('');

    const recaptchaRef = useRef();

    const onDelete = async () => {
        setDeleteBtnDisabled(true);
        setLoadingOpen(true);
        setServerErrorMesssage('');
        const recaptchaToken = await recaptchaRef.current.executeAsync();

        fetch(import.meta.env.VITE_CT_SERVER_URL + '/deletetask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                task: task,
                recaptchaToken: recaptchaToken
            }),
        })
            .then(response => response.json())
            .then(response => {
                if (response.success) {
                    logEvent(analytics, 'successful-delete-task')
                    const newTasks = tasks.filter((task) => task.id != currentTask.id);
                    setTasks(newTasks);
                    setOpen(false);
                    setSuccessDeleteSnackBarOpen(true);
                } else {
                    logEvent(analytics, 'failed-delete-task')
                    setFailedDeleteSnackBarOpen(true);
                    setServerErrorMesssage("*" + response.message);
                }
                setLoadingOpen(false);
                setDeleteBtnDisabled(false);
            })
            .catch(error => {
                logEvent(analytics, 'failed-delete-task')
                setLoadingOpen(false);
                setDeleteBtnDisabled(false);
                setFailedDeleteSnackBarOpen(true);
                setServerErrorMesssage("*An error occurred. Please try again later.");
            });

        recaptchaRef.current.reset();
    }

    const handleCancelClose = () => {
        logEvent(analytics, 'delete-task-dialog-cancel-close')
        setOpen(false);
        setLoadingOpen(false);
        setDeleteBtnDisabled(false);
        setServerErrorMesssage('');
    }

    return (
        <Dialog open={open} onClose={handleCancelClose} fullWidth>
            <DialogTitle className='dialog-title' fontWeight={'bold'} fontFamily={'Vicasso'} fontSize={'1.5rem'}>
                Delete Task

                <IconButton
                    sx={{ position: 'absolute', right: '5px', top: '5px', '&:hover': { backgroundColor: '#ff000030' } }}
                    onClick={handleCancelClose}
                >
                    <CloseIcon sx={{ color: 'black' }} />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <div className="delete-task-container">
                    <p>Are you sure you want to delete this task?</p>
                    <p>Task ID: {task.id}</p>
                    <p>Task Name: {task.task_name}</p>
                    <p style={{color: 'red', fontWeight:'bold', overflow:'hidden'}}>{serverErrorMessage}</p>
                    <ReCAPTCHA
                        sitekey={import.meta.env.VITE_G_RECAPTCHA_SITE_KEY}
                        size='invisible'
                        ref={recaptchaRef}
                    // asyncScriptOnLoad={() => recaptchaRef.current.execute()}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <button className='dialog-btns' onClick={handleCancelClose}>Cancel</button>
                <button className='dialog-btns' disabled={deleteBtnDisabled} onClick={onDelete}>
                    {
                        loadingOpen ? (
                            <CircularProgress size={20} color='inherit' />
                        ) : (
                            "Delete"
                        )
                    }

                </button>
            </DialogActions>

        </Dialog>
    )
}

export { DeleteTaskDialog }