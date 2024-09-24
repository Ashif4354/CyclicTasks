import { useState, useEffect } from 'react'

import './App.css'
import { GoogleLogin, logout } from './scripts/Session';
import { getTasks } from './scripts/getTasks';

import EachTask from './Components/EachTask/EachTask';

function App() {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState(null);
    const [changes, setChanges] = useState({ create: [], update: [], delete: [], changes: false });

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        const User = JSON.parse(loggedInUser);
        if (loggedInUser) {
            setUser(User);
        } else {
            return;
        }
        getTasks(User.email, setTasks);
    }, []);

    return (
        <div className='main-container'>
            <div className='header-container'>
                <header className='header'>
                    <div className='heading-text-container'>
                        <div className='heading-text'>
                            <h2>Cyclic Tasks</h2>
                        </div>
                    </div>

                    <div className='login-logout-btn-container'>
                        {
                            user ? (
                                <button className='btn' onClick={() => logout(setUser)}>Logout</button>
                            ) : (
                                <button className='btn' onClick={() => GoogleLogin(setUser)}>Login</button>
                            )
                        }

                    </div>

                </header>
            </div>

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
                                    <button className='btn taskBtn'>Add Task</button>
                                </div>

                                <div className='tasks-list-container'>
                                    {
                                        tasks ? (
                                            tasks.map((task, index) => {
                                                // console.log(task.task_name, index);
                                                return (
                                                    // <p key={index}>{task.task_name}</p>
                                                    <div key={index}>
                                                        <EachTask index={index} task={task} changes={changes} setChanges={setChanges} />
                                                    </div>

                                                )

                                            })  
                                        ) : (
                                            <div className='no-task-text-container'>
                                                <h4>You are yet to add tasks..</h4> 
                                            </div>
                                            
                                        )


                                    }

                                </div>


                            </div>

                        ) : (
                            // <div>Hello</div>
                            <div />
                        )
                    }


                </div>

            </div>
        </div>
    )
}

export default App
