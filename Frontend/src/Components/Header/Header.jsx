
import { GoogleLogin, logout } from '../../scripts/Session'
import './Header.css'


const Header = (props) => {
    const {user, setUser} = props;

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