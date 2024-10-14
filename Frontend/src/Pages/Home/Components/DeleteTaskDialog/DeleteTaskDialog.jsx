import { useRef, useState } from 'react';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ReCAPTCHA from 'react-google-recaptcha';

import { analytics, auth } from '../../../../config/firebase';
import { logEvent } from 'firebase/analytics';

import './DeleteTaskDialog.css'

const DeleteTaskDialog = (props) => {
    const { open, setOpen, task, tasks, setTasks, setSuccessDeleteSnackBarOpen, setFailedDeleteSnackBarOpen } = props;

    const [currentTask, setCurrentTask] = useState(task);
    const [loadingOpen, setLoadingOpen] = useState(false);
    const [deleteBtnDisabled, setDeleteBtnDisabled] = useState(false);
    const [serverErrorMessage, setServerErrorMessage] = useState('');

    const recaptchaRef = useRef();

    const onDelete = async () => {
        setDeleteBtnDisabled(true);
        setLoadingOpen(true);
        setServerErrorMessage('');

        const recaptchaToken = await recaptchaRef.current.executeAsync();
        recaptchaRef.current.reset();

        fetch(import.meta.env.VITE_CT_SERVER_URL + '/tasks/deletetask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await auth.currentUser.getIdToken(true)
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
                    setServerErrorMessage("*" + response.message);
                }

                setLoadingOpen(false);
                setDeleteBtnDisabled(false);
            })
            .catch(error => {
                logEvent(analytics, 'failed-delete-task')

                setLoadingOpen(false);
                setDeleteBtnDisabled(false);
                setFailedDeleteSnackBarOpen(true);
                setServerErrorMessage("*An error occurred. Please try again later.");
            });

        
    }

    const handleCancelClose = () => {
        logEvent(analytics, 'delete-task-dialog-cancel-close')

        setOpen(false);
        setLoadingOpen(false);
        setDeleteBtnDisabled(false);
        setServerErrorMessage('');
    }

    return (
        <Dialog open={open} onClose={handleCancelClose} fullWidth>
            <DialogTitle className='dialog-title' fontWeight={'bold'} fontFamily={'Vicasso'} fontSize={'1.5rem'}>
                Delete Task
                <IconButton
                    sx={{ position: 'absolute', right: '5px', top: '5px', '&:hover': { backgroundColor: '#ffffff10' } }}
                    onClick={handleCancelClose}
                >
                    <CloseIcon sx={{ color: 'white' }} />
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