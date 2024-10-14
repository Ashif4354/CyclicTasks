import { auth } from '../../../../../../config/firebase';

const onSuspendTasks = async (setLoading, setBtnDisabled, recaptchaRef,
    emails, setSelectNone, setSuccessSnackBarOpen, setOpen, setFailedSnackBarOpen, setErrorText
) => {
    setLoading(true);
    setBtnDisabled(true);
    
    console.log(1)
    const recaptchaToken = await recaptchaRef.current.executeAsync();
    recaptchaRef.current.reset();
    console.log(2)

    fetch(import.meta.env.VITE_CT_SERVER_URL + '/admin/users/suspenduserstasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + await auth.currentUser.getIdToken(true)
        },
        body: JSON.stringify({
            recaptchaToken: recaptchaToken,
            emails: emails
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setSuccessSnackBarOpen(true);
                setOpen(false);
                setSelectNone(true);
            } else {
                setFailedSnackBarOpen(true);
                setErrorText('*' + data.message);
            }
            setLoading(false);
            setBtnDisabled(false);
        })
        .catch(error => {
            setFailedSnackBarOpen(true);
            setErrorText('* An error occurred. Please try again later.');
            setLoading(false);
            setBtnDisabled(false);
        })
}


export default onSuspendTasks;

