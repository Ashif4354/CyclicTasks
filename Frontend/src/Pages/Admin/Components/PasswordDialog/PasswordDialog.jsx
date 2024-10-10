import { useRef, useState } from 'react';

import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ReCAPTCHA from 'react-google-recaptcha';

import { analytics } from '../../../../config/firebase';
import { logEvent } from 'firebase/analytics';

import './PasswordDialog.css';

const PasswordDialog = (props) => {
    const { open, setOpen, setSignedIn, setAdminPassword } = props;

    const [password, setPassword] = useState('');
    const [errorText, setErrorText] = useState('');
    const [loading, setLoading] = useState(false);
    const [pwdFieldError, setPwdFieldError] = useState(false);
    const [pwdFieldHelperText, setPwdFieldHelperText] = useState('');
    const [pwdBtnDisabled, setPwdBtnDisabled] = useState(false);

    const recaptchaRef = useRef();

    const validatePassword = () => {
        if (password === '') {
            setPwdFieldError(true);
            setPwdFieldHelperText('Password cannot be empty');
            return false;
        } else if (password.toLowerCase() === 'admin password') {
            setPwdFieldError(true);
            setPwdFieldHelperText('The developer is not stupid');
            return false;

        } else {
            setPwdFieldError(false);
            setPwdFieldHelperText('');
            return true;
        }
    };

    const onEnter = async () => {
        logEvent(analytics, 'admin-login-attempt');

        if (!validatePassword()) {
            return;
        }
        setLoading(true);
        setPwdBtnDisabled(true);
        const recaptchaToken = await recaptchaRef.current.executeAsync();

        fetch(import.meta.env.VITE_CT_SERVER_URL + '/admin/verifyadminpwd', {
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
                    setAdminPassword(password);
                    setOpen(false);
                    setSignedIn(true);
                } else if (response.success && !response.verified) {
                    logEvent(analytics, 'admin-incorrect-password');
                    setErrorText('Incorrect Password');
                } else {
                    logEvent(analytics, 'failed-admin-login');
                    setErrorText('Some Error Occurred');
                }
                setLoading(false);
                setPwdBtnDisabled(false);

            })
            .catch((error) => {
                logEvent(analytics, 'failed-admin-login');
                setErrorText('Some Error Occurred');
                setLoading(false);
                setPwdBtnDisabled(false);
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
            <DialogTitle textAlign={'center'}>
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
                    error={pwdFieldError}
                    label='Admin Password'
                    type='password'
                    variant='outlined'
                    value={password}
                    margin="normal"
                    helperText={pwdFieldHelperText}
                    onChange={(e) => {
                        setErrorText('');
                        setPwdFieldError(false);
                        setPwdFieldHelperText('');
                        setPassword(e.target.value)
                    }}
                    fullWidth
                />

                <p style={{ color: 'red', fontWeight: 'bold' }}>{errorText}</p>


            </DialogContent>
            <DialogActions>
                <button className='dialog-btns' onClick={onEnter} disabled={pwdBtnDisabled}>
                    {
                        loading ? <CircularProgress size={20} color='inherit' /> : 'Enter'
                    }
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