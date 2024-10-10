import React, { useState } from 'react';
import Header from './Components/Header/Header';
import Footer from './../../Components/Footer/Footer'

import './Admin.css';
import PasswordDialog from './Components/PasswordDialog/PasswordDialog';
import ServerStats from './Components/Canvases/ServerStats/ServerStats';
import EnableDisableLogs from './Components/Canvases/EnableDisableLogs/EnableDisableLogs';
import Tasks from './Components/Canvases/Tasks/Tasks';
import Users from './Components/Canvases/Users/Users';


const Admin = () => {

    const [user, setUser] = useState(null);
    const [adminPassword, setAdminPassword] = useState('admin');
    const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
    const [signedIn, setSignedIn] = useState(true);

    return (
        <div className='main-container'>
            <Header />

            <div className='console-container'>
                {
                    signedIn ? (
                        <div className='canvases'>
                            <div className='first-pane'>
                                <ServerStats />
                                <EnableDisableLogs adminPassword={adminPassword} />
                            </div>

                            <div className='second-pane'>
                                <Users adminPassword={adminPassword}/>
                                <Tasks/>
                            </div>

                        </div>
                    ) : (
                        <div className='nothing-container'>
                            {
                                pwdDialogOpen ? (
                                    <div />
                                ) : (
                                    <h2>Refresh the page to sign in again</h2>
                                )
                            }
                        </div>
                    )
                }
            </div>

            <Footer />
            <PasswordDialog open={pwdDialogOpen} setOpen={setPwdDialogOpen} setSignedIn={setSignedIn} setAdminPassword={setAdminPassword} />

        </div>
    );
}

export default Admin;