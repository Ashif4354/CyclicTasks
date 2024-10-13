import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import { onAuthStateChanged } from 'firebase/auth';


import './Start.css'
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import cycle from '../../assets/images/cycle.json';

const Start = () => {
    const navigate = useNavigate();

    return (
        <div className='main-container'>
            <Header/>
            <div className='content-container'>
                <div className='middle-box'>
                    <div className='lottie-container'>
                        <Player
                            autoplay
                            loop
                            src={cycle}
                        />
                    </div>
                    <div className='text-container'>
                        <span className='start-heading'>Boost Your Server Uptime with CyclicTasks!</span>
                        <p className='homepage-text'>Tired of your backend going offline on free hosting services?</p>
                        <p className='homepage-text'>CyclicTasks is here to help. Our app sends automated pulses to your server apps, keeping them live 24/7 even when using free deployment services! Don't let downtime slow you down.</p>
                        <p />
                        <div className='get-started-btn-container'>
                            <button className='btn get-started-btn' onClick={() => navigate('/home')}>Get Started</button>
                        </div>
                        <span className='start-sub-heading'>Who is it for?</span>
                        <p className='homepage-text'>Anyone hosting their apps on platforms that don't offer round-the-clock uptime. CyclicTasks is your simple, effective solution to maintain constant availability.</p>
                        <span className='start-sub-heading'>Key Benefits:</span>
                        <ul style={{ textAlign: 'left', marginTop:'0px' }}>
                            <li className='homepage-text'>Keep your servers running non-stop</li>
                            <li className='homepage-text'>Simple to use</li>
                            <li className='homepage-text'>Works with any backend system</li>
                            <li className='homepage-text'>Free</li>
                            <li className='homepage-text'>Automated</li>
                        </ul> 
                    </div>
                    <div className='scroll-text-container'>
                        <ArrowCircleDownIcon className='scroll-icon' />
                        <p>Scroll down</p>
                    </div>
                </div>
            </div>
            <Footer />


        </div>
    )

}

export default Start;