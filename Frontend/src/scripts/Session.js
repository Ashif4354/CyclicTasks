import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../config/firebase";

import { analytics } from "../config/firebase";
import { logEvent } from "firebase/analytics";

const GoogleLogin = async () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            logEvent(analytics, 'user-login', {
                method: 'google',
            });
        })
}

const logout = () => {
    logEvent(analytics, 'user-logout');

    signOut(auth)
}

export { GoogleLogin, logout }


