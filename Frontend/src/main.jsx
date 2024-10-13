import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App.jsx'
import './index.css'

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
});

createRoot(document.getElementById('root')).render(
    // <StrictMode>
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    // </StrictMode>
)
