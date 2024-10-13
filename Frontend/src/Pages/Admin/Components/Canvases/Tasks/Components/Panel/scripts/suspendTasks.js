const suspendTasks = async (tasks, recaptchaRef, adminPassword, setDialogOpen,
    setLoading, setSuccessSnackBarOpen, setFailedSnackBarOpen, setErrorText, onSelectNone) => {

    setLoading(true);   
    setErrorText(''); 

    console.log(tasks)

    const recaptchaToken = await recaptchaRef.current.executeAsync();
    recaptchaRef.current.reset();

    fetch(import.meta.env.VITE_CT_SERVER_URL + '/admin/users/suspendtasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            password: adminPassword,
            recaptchaToken: recaptchaToken,
            tasks: tasks.map(task => task.task)
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setSuccessSnackBarOpen(true);
                setDialogOpen(false);
                onSelectNone(); 
                tasks.forEach(task => {
                    task.setActive(false);                    
                });

            } else {
                setFailedSnackBarOpen(true);
                setErrorText('*' + data.message);
            }

            setLoading(false);
        })
        .catch((error) => {
            console.error('Error:', error);
            setFailedSnackBarOpen(true);
            setErrorText('* An error occurred. Please try again later.');
        });
}


export default suspendTasks;