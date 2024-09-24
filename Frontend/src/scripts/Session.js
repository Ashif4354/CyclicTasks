import { signInWithPopup ,signOut } from "firebase/auth";
import { auth, provider } from "../config/firebase";

const GoogleLogin = async (setUser) => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            
            const loggedInUser = {
                name: user.displayName,
                email: user.email,
                photo: user.photoURL
            }

            setUser(loggedInUser);

            localStorage.setItem('user', JSON.stringify(loggedInUser));
        }
    )
}

const logout = async (setUser) => {
    // console.log(auth)
    signOut(auth)
    setUser(null);
    localStorage.removeItem('user');
}

export { GoogleLogin, logout }


