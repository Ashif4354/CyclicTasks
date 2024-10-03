import React, { useState } from 'react';
import Header from './Components/Header/Header';
import Footer from './../../Components/Footer/Footer'

import './Admin.css';
import PasswordDialog from './Components/PasswordDialog/PasswordDialog';


const Admin = () => {

    const [user, setUser] = useState(null);
    const [open, setOpen] = useState(true);

    return (
        <div className='main-container'>
            <Header />

            <div className='console-container'>
            </div>

            <Footer/>
            <PasswordDialog open={open} setOpen={setOpen} />
            
        </div>
    );
}

export default Admin;