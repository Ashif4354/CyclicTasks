import { useRef, useState } from 'react';

import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ReCAPTCHA from 'react-google-recaptcha';

import { analytics } from '../../../../config/firebase';
import { logEvent } from 'firebase/analytics';

import './PasswordDialog.css';

const PasswordDialog = (props) => {
    const {open, setOpen} = props;

    const [password, setPassword] = useState('');
    const [errorText, setErrorText] = useState('');
    const recaptchaRef = useRef();

    const onEnter = async () => {
        setErrorText('');
        const recaptchaToken = await recaptchaRef.current.executeAsync();

        fetch(import.meta.VITE_CT_SERVER_URL + '/admin/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password,
                recaptchaToken,
            }),
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.success && response.verified) {
                    logEvent(analytics, 'successful-admin-login');
                    setOpen(false);
                } else if (response.success && !response.verified) {
                    logEvent(analytics, 'admin-incorrect-password');
                    setErrorText('Incorrect Password');
                } else {
                    logEvent(analytics, 'failed-admin-login');
                    setErrorText('Some Error Occurred');
                }

            })
            .catch((error) => {
                logEvent(analytics, 'failed-admin-login');
                setErrorText('Some Error Occurred');
            });
        
        recaptchaRef.current.reset();
    };

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            className='delete-task-dialog'
            fullWidth
        >
            <DialogTitle>
                Enter Admin Password
                <IconButton
                    aria-label='close'
                    sx={{ position: 'absolute', right: '5px', top: '5px', '&:hover': { backgroundColor: '#ff000030' } }}
                    onClick={() => setOpen(false)}
                    className='delete-task-dialog-close-btn'
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <TextField
                    label='Admin Password'
                    type='password'
                    variant='outlined'
                    value={password}
                    margin="normal"
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                />

                <p style={{ color: 'red', fontWeight: 'bold' }}>{errorText}</p>


            </DialogContent>
            <DialogActions>
                <button
                    className='dialog-btns'
                    onClick={() => {
                        logEvent(analytics, 'admin-login-attempt');
                        onEnter();
                    }}
                >
                    Enter
                </button>
            </DialogActions>
            <ReCAPTCHA
                sitekey={import.meta.env.VITE_G_RECAPTCHA_SITE_KEY}
                size='invisible'
                ref={recaptchaRef}
            />
        </Dialog>
    );
}

export default PasswordDialog;