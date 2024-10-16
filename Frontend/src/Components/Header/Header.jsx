import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { Checkbox } from '@mui/material';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import './Header.css'
import { GoogleLogin, logout } from '../../scripts/Session'
import { auth } from '../../config/firebase';


const Header = (props) => {
    const [user, setUser] = useState(null);
    const [signInDialogOpen, setSignInDialogOpen] = useState(false);

    useEffect(() => {
        onAuthStateChanged(auth, user => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        })
    }, [])

    return (
        <header className='header'>
            <div className='heading-text-container'>
                <div className='heading-text'>
                    <p className='header-heading-text'>{props.heading}</p>
                </div>
            </div>

            <div className='login-logout-btn-container'>
                {
                    user ? (
                        <button className='loginout-btn' onClick={() => logout(setUser)}>Logout</button>
                    ) : (
                        <button className='loginout-btn' onClick={() => setSignInDialogOpen(true)}>Login</button>
                    )
                }
            </div>

            <LoginDialog open={signInDialogOpen} setOpen={setSignInDialogOpen}/>

        </header>
    )
}

const LoginDialog = (props) => {
    const { open, setOpen } = props;

    const [checked, setChecked] = useState(false);
    
    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle alignSelf={'center'}>Login</DialogTitle>

            <DialogContent>
                <div>
                    <span>You should accept our <Link to='/tc'>Terms and Conditions</Link> to Login</span>
                    <div className='check-box-container'>
                        <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                        <span>I Accept the Terms and Conditions</span>
                    </div>
                </div>
            </DialogContent>
            
            <DialogActions sx={{ justifyContent: 'center' }}>
                <button className='dialog-btns' onClick={() => GoogleLogin(setOpen)} disabled={!checked}>Login</button>
            </DialogActions>
        </Dialog>
    )
}

export default Header