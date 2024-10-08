import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './Pages/Home/Home';
import Start from './Pages/Start/Start';
import Admin from './Pages/Admin/Admin';
import { analytics } from './config/firebase';
import { logEvent } from 'firebase/analytics';

const App = () => {
    useEffect(() => {
        logEvent(analytics, 'visit_count', {
            page_location: window.location.href,
            page_path: window.location.pathname,
            page_title: document.title
        })
    }, [])

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Start />} />
                <Route path='/home' element={<Home />} />
                <Route path='/admin' element={<Admin />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;