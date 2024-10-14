import { useState, useRef } from 'react';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReCAPTCHA from 'react-google-recaptcha';

import './RevokeAdminDialog.css';
import grantRevokeAdmin from '../../scripts/grantRevokeAdmin';

const RevokeAdminDialog = (props) => {
    const { open, setOpen, user, admin, admins, setAdmins, setRevokeFailedSnackBarOpen, setRevokeSuccessSnackBarOpen } = props;

    const [errorText, setErrorText] = useState('');
    const [loading, setLoading] = useState(false);
    const [btnDisabled, setBtnDisabled] = useState(false);

    const recaptchaRef = useRef();

    const handleCancelClose = () => {
        setOpen(false);
    }

    return (
        <Dialog open={open} onClose={handleCancelClose} fullWidth>
            <DialogTitle className='dialog-title' fontWeight={'bold'} fontFamily={'Vicasso'} fontSize={'1.5rem'}>
                Revoke Admin
                <IconButton
                    sx={{ position: 'absolute', right: '5px', top: '5px', '&:hover': { backgroundColor: '#ffffff10' } }}
                    onClick={handleCancelClose}
                >
                    <CloseIcon sx={{ color: 'white' }} />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <div className='dialog-content'>
                    <span>Are you sure you want to revoke admin access for this user?</span>
                    <span style={{ marginTop: '10px', display: 'flex' }}>{user.email}</span>
                    <span style={{ marginTop: '10px', display: 'flex', color: 'red', fontWeight: 'bold' }}>{errorText}</span>
                </div>
            </DialogContent>

            <DialogActions>
                <button className='btn' onClick={handleCancelClose}>Cancel</button>
                <button
                    className='btn'
                    disabled={btnDisabled}
                    onClick={
                        () => {
                            setErrorText('');
                            setLoading(true);
                            setBtnDisabled(true);
                            grantRevokeAdmin(
                                admin,
                                user.email,
                                false,
                                admins,
                                setAdmins,
                                recaptchaRef,
                                setOpen,
                                setRevokeSuccessSnackBarOpen,
                                setRevokeFailedSnackBarOpen,
                                setErrorText,
                                setLoading,
                                setBtnDisabled
                            )
                        }
                    }
                >
                    {
                        loading ? <CircularProgress size={25} color='inherit' /> : 'Revoke'
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


export default RevokeAdminDialog;