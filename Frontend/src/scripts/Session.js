import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../config/firebase";

import { analytics } from "../config/firebase";
import { logEvent } from "firebase/analytics";

const GoogleLogin = async (setOpen) => {
    signInWithPopup(auth, provider)
        .then((result) => {
            logEvent(analytics, 'user-login', {
                method: 'google',
            });
            setOpen(false);
        })
}

const logout = () => {
    logEvent(analytics, 'user-logout');

    signOut(auth)
}

export { GoogleLogin, logout }


