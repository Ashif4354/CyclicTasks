

const onBlockUnblockUser = async ( 
    setLoading, setBtnDisabled, recaptchaRef, adminPassword, users, setSelectNone, block, setSuccessSnackBarOpen, setOpen, setFailedSnackBarOpen, setErrorText
) => {
    setLoading(true);
    setBtnDisabled(true);

    const recaptchaToken = await recaptchaRef.current.executeAsync();
    recaptchaRef.current.reset();

    fetch(import.meta.env.VITE_CT_SERVER_URL + '/admin/users/blockuser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            recaptchaToken: recaptchaToken,
            password: adminPassword,
            emails: users.map(user => user.email),
            block: block
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setSuccessSnackBarOpen(true);
                setOpen(false);
                setSelectNone(true);
                users.map(user => user.setBlocked(block));
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


export default onBlockUnblockUser;