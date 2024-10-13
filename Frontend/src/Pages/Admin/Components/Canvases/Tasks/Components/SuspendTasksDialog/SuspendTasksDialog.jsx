import { useRef, useState } from 'react';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ReCAPTCHA from 'react-google-recaptcha';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import './SuspendTasksDialog.css';
import suspendTasks from '../Panel/scripts/suspendTasks';

const SuspendTasksDialog = (props) => {

    const { open, setOpen, tasks, adminPassword, setSuccessSnackBarOpen, setFailedSnackBarOpen, onSelectNone } = props;

    const recaptchaRef = useRef();
    const [errorText, setErrorText] = useState('');
    const [loading, setLoading] = useState(false);



    const handleClose = () => {
        setOpen(false);
    }

    const onSuspendTasks = async () => {

        suspendTasks(
            tasks,
            recaptchaRef,
            adminPassword,
            setOpen,
            setLoading,
            setSuccessSnackBarOpen,
            setFailedSnackBarOpen,
            setErrorText,
            onSelectNone

        );
    }



    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
        >
            <DialogTitle id="alert-dialog-title">
                Suspend Tasks?

                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: '10px',
                        top: '10px',
                        '&:hover': { backgroundColor: '#ffffff10' }
                    }}
                >
                    <CloseIcon color='white' />
                </IconButton>


            </DialogTitle>
            <DialogContent>
                <DialogContentText className="alert-dialog-description">
                    Are you sure you want to suspend the selected tasks?
                    <span>Total Tasks Selected: {tasks.length}</span>
                    <div className='tasks-scroll-container'>
                        {
                            tasks.map((task, index) => {
                                return (
                                    <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>&nbsp;</span>
                                        {/* <span>{index + 1}. {task.task.id}{task.task.task_name}</span>\ */}
                                        <span>{index + 1}. Task ID: {task.task.id}</span>
                                        <span>&nbsp;&nbsp;&nbsp;&nbsp;Task Name: {task.task.task_name}</span>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <span className='error-text' style={{ color: 'red', fontWeight: 'bold' }}>{errorText}</span>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <button onClick={handleClose} className='dialog-btns'>Cancel</button>
                <button onClick={onSuspendTasks} className='dialog-btns'>
                    {
                        loading ? (
                            <CircularProgress size={25} color='inherit' />
                        ) : (
                            'Suspend'
                        )
                    }
                </button>
            </DialogActions>

            <ReCAPTCHA
                sitekey={import.meta.env.VITE_G_RECAPTCHA_SITE_KEY}
                size='invisible'
                ref={recaptchaRef}
            />

        </Dialog>
    )
}

export default SuspendTasksDialog;