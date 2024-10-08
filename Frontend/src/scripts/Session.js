import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../config/firebase";

import { analytics } from "../config/firebase";
import { logEvent } from "firebase/analytics";

const GoogleLogin = async (setUser) => {
    signInWithPopup(auth, provider)
        .then((result) => {
            logEvent(analytics, 'user-login', {
                method: 'google',
            });

            const user = result.user;

            const loggedInUser = {
                name: user.displayName,
                email: user.email,
                photo: user.photoURL
            }

            setUser(loggedInUser);

            localStorage.setItem('user', JSON.stringify(loggedInUser));

            auth.currentUser.getIdToken(true)
                .then((idToken) => {
                    // console.log(idToken);
                })
        }
        )
}

const logout = (setUser) => {
    logEvent(analytics, 'user-logout');

    signOut(auth)
    setUser(null);
    localStorage.removeItem('user');
}

export { GoogleLogin, logout }


