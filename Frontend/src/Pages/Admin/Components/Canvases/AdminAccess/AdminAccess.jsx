import { useEffect, useState } from 'react';

import './AdminAccess.css';
import SnackBar from '../../../../../Components/SnackBar/Snackbar';
import EachAdmin from './Components/EachAdmin/EachAdmin';
import GrantAdminDialog from './Components/GrantAdminDialog/GrantAdminDialog';

const AdminAccess = (props) => {
    const { admin, users } = props;

    const [admins, setAdmins] = useState([]);
    const [grantDialogOpen, setGrantDialogOpen] = useState(false);

    const [grantSuccessSnackBarOpen, setGrantSuccessSnackBarOpen] = useState(false);
    const [grantFailedSnackBarOpen, setGrantFailedSnackBarOpen] = useState(false);

    const [revokeSuccessSnackBarOpen, setRevokeSuccessSnackBarOpen] = useState(false);
    const [revokeFailedSnackBarOpen, setRevokeFailedSnackBarOpen] = useState(false);

    const getAdmins = async () => {
        admin.getIdToken(true).then(token => {
            fetch(import.meta.env.VITE_CT_SERVER_URL + '/admin/getadmins', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        setAdmins(data.admins);
                    } else {
                        console.err(data.message);
                    }
                })
        })
    }

    useEffect(() => {
        getAdmins();
    }, []);

    return (
        <div className="console-canvas">
            <div className='console-canvas-heading-container'>
                <h2 className='console-canvas-heading'>Admin Access</h2>
            </div>
            <div className='console-canvas-content'>
                <div className='admins-scroll-container'>
                    {
                        admins.map((user, index) => {
                            return (
                                <div key={index}>
                                    <EachAdmin
                                        index={index}
                                        user={user}
                                        admin={admin}
                                        admins={admins}
                                        setAdmins={setAdmins}
                                        setRevokeFailedSnackBarOpen={setRevokeFailedSnackBarOpen}
                                        setRevokeSuccessSnackBarOpen={setRevokeSuccessSnackBarOpen}
                                    />
                                </div>
                            )
                        })
                    }
                </div>

                <div className='grant-btn-container'>
                    <button className='btn' onClick={() => setGrantDialogOpen(true)}>Grant New Admin</button>
                </div>
            </div>

            <GrantAdminDialog
                open={grantDialogOpen}
                setOpen={setGrantDialogOpen}
                admin={admin}
                admins={admins}
                setAdmins={setAdmins}
                users={users}
                setGrantFailedSnackBarOpen={setGrantFailedSnackBarOpen}
                setGrantSuccessSnackBarOpen={setGrantSuccessSnackBarOpen}
            />


            <SnackBar
                open={grantSuccessSnackBarOpen}
                success={true}
                message='Admin Access Granted Successfully'
                handleClose={() => setGrantSuccessSnackBarOpen(false)}
            />

            <SnackBar
                open={grantFailedSnackBarOpen}
                success={false}
                message='Failed to Grant Admin Access'
                handleClose={() => setGrantFailedSnackBarOpen(false)}
            />

            <SnackBar
                open={revokeSuccessSnackBarOpen}
                success={true}
                message='Admin Access Revoked Successfully'
                handleClose={() => setRevokeSuccessSnackBarOpen(false)}
            />

            <SnackBar
                open={revokeFailedSnackBarOpen}
                success={false}
                message='Failed to Revoke Admin Access'
                handleClose={() => setRevokeFailedSnackBarOpen(false)}
            />


        </div>
    )
}

export default AdminAccess;