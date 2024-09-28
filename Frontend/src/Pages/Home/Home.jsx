import { useState, useEffect } from 'react'
import { Skeleton } from '@mui/material';

import { analytics } from '../../config/firebase';
import { logEvent } from 'firebase/analytics';

import './Home.css'
import EachTask from './Components/EachTask/EachTask';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import SnackBar from './Components/SnackBar/Snackbar';
import { getTasks } from './scripts/getTasks';
import { TaskDialog } from './Components/TaskDialog/TaskDialog';

const Home = () => {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [noTask, setNoTask] = useState(false);
    const [successDeleteSnackBarOpen, setSuccessDeleteSnackBarOpen] = useState(false);
    const [failedDeleteSnackBarOpen, setFailedDeleteSnackBarOpen] = useState(false);
    const [successAddSnackBarOpen, setSuccessAddSnackBarOpen] = useState(false);
    const [failedAddSnackBarOpen, setFailedAddSnackBarOpen] = useState(false);

    const onAddTask = () => {
        logEvent(analytics, 'add-task-dialog-open')
        setDialogOpen(true);    
    }

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        const User = JSON.parse(loggedInUser);

        if (loggedInUser) {
            setUser(User);
        } else {
            return;
        }

    }, []);

    useEffect(() => {
        setTasks(null)
        setNoTask(false);

        if (user) {
            getTasks(user.email, setTasks, setNoTask);
        }

    }, [user])

    return (
        <div className='main-container'>
            <Header user={user} setUser={setUser} />

            <div className='content-container'>
                <div className='middle-container'>
                    <div className="user-container">
                        {
                            user ? (
                                <>
                                    <img src={user?.photo} alt="user" className='user-image' />
                                    <div className='user-text-container'>
                                        <p className='user-text'>User Name: {user?.name}</p>
                                        <p className='user-text'>User Email: {user?.email}</p>

                                    </div>

                                </>
                            ) : (
                                <p>Login to continue</p>
                            )
                        }
                    </div>

                    {
                        user ? (
                            <div className='task-container'>
                                <div className='tasks-heading-container'>
                                    <h3>My Tasks</h3>
                                </div>

                                <div className='tasks-btn-container'>
                                    <button
                                        className='btn taskBtn'
                                        onClick={onAddTask}
                                    >Add Task</button>
                                </div>

                                <div className='tasks-list-container'>
                                    {
                                        tasks ? (
                                            tasks.map((task, index) => {
                                                return (
                                                    <div key={index}>
                                                        <EachTask
                                                            index={index}
                                                            task={task}
                                                            tasks={tasks}
                                                            setTasks={setTasks}
                                                            setSuccessDeleteSnackBarOpen={setSuccessDeleteSnackBarOpen}
                                                            setFailedDeleteSnackBarOpen={setFailedDeleteSnackBarOpen}
                                                        />
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className='no-task-container'>
                                                {
                                                    noTask ? (
                                                        <h4>You dont have any tasks yet, Add a task to proceed</h4>
                                                    ) : (
                                                        <>
                                                            <Skeleton
                                                                variant='rectangular'
                                                                width={'100%'}
                                                                height={'100px'}
                                                                sx={{ bgcolor: 'rgba(18, 18, 18, 0.3)', borderRadius: '20px', marginBottom: '10px' }}
                                                            />
                                                            <Skeleton
                                                                variant='rectangular'
                                                                width={'100%'}
                                                                height={'100px'}
                                                                sx={{ bgcolor: 'rgba(18, 18, 18, 0.3)', borderRadius: '20px', marginBottom: '10px' }}
                                                            />
                                                            <Skeleton
                                                                variant='rectangular'
                                                                width={'100%'}
                                                                height={'100px'}
                                                                sx={{ bgcolor: 'rgba(18, 18, 18, 0.3)', borderRadius: '20px', marginBottom: '10px' }}
                                                            />
                                                            <Skeleton
                                                                variant='rectangular'
                                                                width={'100%'}
                                                                height={'100px'}
                                                                sx={{ bgcolor: 'rgba(18, 18, 18, 0.3)', borderRadius: '20px', marginBottom: '10px' }}
                                                            />
                                                        </>
                                                    )
                                                }
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        ) : (
                            <div />
                        )
                    }
                </div>
            </div>
            <Footer />
            <TaskDialog
                open={dialogOpen} setOpen={setDialogOpen} type={'Add'}
                task={null} settask={null} tasks={tasks} setTasks={setTasks}                
                setSuccessAddSnackBarOpen={setSuccessAddSnackBarOpen}
                setFailedAddSnackBarOpen={setFailedAddSnackBarOpen}
            />
            <SnackBar
                open={successAddSnackBarOpen}
                handleClose={() => setSuccessAddSnackBarOpen(false)}
                success={true}
                message='Task added successfully!'
            />

            <SnackBar
                open={failedAddSnackBarOpen}
                handleClose={() => setFailedAddSnackBarOpen(false)}
                success={false}
                message='Failed to add task! Try again.'
            />

            <SnackBar
                open={successDeleteSnackBarOpen}
                handleClose={() => setSuccessDeleteSnackBarOpen(false)}
                success={true}
                message='Task deleted successfully!'
            />
            <SnackBar
                open={failedDeleteSnackBarOpen}
                handleClose={() => setFailedDeleteSnackBarOpen(false)}
                success={false}
                message='Failed to delete task! Try again.' 
            />
        </div>
    )
}

export default Home;
