import { useEffect, useState } from 'react';
import { GoogleLogin, logout } from '../../scripts/Session'
import { auth } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './Header.css'


const Header = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        onAuthStateChanged(auth, user => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        })        
    }, [])

    // console.log(auth.currentUser)

    return (
        <header className='header'>
            <div className='heading-text-container'>
                <div className='heading-text'>
                    <p className='header-heading-text'>Cyclic Tasks</p>
                </div>
            </div>

            <div className='login-logout-btn-container'>
                {
                    user ? (
                        <button className='btn' onClick={() => logout(setUser)}>Logout</button>
                    ) : (
                        <button className='btn' onClick={() => GoogleLogin(setUser)}>Login</button>
                    )
                }
            </div>

        </header>
    )
}

export default Header