import { useRef, useState } from 'react';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ReCAPTCHA from 'react-google-recaptcha';

import './SuspendTaskDialog.css'
import onSuspendTasks from '../../../scripts/onSuspendTasks';

const SuspendTasksDialog = (props) => {
    const { open, setOpen, users, setSelectNone, setSuccessSnackBarOpen, setFailedSnackBarOpen, adminPassword } = props;

    const [loading, setLoading] = useState(false);
    const [btnDisabled, setBtnDisabled] = useState(false);
    const [errorText, setErrorText] = useState('');
    const recaptchaRef = useRef();

    const handleCancelClose = () => {
        setOpen(false);
        setLoading(false);
        setBtnDisabled(false);
    }

    return (
        <Dialog open={open} onClose={handleCancelClose} fullWidth>
            <DialogTitle alignSelf={'center'} fontFamily={'Vicasso'} fontSize={'1.5rem'}>
                Suspend Tasks
                <IconButton
                    sx={{ position: 'absolute', right: '5px', top: '5px', '&:hover': { backgroundColor: '#ff000030' } }}
                    onClick={handleCancelClose}
                >
                    <CloseIcon sx={{ color: 'black' }} />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span> Are you sure you want to suspend these user's task?</span>
                    <span> Total Users: {users.length}</span>
                    {
                        users.map((user, index) => (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
                                <span>&nbsp;</span>
                                <span>User Email: {user.email}</span>
                                <span>User Name: {user.name}</span>
                            </div>
                        ))
                    }
                    <span style={{ color: 'red', fontWeight: 'bold', overflow: 'hidden' }}>{errorText}</span>
                </div>
                <ReCAPTCHA
                    sitekey={import.meta.env.VITE_G_RECAPTCHA_SITE_KEY}
                    size='invisible'
                    ref={recaptchaRef}
                />
            </DialogContent>
            <DialogActions>
                <button className='dialog-btns' onClick={handleCancelClose}>Cancel</button>
                <button
                    disabled={btnDisabled}
                    className='dialog-btns'
                    onClick={() =>
                        onSuspendTasks(
                            setLoading,  
                            setBtnDisabled,
                            recaptchaRef,
                            adminPassword,
                            users.map(user => user.email),
                            setSelectNone,
                            setSuccessSnackBarOpen,
                            setOpen,
                            setFailedSnackBarOpen,
                            setErrorText                                               
                        )
                    }>
                    {
                        loading ? <CircularProgress size={20} color='inherit' /> : 'Suspend'
                    }
                </button>
            </DialogActions>

        </Dialog>
    )
}


export default SuspendTasksDialog;