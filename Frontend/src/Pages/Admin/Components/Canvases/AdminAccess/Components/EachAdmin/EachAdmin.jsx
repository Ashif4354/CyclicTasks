
import { useState } from 'react';
import './EachAdmin.css';
import RevokeAdminDialog from '../RevokeAdminDialog/RevokeAdminDialog';

const EachAdmin = (props) => {
    const { index, user, admin, admins, setAdmins, setRevokeFailedSnackBarOpen, setRevokeSuccessSnackBarOpen } = props;

    const [dialogOpen, setDialogOpen] = useState(false);

    const onRevoke = () => {
        setDialogOpen(true);
    }

    return (
        <div className='admins-container'>
            <div className='admin-user-text-container'>
                <span className='admin-email-text'>{index + 1}.  {user.email}</span>
            </div>
            <div className='revoke-btn-container'>
                <button className='btn' onClick={onRevoke}>Revoke</button>
            </div>

            <RevokeAdminDialog
                open={dialogOpen}
                setOpen={setDialogOpen}
                user={user}
                admin={admin}
                admins={admins}
                setAdmins={setAdmins}
                setRevokeFailedSnackBarOpen={setRevokeFailedSnackBarOpen}
                setRevokeSuccessSnackBarOpen={setRevokeSuccessSnackBarOpen}
            />
        </div>
    )
}

export default EachAdmin;