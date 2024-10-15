import './Footer.css';

import IconButton from '@mui/material/IconButton';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Footer = () => {
    return (
        <footer>
            <div className="footer-container">
                <div className='footer-btn-container'>
                    <IconButton
                        sx={{ '&:hover': { backgroundColor: '#242424' } }}
                        href="https://github.com/Ashif4354/CyclicTasks">
                        <GitHubIcon sx={{ color: 'white' }} />
                    </IconButton>
                    <IconButton
                        sx={{ '&:hover': { backgroundColor: '#242424' } }}
                        href="mailto:darkglance.developer@gmail.com">
                        <EmailIcon sx={{ color: 'white' }} />
                    </IconButton>
                    <IconButton
                        sx={{ '&:hover': { backgroundColor: '#242424' } }}
                        href="https://www.linkedin.com/in/ashif4354/">
                        <LinkedInIcon sx={{ color: 'white' }} />
                    </IconButton>

                </div>

                <p className='copyrights-text'>© 2024 CyclicTasks. All rights reserved</p>
            </div>

        </footer>
    );
}

export default Footer;