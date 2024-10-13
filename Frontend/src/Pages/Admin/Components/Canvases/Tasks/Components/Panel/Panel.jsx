import './Panel.css';
import EachPanelTask from '../EachPanelTask/EachPanelTask';
import { useEffect, useState } from 'react';
import { Paper, TextField, MenuItem, Menu, Skeleton } from '@mui/material';
import SnackBar from '../../../../../../../Components/SnackBar/Snackbar';
import SuspendTasksDialog from '../SuspendTasksDialog/SuspendTasksDialog';

const Panel = (props) => {
    const { tabValue, user, recaptchaRef, adminPassword, tasks, setTasks } = props;

    const [searchText, setSearchText] = useState('');
    const [searchBy, setSearchBy] = useState('task_name');
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [selectNone, setSelectNone] = useState(false);
    const [tasksLoading, setTasksLoading] = useState(false);

    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
    const [suspendSuccessSnackBarOpen, setSuspendSuccessSnackBarOpen] = useState(false);
    const [suspendFailedSnackBarOpen, setSuspendFailedSnackBarOpen] = useState(false);

    const onSearchTextChange = (e) => {
        setSearchText(e.target.value.toLowerCase());
        onSelectNone();
    }

    const onSelectNone = () => {
        setSelectNone(true);
        setSelectedTasks([]);
    }



    const getAllTasks = async () => {
        setTasksLoading(true);
        const recaptchaToken = await recaptchaRef.current.executeAsync();
        recaptchaRef.current.reset();

        fetch(import.meta.env.VITE_CT_SERVER_URL + '/admin/getalltasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password: adminPassword,
                recaptchaToken: recaptchaToken
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setTasks(data.tasks);
                } else {
                    console.error("Server Error: ", data.message);
                }
                setTasksLoading(false);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const onSuspendTasks = async () => {
        setSuspendDialogOpen(true);
    }

    return (
        <div className='panel-container'>
            {
                tabValue === '3' ? (
                    <div className='panel-user-container'>
                        <span>User Name: {user?.name}</span>
                        <span>User Email: {user?.email}</span>

                    </div>
                ) : (
                    <div />
                )
            }

            {
                tabValue === '1' && tasks.length == 0 ? (
                    <div className='panel-all-tasks-button-container'>
                        <button
                            className='btn'
                            onClick={getAllTasks}
                        >
                            Get All Tasks
                        </button>
                    </div>
                ) : (
                    <div />
                )
            }

            {
                tasks.length != 0 ? (
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
                                    width: '600px',
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
                                <MenuItem value={'task_name'}>Task Name</MenuItem>
                                <MenuItem value={'task_id'}>Task ID</MenuItem>
                                <MenuItem value={'url'}>URL</MenuItem>
                                <MenuItem value={'user_name'}>User Name</MenuItem>
                                <MenuItem value={'user_email'}>User Email</MenuItem>
                                <MenuItem value={'all'}>All</MenuItem>
                            </TextField>

                        </Paper>
                    </div>
                ) : (
                    <div />
                )
            }

            <div className='panel-tasks-container'>

                {
                    !tasksLoading ? (

                        tasks.filter(task => {
                            if (searchBy === 'task_name') {
                                return task.task_name.toLowerCase().includes(searchText);
                            } else if (searchBy === 'task_id') {
                                return task.id.toLowerCase().includes(searchText);
                            } else if (searchBy === 'url') {
                                return task.url.toLowerCase().includes(searchText);
                            } else if (searchBy === 'user_name') {
                                return task.user_name.toLowerCase().includes(searchText);
                            } else if (searchBy === 'user_email') {
                                return task.user_email.toLowerCase().includes(searchText);
                            } else {
                                return (
                                    task.task_name.toLowerCase().includes(searchText) ||
                                    task.id.toLowerCase().includes(searchText) ||
                                    task.url.toLowerCase().includes(searchText) ||
                                    task.user_name.toLowerCase().includes(searchText) ||
                                    task.user_email.toLowerCase().includes(searchText)
                                );
                            }
                        }).map((task, index) => {
                            return (
                                <div key={index}>
                                    <EachPanelTask
                                        task={task}
                                        tabValue={tabValue}
                                        selectNone={selectNone}
                                        setSelectNone={setSelectNone}
                                        selectedTasks={selectedTasks}
                                        setSelectedTasks={setSelectedTasks}
                                        adminPassword={adminPassword}
                                    />
                                </div>
                            )
                        })


                    ) : (
                        <div>
                            <Skeleton
                                variant='rectangular'
                                width={'720px'}
                                height={window.innerWidth > 750 ? '213px' : '184px'}
                                sx={{ bgcolor: 'rgba(18, 18, 18, 0.3)', borderRadius: '20px', marginBottom: '10px' }}
                            />
                            <Skeleton
                                variant='rectangular'
                                width={'720px'}
                                height={window.innerWidth > 750 ? '213px' : '184px'}
                                sx={{ bgcolor: 'rgba(18, 18, 18, 0.3)', borderRadius: '20px', marginBottom: '10px' }}
                            />
                            <Skeleton
                                variant='rectangular'
                                width={'720px'}
                                height={window.innerWidth > 750 ? '213px' : '184px'}
                                sx={{ bgcolor: 'rgba(18, 18, 18, 0.3)', borderRadius: '20px', marginBottom: '10px' }}
                            />
                        </div>

                    )
                }

            </div>
            {
                tasks.length != 0 ? (
                    <div className='panel-selected-tasks-container'>
                        <span style={{ marginTop: '10px' }}>Selection: </span>

                        <div className='selection-btns'>
                            <button className='user-btn' onClick={onSelectNone} disabled={selectedTasks.length == 0}> Select None</button>
                            <button className='user-btn' onClick={onSuspendTasks} disabled={selectedTasks.length == 0}> Suspend Tasks</button>
                        </div>
                    </div>
                ) : (
                    <div />
                )
            }

            <SnackBar
                open={suspendSuccessSnackBarOpen}
                success={true}
                handleClose={() => setSuspendSuccessSnackBarOpen(false)}
                message='Tasks Suspended Successfully'
            />

            <SnackBar
                open={suspendFailedSnackBarOpen}
                success={false}
                handleClose={() => setSuspendFailedSnackBarOpen(false)}
                message='Failed to suspend tasks'
            />

            <SuspendTasksDialog
                open={suspendDialogOpen}
                setOpen={setSuspendDialogOpen}
                setLoading={(x) => x}
                tasks={selectedTasks}
                adminPassword={adminPassword}
                onSelectNone={onSelectNone}
                setSuccessSnackBarOpen={setSuspendSuccessSnackBarOpen}
                setFailedSnackBarOpen={setSuspendFailedSnackBarOpen}
            />
        </div>
    )
}


export default Panel;   