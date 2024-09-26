
import './Header.css'
import { GoogleLogin, logout } from '../../scripts/Session'


const Header = (props) => {
    const {user, setUser} = props;

    return (
        <header className='header'>
            <div className='heading-text-container'>
                <div className='heading-text'>
                    <h2>Cyclic Tasks</h2>
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