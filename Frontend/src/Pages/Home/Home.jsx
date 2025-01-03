import { useState, useEffect, useRef } from 'react'
import { Skeleton } from '@mui/material';
import { logEvent } from 'firebase/analytics';
import { onAuthStateChanged } from 'firebase/auth';
import { analytics, auth } from '../../config/firebase';
import ReCAPTCHA from 'react-google-recaptcha';

import './Home.css'
import EachTask from './Components/EachTask/EachTask';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import SnackBar from '../../Components/SnackBar/Snackbar';
import { getTasks } from './scripts/getTasks';
import { TaskDialog } from './Components/TaskDialog/TaskDialog';

const Home = () => {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [noTask, setNoTask] = useState(false);
    const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
    const [successDeleteSnackBarOpen, setSuccessDeleteSnackBarOpen] = useState(false);
    const [failedDeleteSnackBarOpen, setFailedDeleteSnackBarOpen] = useState(false);
    const [successAddSnackBarOpen, setSuccessAddSnackBarOpen] = useState(false);
    const [failedAddSnackBarOpen, setFailedAddSnackBarOpen] = useState(false);

    const recaptchaRef = useRef();

    const onAddTask = () => {
        logEvent(analytics, 'add-task-dialog-open')
        setDialogOpen(true);
    }

    useEffect(() => {

        if (recaptchaLoaded) {

            const unSubscribe = onAuthStateChanged(auth, user => {
                if (user) {
                    setUser(user);
                } else {
                    setUser(null);
                }
            })

        }

    }, [recaptchaLoaded]);

    useEffect(() => {
        setNoTask(false);
        setRecaptchaLoaded(false)

        if (user) {
            getTasks(user, setTasks, setNoTask, recaptchaRef);
        } else {
            setTasks(null);
        }

    }, [user])

    return (
        <div className='main-container'>
            <Header heading='Cyclic Tasks' />

            <div className='content-container'>
                <div className='middle-container'>
                    <div className="user-container">
                        {
                            user ? (
                                <>
                                    <img src={user?.photoURL} alt="user" className='user-image' />
                                    <div className='user-text-container'>
                                        <p className='user-text'>User Name: {user?.displayName}</p>
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
                                                        <h4>You don't have any tasks yet, Add a task to proceed</h4>
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
                task={null} setTask={null} tasks={tasks} setTasks={setTasks}
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

            <ReCAPTCHA
                sitekey={import.meta.env.VITE_G_RECAPTCHA_SITE_KEY}
                asyncScriptOnLoad={() => setRecaptchaLoaded(true)}
                size='invisible'
                ref={recaptchaRef}
            />

        </div>
    )
}

export default Home;
