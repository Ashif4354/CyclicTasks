import { useState, useRef } from 'react';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReCAPTCHA from 'react-google-recaptcha';

import './GrantAdminDialog.css';
import grantRevokeAdmin from '../../scripts/grantRevokeAdmin';

const GrantAdminDialog = (props) => {
    const { open, setOpen, admin, admins, setAdmins, users, setGrantFailedSnackBarOpen, setGrantSuccessSnackBarOpen } = props;

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailHelperText, setEmailHelperText] = useState('');
    const [loading, setLoading] = useState(false);
    const [btnDisabled, setBtnDisabled] = useState(false);
    const [errorText, setErrorText] = useState('');

    const recaptchaRef = useRef();

    const onEmailChange = (e) => {
        setEmail(e.target.value);
        setEmailError(false);
        setEmailHelperText('');
        setErrorText('');
    }

    const onGrant = () => {
        
        if (email === '') {
            setEmailError(true);
            setEmailHelperText('Email cannot be empty');
            return;
        } else if (users.find(user => user.email === email) === undefined) {
            setEmailError(true);
            setEmailHelperText('User does not exist in the application');
            return;
        }

        setErrorText('');
        setLoading(true);
        setBtnDisabled(true);
        grantRevokeAdmin(
            admin,
            email,
            true,
            admins,
            setAdmins,
            recaptchaRef,
            setOpen,
            setGrantSuccessSnackBarOpen,
            setGrantFailedSnackBarOpen,
            setErrorText,
            setLoading,
            setBtnDisabled
        )
    }

    const handleCancelClose = () => {
        setOpen(false);
        setEmail('');
        setEmailError(false);
        setEmailHelperText('');
        setErrorText('');
        setLoading(false);
        setBtnDisabled(false);
    }

    return (
        <Dialog open={open} onClose={handleCancelClose} fullWidth>
            <DialogTitle className='dialog-title' fontWeight={'bold'} fontFamily={'Vicasso'} fontSize={'1.5rem'}>
                Grant Admin
                <IconButton
                    sx={{ position: 'absolute', right: '5px', top: '5px', '&:hover': { backgroundColor: '#ffffff10' } }}
                    onClick={handleCancelClose}
                >
                    <CloseIcon sx={{ color: 'white' }} />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <div className='dialog-content'>
                    <span>Enter the email of the user you want to grant admin access to</span>
                    <TextField
                        error={emailError}
                        variant='outlined'
                        margin='normal'
                        fullWidth
                        label='Email'
                        helperText={emailHelperText}
                        autoFocus
                        value={email}
                        onChange={onEmailChange}

                        sx={{
                            color: 'white',
                            backgroundColor: '#393939',
                            borderRadius: '5px',
                            '& label.MuiFormLabel-root': {
                                color: emailError ? '#f44336' : 'white',
                            },
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    border: !emailError ? '2px solid #ffffff' : '2px solid #f44336',
                                },
                            },
                            '& input': {
                                // color: 'white',
                            }

                        }}
                    />
                    <span style={{ marginTop: '10px', display: 'flex', color: 'red', fontWeight: 'bold' }}>{errorText}</span>
                </div>
            </DialogContent>

            <DialogActions>
                <button className='btn' onClick={handleCancelClose}>Cancel</button>
                <button
                    className='btn'
                    disabled={btnDisabled}
                    onClick={onGrant}
                >
                    {
                        loading ? <CircularProgress size={25} color='inherit'/> : 'Grant'
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

export default GrantAdminDialog;

