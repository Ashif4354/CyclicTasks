import { useEffect, useRef, useState } from 'react';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ReCAPTCHA from 'react-google-recaptcha';

import './BlockUnblockUserDialog.css';
import onBlockUnblockUser from '../../../scripts/onBlockUnblockUsers';


const BlockUnblockUserDialog = (props) => {
    const { open, setOpen, users, setSelectNone, block, setSuccessSnackBarOpen, setFailedSnackBarOpen, adminPassword } = props;

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
                {
                    block ? 'Block User' : 'Unblock User'
                }
                <IconButton
                    onClick={handleCancelClose}
                    sx={{
                        position: 'absolute',
                        right: '10px',
                        top: '10px',
                        '&:hover': { backgroundColor: '#ff000030' }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <div className='block-unblock-dialog-content'>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>
                            {
                                block ? 'Are you sure you want to block these user?' : 'Are you sure you want to unblock these user?' 
                            }
                        </span>
                        <span> Total Users: {users.length}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {
                                users.map((user, index) => {
                                    return (
                                        <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span>&nbsp;</span>
                                            <span>User Email: {user.email}</span>
                                            <span>User Name: {user.name}</span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <span style={{ color: 'red', fontWeight: 'bold', overflow: 'hidden' }}>{errorText}</span>
                    </div>

                    <ReCAPTCHA
                        sitekey={import.meta.env.VITE_G_RECAPTCHA_SITE_KEY}
                        size='invisible'
                        ref={recaptchaRef}
                    />

                </div>
            </DialogContent>
            <DialogActions>
                <button
                    className='dialog-btns'
                    onClick={handleCancelClose}
                >
                    Cancel
                </button>
                <button
                    className='dialog-btns'
                    disabled={btnDisabled}
                    onClick={() => {
                        onBlockUnblockUser(
                            setLoading,
                            setBtnDisabled,
                            recaptchaRef,
                            adminPassword,
                            users,
                            setSelectNone,
                            block,
                            setSuccessSnackBarOpen,
                            setOpen,
                            setFailedSnackBarOpen,
                            setErrorText
                        )
                    }}
                >
                    {
                        loading ? <CircularProgress size={24} color='inherit' /> : 'Confirm'
                    }
                </button>
            </DialogActions>
        </Dialog>
    )


}

export default BlockUnblockUserDialog;