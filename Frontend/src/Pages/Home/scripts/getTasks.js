import { analytics, auth } from "../../../config/firebase";
import { logEvent } from "firebase/analytics";

const getTasks = async (user, setTasks, setNoTask, recaptchaRef) => {
    logEvent(analytics, 'get-tasks', {
        method: 'get-tasks'
    });

    const recaptchaToken = await recaptchaRef.current.executeAsync();
    recaptchaRef.current.reset();

    fetch(import.meta.env.VITE_CT_SERVER_URL + '/tasks/getmytasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + user.accessToken
        },
        body: JSON.stringify({
            email: user.email,
            recaptchaToken: recaptchaToken
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.tasks.length === 0) {
                    setTasks(null);
                    setNoTask(true);
                } else {
                    setNoTask(false);
                    setTasks(data.tasks);
                }
            }
        })
        .catch(err => {
            console.log(err);

        })
}

export { getTasks }