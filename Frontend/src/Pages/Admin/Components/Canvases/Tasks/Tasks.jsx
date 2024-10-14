import { useState, useRef, useEffect } from 'react';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import ReCAPTCHA from 'react-google-recaptcha';

import './Tasks.css';
import Panel from './Components/Panel/Panel';
import { auth } from '../../../../../config/firebase';

const Tasks = (props) => {

    const { showTasksUser, setShowTasksUser } = props

    const [tabValue, setTabValue] = useState('2');
    const [runningTasks, setRunningTasks] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [userTasks, setUserTasks] = useState([]);
    const recaptchaRef = useRef();

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue != '3') {
            setShowTasksUser(null);
        }
    };

    const getUserTasks = async () => {
        const recaptchaToken = await recaptchaRef.current.executeAsync();
        recaptchaRef.current.reset();

        fetch(import.meta.env.VITE_CT_SERVER_URL + '/admin/users/getusertasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + await auth.currentUser.getIdToken(true)
            },
            body: JSON.stringify({
                email: showTasksUser.email,
                recaptchaToken: recaptchaToken
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setUserTasks(data.tasks);
                } else {
                    console.error("Server Error ", data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const getRunningTasks = async () => {

        fetch(import.meta.env.VITE_CT_SERVER_URL + '/admin/getrunningtasks',{
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + await auth.currentUser.getIdToken(true)
            }

        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {

                    // setRunningTasks(Object.keys(data.tasks).map((id) => data.tasks[id].task_data))
                    setRunningTasks(Object.keys(data.tasks).map((id) => {
                        return {
                            ...data.tasks[id].task_data, 
                            active: data.tasks[id].current_running_task ? true : false,
                            deleted: data.tasks[id].deleted
                        }
                    }))

                } else {
                    console.error("Server Error: ", data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    useEffect(() => {
        if (showTasksUser != null) {
            setTabValue('3');
            getUserTasks();
        }
    }, [showTasksUser])

    useEffect(() => {
        getRunningTasks();
    }, [])

    return (
        <div className="console-canvas">
            <div className='console-canvas-heading-container'>
                <h2 className='console-canvas-heading'>Tasks</h2>
            </div>
            <div className='console-canvas-content'>
                <TabContext value={tabValue}>
                    <TabList onChange={handleChange} TabIndicatorProps={{ sx: { backgroundColor: 'white' } }}>

                        <Tab label="All Tasks" value="1" sx={{ color: 'white', '&.Mui-selected': { color: 'white' } }} />
                        <Tab label="Running Tasks" value="2" sx={{ color: 'white', '&.Mui-selected': { color: 'white' } }} />
                        {
                            showTasksUser ? (
                                <Tab label="User Tasks" value="3" sx={{ color: 'white', '&.Mui-selected': { color: 'white' } }} />
                            ) : (
                                <div />
                            )
                        }

                    </TabList>
                    <TabPanel value="1" sx={{ padding: '0px' }}>
                        <Panel
                            tabValue={tabValue}
                            recaptchaRef={recaptchaRef}
                            tasks={allTasks}
                            setTasks={setAllTasks}

                        />
                    </TabPanel>
                    <TabPanel value="2" sx={{ padding: '0px' }}>
                        <Panel tasks={runningTasks} tabValue={tabValue} />
                    </TabPanel>
                    <TabPanel value="3" sx={{ padding: '0px' }}>
                        <Panel tasks={userTasks} tabValue={tabValue} user={showTasksUser} />
                    </TabPanel>
                </TabContext>

            </div>
            <ReCAPTCHA
                sitekey={import.meta.env.VITE_G_RECAPTCHA_SITE_KEY}
                ref={recaptchaRef}
                size="invisible"
            />

        </div>
    );
}

export default Tasks;