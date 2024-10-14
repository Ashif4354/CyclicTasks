

const grantRevokeAdmin = async (admin, email, addOrRemove, admins, setAdmins, recaptchaRef,
    setOpen, setSuccessSnackBarOpen, setFailedSnackBarOpen, setErrorText, setLoading, setBtnDisabled
) => {

    if (addOrRemove) {
        if (admins.find(admin => admin.email === email)) {
            setErrorText('* User is already an admin');
            setFailedSnackBarOpen(true);
            setLoading(false);
            setBtnDisabled(false);
            return;
        }
    }

    const recaptchaToken = await recaptchaRef.current.executeAsync();
    recaptchaRef.current.reset();

    admin.getIdToken(true).then(token => {
        fetch(import.meta.env.VITE_CT_SERVER_URL + '/admin/grantrevokeadmin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                email: email,
                admin: addOrRemove,
                recaptchaToken: recaptchaToken
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (addOrRemove) {
                        setAdmins([...admins, { email: email }]);
                        setSuccessSnackBarOpen(true);
                    } else {
                        setAdmins(admins.filter(admin => admin.email !== email));
                        setSuccessSnackBarOpen(true);
                    }
                    setOpen(false);
                } else {
                    setErrorText('*' + data.message);
                    setFailedSnackBarOpen(true);
                }
                setLoading(false);
                setBtnDisabled(false);
            })
            .catch((error) => {
                console.error('Error:', error);
                setErrorText('* An error occurred. Please try again later.');
                setFailedSnackBarOpen(true);
                setLoading(false);
                setBtnDisabled(false);
            });
    })
}

export default grantRevokeAdmin;