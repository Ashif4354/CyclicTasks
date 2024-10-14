import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';

import './Admin.css';
import Header from '../../Components/Header/Header';
import Footer from './../../Components/Footer/Footer'
import AdminVerifyDialog from './Components/AdminVerifyDialog/AdminVerifyDialog';
import ServerStats from './Components/Canvases/ServerStats/ServerStats';
import EnableDisableLogs from './Components/Canvases/EnableDisableLogs/EnableDisableLogs';
import Tasks from './Components/Canvases/Tasks/Tasks';
import Users from './Components/Canvases/Users/Users';
import AdminAccess from './Components/Canvases/AdminAccess/AdminAccess';


const Admin = (props) => {

    const [adminVerifyDialog, setAdminVerifyDialogOpen] = useState(true);
    const [signedIn, setSignedIn] = useState(false);
    const [admin, setAdmin] = useState(null);
    const [owner, setOwner] = useState(false);

    const [users, setUsers] = useState([]);
    const [showTasksUser, setShowTasksUser] = useState(null);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            setSignedIn(false)
            setAdminVerifyDialogOpen(true);
            setAdmin(user);
        });
    }, []);

    return (
        <div className='main-container'>
            <Header heading='Cyclic Tasks Admin Console' />

            <div className='console-container'>
                {
                    signedIn ? (
                        <div className='canvases'>
                            <div className='first-pane'>
                                <ServerStats />
                                <EnableDisableLogs />
                                {
                                    owner ? (
                                        <AdminAccess admin={admin} users={users}/>
                                    ) : (
                                        <div />
                                    )
                                }
                            </div>

                            <div className='second-pane'>
                                <Users
                                    users={users}
                                    setUsers={setUsers}
                                    setShowTasksUser={setShowTasksUser}
                                />
                                <Tasks
                                    showTasksUser={showTasksUser}
                                    setShowTasksUser={setShowTasksUser}
                                />
                            </div>

                        </div>
                    ) : (
                        <div className='nothing-container'>
                            {
                                adminVerifyDialog ? (
                                    <div />
                                ) : (
                                    <h2>Refresh the page to sign in</h2>
                                )
                            }
                        </div>
                    )
                }
            </div>

            <Footer />
            <AdminVerifyDialog open={adminVerifyDialog} setOpen={setAdminVerifyDialogOpen} setSignedIn={setSignedIn} setOwner={setOwner}/>

        </div>
    );
}

export default Admin;