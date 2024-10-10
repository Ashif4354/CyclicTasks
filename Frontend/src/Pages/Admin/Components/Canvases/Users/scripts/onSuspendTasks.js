
const onSuspendTasks = async (setLoading, setBtnDisabled, recaptchaRef, adminPassword,
    emails, setSelectNone, setSuccessSnackBarOpen, setOpen, setFailedSnackBarOpen, setErrorText
) => {
    console.log('onSuspendTasks');
    setLoading(true);
    setBtnDisabled(true);

    const recaptchaToken = await recaptchaRef.current.executeAsync();
    recaptchaRef.current.reset();

    fetch(import.meta.env.VITE_CT_SERVER_URL + '/admin/users/suspenduserstasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            recaptchaToken: recaptchaToken,
            password: adminPassword,
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

