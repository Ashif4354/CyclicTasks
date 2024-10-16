import { useState, useRef, useEffect } from 'react';
import { TextField, MenuItem, Skeleton, CircularProgress } from '@mui/material';
import Paper from '@mui/material/Paper';
import { IconButton } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import ReCAPTCHA from 'react-google-recaptcha';
import { auth } from '../../../../../config/firebase';

import './Users.css';
import EachUser from './Components/EachUser';
import SuspendTasksDialog from './Components/Dialogs/SuspendTaskDialog/SuspendTaskDialog';
import BlockUnblockUserDialog from './Components/Dialogs/BlockUnblockUserDialog/BlockUnblockUserDialog';
import SnackBar from '../../../../../Components/SnackBar/Snackbar';

const Users = (props) => {

    const { setShowTasksUser, users, setUsers } = props;

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchBy, setSearchBy] = useState('name');
    const [selectNone, setSelectNone] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [block, setBlock] = useState(false);
    const [selectionBtnsDisabled, setSelectionBtnsDisabled] = useState(true);
    const [usersLoading, setUsersLoading] = useState(true);

    const [selectedSuspendUsersTasksDialogOpen, setSelectedSuspendUsersTasksDialogOpen] = useState(false);
    const [selectedSuspendUsersTasksSuccessSnackBarOpen, setSelectedSuspendUsersTasksSuccessSnackBarOpen] = useState(false);
    const [selectedSuspendUsersTasksFailedSnackBarOpen, setSelectedSuspendUsersTasksFailedSnackBarOpen] = useState(false);

    const [selectedBlockUnblockUsersDialogOpen, setSelectedBlockUnblockUsersDialogOpen] = useState(false);
    const [selectedBlockUnblockUsersSuccessSnackBarOpen, setSelectedBlockUnblockUsersSuccessSnackBarOpen] = useState(false);
    const [selectedBlockUnblockUsersFailedSnackBarOpen, setSelectedBlockUnblockUsersFailedSnackBarOpen] = useState(false);

    const recaptchaRef = useRef();

    const onSearchTextChange = (e) => {
        setSearchText(e.target.value);
        onSelectNone();
    }

    const onSelectNone = () => {
        setSelectedUsers([]);
        setSelectNone(true);
    }

    const onSuspendSelected = () => {
        setSelectedSuspendUsersTasksDialogOpen(true);
    }

    const onBlockSelected = () => {
        setBlock(true);
        setSelectedBlockUnblockUsersDialogOpen(true);

    }

    const onUnblockSelected = () => {
        setBlock(false);
        setSelectedBlockUnblockUsersDialogOpen(true);

    }

    useEffect(() => {
        if (selectedUsers.length == 0) {
            setSelectionBtnsDisabled(true);
        } else {
            setSelectionBtnsDisabled(false);
        }
    }, [selectedUsers])


    const getUsers = async () => {
        setUsersLoading(true);

        const recaptchaToken = await recaptchaRef.current.executeAsync();
        recaptchaRef.current.reset();

        fetch(import.meta.env.VITE_CT_SERVER_URL + '/admin/getusers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await auth.currentUser.getIdToken(true)
            },
            body: JSON.stringify({
                recaptchaToken,

            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setUsers(data.users);
                } else {
                    console.error(data.message);
                }
                setUsersLoading(false);
            })
            .catch(error => {
                console.error(error);
                setUsersLoading(false);
            })

    }

    return (
        <div className="console-canvas">
            <div className='console-canvas-heading-container'>
                <h2 className='console-canvas-heading'>Users</h2>
            </div>
            <div className='console-canvas-content'>
                <div className='users-main-content'>
                    <div className='search-bar-container'>
                        <Paper sx={{ backgroundColor: '#393939', display: 'flex', marginTop: '5px', width: '100%' }}>
                            <TextField
                                id="filled-basic"
                                label="Search"
                                variant="outlined"
                                className='search-bar'
                                margin='none'
                                value={searchText}
                                onChange={onSearchTextChange}
                                sx={{
                                    width: '500px',
                                    color: 'white',
                                    backgroundColor: '#393939',
                                    borderRadius: '5px',
                                    '& label.MuiFormLabel-root': {
                                        color: 'white',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            border: '1px solid #666666ff',
                                        },
                                    },
                                    '& input': {
                                        color: 'white',
                                    }

                                }}
                                fullWidth
                            />
                            <TextField
                                id="filled-basic"
                                select
                                label="Search By"
                                variant="outlined"
                                className='search-bar'
                                value={searchBy}
                                onChange={(e) => setSearchBy(e.target.value)}
                                sx={{
                                    maxWidth: '120px',
                                    backgroundColor: '#393939',
                                    borderRadius: '5px',
                                    '& label.MuiFormLabel-root': {
                                        color: 'white',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            border: '1px solid #666666ff',
                                        },
                                        'color': 'white',
                                    }
                                }}
                                fullWidth
                            >
                                <MenuItem value={'name'}>Name</MenuItem>
                                <MenuItem value={'email'}>Email</MenuItem>
                                <MenuItem value={'both'}>Both</MenuItem>
                            </TextField>

                        </Paper>
                    </div>

                    <div className='users-list-container'>
                        <div className='total-container'>
                            <span>Total Users: {users.length}</span>
                            <IconButton
                                onClick={getUsers}
                                sx={{
                                    '&:hover': { backgroundColor: '#00000050' },
                                    marginLeft: '10px',
                                    display: usersLoading ? 'none' : 'flex'
                                }}
                            >
                                <ReplayIcon
                                    sx={{ color: 'white' }}
                                />
                            </IconButton>
                        </div>
                        {
                            users.length > 0 ? (

                                users.filter(user => {
                                    if (searchBy === 'name') {
                                        return user.name.toLowerCase().includes(searchText.toLowerCase());
                                    } else if (searchBy === 'email') {
                                        return user.email.toLowerCase().includes(searchText.toLowerCase());
                                    } else {
                                        return user.name.toLowerCase().includes(searchText.toLowerCase()) || user.email.toLowerCase().includes(searchText.toLowerCase());
                                    }
                                }).map((user, index) => {
                                    return (
                                        <div key={index}>
                                            <EachUser
                                                user={user}
                                                selectedUsers={selectedUsers}
                                                setSelectedUsers={setSelectedUsers}
                                                selectNone={selectNone}
                                                setSelectNone={setSelectNone}
                                                setShowTasksUser={setShowTasksUser}
                                            />
                                        </div>
                                    )
                                })

                            ) : (
                                <div className='no-user-container'>
                                    <Skeleton
                                        variant='rectangular'
                                        className='skeleton'
                                        width={'100%'}
                                        height={window.innerWidth > 750 ? '100px' : '150px'}
                                        sx={{ bgcolor: 'rgba(18, 18, 18, 0.3)', borderRadius: '20px', marginBottom: '10px' }}
                                    />
                                    <Skeleton
                                        variant='rectangular'
                                        width={'100%'}
                                        height={window.innerWidth > 750 ? '100px' : '150px'}
                                        sx={{ bgcolor: 'rgba(18, 18, 18, 0.3)', borderRadius: '20px', marginBottom: '10px' }}
                                    />
                                    <Skeleton
                                        variant='rectangular'
                                        width={'100%'}
                                        height={window.innerWidth > 750 ? '100px' : '150px'}
                                        sx={{ bgcolor: 'rgba(18, 18, 18, 0.3)', borderRadius: '20px', marginBottom: '10px' }}
                                    />
                                    <Skeleton
                                        variant='rectangular'
                                        width={'100%'}
                                        height={window.innerWidth > 750 ? '100px' : '150px'}
                                        sx={{ bgcolor: 'rgba(18, 18, 18, 0.3)', borderRadius: '20px', marginBottom: '10px' }}
                                    />
                                </div>
                            )
                        }
                    </div>
                    <div className='users-selection-btns-container'>
                        <span style={{ alignSelf: 'center' }}>Selected Users: {selectedUsers.length}</span>

                        <div className='selection-btns'>
                            <button className='user-btn' onClick={onSelectNone} disabled={selectionBtnsDisabled}>Select None</button>
                            <button className='user-btn' onClick={onSuspendSelected} disabled={selectionBtnsDisabled}>Suspend</button>
                            <button className='user-btn' onClick={onBlockSelected} disabled={selectionBtnsDisabled} >Block</button>
                            <button className='user-btn' onClick={onUnblockSelected} disabled={selectionBtnsDisabled} >Unblock</button>
                        </div>

                        <span style={{ color: 'red', fontWeight: 'bold', overflow: 'hidden' }}>{errorText}</span>

                    </div>
                </div>

            </div>

            <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_G_RECAPTCHA_SITE_KEY}
                size='invisible'
                asyncScriptOnLoad={getUsers}
            />

            <SuspendTasksDialog
                open={selectedSuspendUsersTasksDialogOpen}
                setOpen={setSelectedSuspendUsersTasksDialogOpen}
                users={selectedUsers}
                setSelectNone={setSelectNone}
                setSuccessSnackBarOpen={setSelectedSuspendUsersTasksSuccessSnackBarOpen}
                setFailedSnackBarOpen={setSelectedSuspendUsersTasksFailedSnackBarOpen}
            />

            <BlockUnblockUserDialog
                open={selectedBlockUnblockUsersDialogOpen}
                setOpen={setSelectedBlockUnblockUsersDialogOpen}
                users={selectedUsers}
                setSelectNone={setSelectNone}
                block={block}
                setSuccessSnackBarOpen={setSelectedBlockUnblockUsersSuccessSnackBarOpen}
                setFailedSnackBarOpen={setSelectedBlockUnblockUsersFailedSnackBarOpen}
            />


            <SnackBar
                open={selectedSuspendUsersTasksSuccessSnackBarOpen}
                success={true}
                message='Users Tasks Suspended Successfully'
                handleClose={() => setSelectedSuspendUsersTasksSuccessSnackBarOpen(false)}
            />

            <SnackBar
                open={selectedSuspendUsersTasksFailedSnackBarOpen}
                success={false}
                message='Failed to Suspend Users Tasks'
                handleClose={() => setSelectedSuspendUsersTasksFailedSnackBarOpen(false)}
            />

            <SnackBar
                open={selectedBlockUnblockUsersSuccessSnackBarOpen}
                success={true}
                message={!block ? 'Users Unblocked Successfully' : 'Users Blocked Successfully'}
                handleClose={() => setSelectedBlockUnblockUsersSuccessSnackBarOpen(false)}
            />

            <SnackBar
                open={selectedBlockUnblockUsersFailedSnackBarOpen}
                success={false}
                message='Failed to Block/Unblock Users'
                handleClose={() => setSelectedBlockUnblockUsersFailedSnackBarOpen(false)}
            />

        </div>
    );
}

export default Users;