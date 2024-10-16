import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Router } from 'react-router-dom';

import Home from './Pages/Home/Home';
import Start from './Pages/Start/Start';
import Admin from './Pages/Admin/Admin';
import { analytics } from './config/firebase';
import { logEvent } from 'firebase/analytics';
import TermsAndConditions from './Pages/TC/TC';
import PrivacyPolicy from './Pages/PrivacyPolicy/PrivacyPolicy';

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
                <Route path='*' element={<Start />} />
                <Route path='/home' element={<Home />} />
                <Route path='/admin' element={<Admin />} />
                <Route path='/tc' element={<TermsAndConditions />} />
                <Route path='/privacypolicy' element={<PrivacyPolicy />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;