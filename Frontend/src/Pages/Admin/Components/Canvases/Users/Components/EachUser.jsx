import React, { useEffect, useState } from 'react';
import Checkbox from '@mui/material/Checkbox';

import './EachUser.css';
import SnackBar from '../../../../../../Components/SnackBar/Snackbar';
import SuspendTasksDialog from './Dialogs/SuspendTaskDialog/SuspendTaskDialog';
import BlockUnblockUserDialog from './Dialogs/BlockUnblockUserDialog/BlockUnblockUserDialog';


const EachUser = (props) => {
    const { user, selectNone, setSelectNone, selectedUsers, setSelectedUsers, 
        adminPassword, setShowTasksUser } = props;

    const [blocked, setBlocked] = useState(user.blocked);
    const [checked, setChecked] = useState(false);

    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
    const [suspendSuccessSnackBarOpen, setSuspendSuccessSnackBarOpen] = useState(false);
    const [suspendFailedSnackBarOpen, setSuspendFailedSnackBarOpen] = useState(false);

    const [blockUnblockDialogOpen, setBlockUnblockDialogOpen] = useState(false);
    const [blockUnblockSuccessSnackBarOpen, setBlockUnblockSuccessSnackBarOpen] = useState(false);
    const [blockUnblockFailedSnackBarOpen, setBlockUnblockFailedSnackBarOpen] = useState(false);

    const onCheckboxChange = (e) => {
        setChecked(e.target.checked);

        if (e.target.checked) {
            setSelectNone(false);
            setSelectedUsers([...selectedUsers, {...user, setBlocked: setBlocked}]);
        } else {
            setSelectedUsers(selectedUsers.filter(selectedUser => selectedUser.email !== user.email));
        }
    }  

    const onSuspendTasks = () => {
        setSuspendDialogOpen(true);
    }

    useEffect(() => {
        if (selectNone) {
            setChecked(false);
        }
    }, [selectNone])

    return (
        <div className='each-user-container'>
            <div className='checkbox-container'>
                <Checkbox
                    checked={checked}
                    onChange={onCheckboxChange}
                    sx={{
                        color: 'white',
                        '&.Mui-checked': {
                            color: 'white'
                        }
                    }}
                />
            </div>
            <div className='inner-container'>
                <div className='user-info-container'>
                    <span>{user.name}&nbsp;&nbsp;</span>
                    <span>({user.email})</span>
                </div>
                <div className='user-actions-container'>
                    <button
                        className={
                            blocked ? 'user-btn user-btn-blocked' : 'user-btn'
                        }
                        onClick={() => setBlockUnblockDialogOpen(true)}
                    >
                        {
                            blocked ? 'Unblock' : 'Block'
                        }
                    </button>
                    <button className='user-btn' onClick={() => setShowTasksUser(user)}>Show Tasks</button>
                    <button className='user-btn' onClick={onSuspendTasks}>Suspend Tasks</button>
                </div>
            </div>

            <SnackBar
                open={suspendSuccessSnackBarOpen}
                success={true}
                message='Tasks Suspended Successfully'
                handleClose={() => setSuspendSuccessSnackBarOpen(false)}
            />

            <SnackBar
                open={suspendFailedSnackBarOpen}
                success={false}
                message='Failed to Suspend Tasks'
                handleClose={() => setSuspendFailedSnackBarOpen(false)}
            />

            <SnackBar
                open={blockUnblockSuccessSnackBarOpen}
                success={true}
                message={!blocked ? 'User Unblocked Successfully' : 'User Blocked Successfully'}
                handleClose={() => setBlockUnblockSuccessSnackBarOpen(false)}
            />

            <SnackBar
                open={blockUnblockFailedSnackBarOpen}
                success={false}
                message={!blocked ? 'Failed to Unblock User' : 'Failed to Block User'}
                handleClose={() => setBlockUnblockFailedSnackBarOpen(false)}
            />

            <SuspendTasksDialog
                open={suspendDialogOpen}
                setOpen={setSuspendDialogOpen}
                users={[{ email: user.email, name: user.name }]}
                setSelectNone={(x) => x}
                setSuccessSnackBarOpen={setSuspendSuccessSnackBarOpen}
                setFailedSnackBarOpen={setSuspendFailedSnackBarOpen}
                adminPassword={adminPassword}
            />

            <BlockUnblockUserDialog
                open={blockUnblockDialogOpen}
                setOpen={setBlockUnblockDialogOpen}
                users={[{...user, setBlocked: setBlocked}]}
                setSelectNone={(x) => x}
                block={!blocked}
                setSuccessSnackBarOpen={setBlockUnblockSuccessSnackBarOpen}
                setFailedSnackBarOpen={setBlockUnblockFailedSnackBarOpen}
                adminPassword={adminPassword}
            />



        </div>
    );
}


export default EachUser;