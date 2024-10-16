import { useRef, useState } from 'react';

import { CircularProgress, Dialog, DialogContent, DialogTitle } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ReCAPTCHA from 'react-google-recaptcha';

import './AdminVerifyDialog.css';
import { analytics, auth } from '../../../../config/firebase';
import { logEvent } from 'firebase/analytics';


const AdminVerifyDialog = (props) => {
    const { open, setOpen, setSignedIn, setOwner } = props;

    const [errorText, setErrorText] = useState('');
    const [loading, setLoading] = useState(false);

    const recaptchaRef = useRef();

    const verify = async () => {
        setLoading(true);
        logEvent(analytics, 'admin-verify-attempt');
        setErrorText('');  
          
        const recaptchaToken = await recaptchaRef.current.executeAsync();
        recaptchaRef.current.reset();

        const user = auth.currentUser;
        if (!user) {
            setErrorText('Log in to continue');
            setLoading(false);
            return;
        }        
        
        fetch(import.meta.env.VITE_CT_SERVER_URL + '/admin/verifyadmin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await user.getIdToken(true)
            },
            body: JSON.stringify({
                recaptchaToken
            })
        })
            .then(response => response.json())
            .then(response => {
                if (response.success) {
                    logEvent(analytics, 'admin-verify-successful');
                    setOwner(response.owner);
                    setSignedIn(true);
                    setOpen(false);
                } else {
                    setErrorText(response.message);
                    logEvent(analytics, 'admin-verify-failed');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setErrorText('An error occurred. Please try again later.');
                setLoading(false);
            });
    }
    


    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            className='delete-task-dialog'
            fullWidth
        >
            <DialogTitle textAlign={'center'}>
                Admin Verify
                <IconButton
                    aria-label='close'
                    sx={{ position: 'absolute', right: '5px', top: '5px', '&:hover': { backgroundColor: '#ffffff10' } }}
                    onClick={() => setOpen(false)}
                    className='delete-task-dialog-close-btn'
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {
                        loading ? (
                            <CircularProgress size={20} color='inherit' />
                        ) : (
                            <div />
                        )
                    }
                    <p style={{ color: 'red', fontWeight: 'bold' }}>{errorText}</p>
                </div>

            </DialogContent>
            
            <ReCAPTCHA
                sitekey={import.meta.env.VITE_G_RECAPTCHA_SITE_KEY}
                size='invisible'
                ref={recaptchaRef}
                asyncScriptOnLoad={verify}
            />
        </Dialog>
    );
}

export default AdminVerifyDialog;