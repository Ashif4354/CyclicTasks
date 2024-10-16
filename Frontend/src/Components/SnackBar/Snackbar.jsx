import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const SnackBar = (props) => {
    const { open, handleClose, success, message } = props;
    
    return (
        <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
            <Alert
                onClose={props.handleClose}
                severity= {success ? "success" : "error"}
                variant="filled"
                sx={{ width: '100%', color: 'white' }}
            >
                {message}
            </Alert>
        </Snackbar>
    )
}

export default SnackBar;