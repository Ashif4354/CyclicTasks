import { Switch } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import './EnableDisableLogs.css';
import SnackBar from '../../../../../Components/SnackBar/Snackbar';

const EnableDisableLogs = (props) => {
    const [googleLogsEnabled, setGoogleLogsEnabled] = useState(false);
    const [discordLogsEnabled, setDiscordLogsEnabled] = useState(false);
    const [terminalLogsEnabled, setTerminalLogsEnabled] = useState(false);
    const [saveBtnDisabled, setSaveBtnDisabled] = useState(true);
    const [saveBtnLoading, setSaveBtnLoading] = useState(false);
    const [switchDisabled, setSwitchDisabled] = useState(false);
    const [successSnackBarOpen, setSuccessSnackBarOpen] = useState(false);
    const [failedSnackBarOpen, setFailedSnackBarOpen] = useState(false);

    const [loggingStatus, setLoggingStatus] = useState({});

    const [loggingStatusCheck, setLoggingStatusCheck] = useState({
        google: false,
        discord: false,
        terminal: false
    });

    const recaptchaRef = useRef();

    const getLoggingStatus = async () => {
        fetch(import.meta.env.VITE_CT_SERVER_URL + '/admin/loggingstatus' + `?pwd=${props.adminPassword}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setLoggingStatus(data);
                    setGoogleLogsEnabled(data.google);
                    setDiscordLogsEnabled(data.discord);
                    setTerminalLogsEnabled(data.terminal);
                } else {
                    console.error("else", data.message); // required log
                }
            })
            .catch(error => {
                console.error("ERROR", error); // required log
            })
    }

    const onSaveLoggingStatus = async () => {
        setSaveBtnLoading(true);
        setSaveBtnDisabled(true);
        setSwitchDisabled(true);

        const recaptchaToken = await recaptchaRef.current.executeAsync();
        recaptchaRef.current.reset();

        fetch(import.meta.env.VITE_CT_SERVER_URL + '/admin/loggingstatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                google: googleLogsEnabled,
                discord: discordLogsEnabled,
                terminal: terminalLogsEnabled,
                recaptchaToken: recaptchaToken,
                password: props.adminPassword
            })
        }).then(response => response.json())
            .then(response => {
                if (response.success) {
                    // setSaveBtnLoading(false);
                    // setSaveBtnDisabled(false);
                    setSwitchDisabled(false);

                    setLoggingStatus({ google: googleLogsEnabled, discord: discordLogsEnabled, terminal: terminalLogsEnabled });
                    setSuccessSnackBarOpen(true);

                } else {
                    console.error("else", response.message); // required log
                    setSaveBtnLoading(false);
                    setSaveBtnDisabled(false);
                    setSwitchDisabled(false);
                    setFailedSnackBarOpen(true);

                    setGoogleLogsEnabled(loggingStatus.google);
                    setDiscordLogsEnabled(loggingStatus.discord);
                    setTerminalLogsEnabled(loggingStatus.terminal);
                    
                }                
            })
            .catch(error => {
                console.error("ERROR", error); // required log
                setSaveBtnLoading(false);
                setSaveBtnDisabled(false);
                setSwitchDisabled(false);
                setFailedSnackBarOpen(true);

                setGoogleLogsEnabled(loggingStatus.google);
                setDiscordLogsEnabled(loggingStatus.discord);
                setTerminalLogsEnabled(loggingStatus.terminal);

            })
    }

    const onChange = (value, valueName, defaultValue, setFunction) => {
        setFunction(value);

        let prevData = loggingStatusCheck;

        if (value !== defaultValue) {
            if (valueName === 'google') {
                console.log('google true')
                prevData.google = true;
                setLoggingStatusCheck(prevData);

            } else if (valueName === 'discord') {
                console.log('discord true')
                prevData.discord = true;
                setLoggingStatusCheck(prevData);

            } else if (valueName === 'terminal') {
                console.log('terminal true')
                prevData.terminal = true;
                setLoggingStatusCheck(prevData);
            }
        } else {
            if (valueName === 'google') {
                console.log('google false')
                prevData.google = false;
                setLoggingStatusCheck(prevData);

            } else if (valueName === 'discord') {
                console.log('discord false')
                prevData.discord = false;
                setLoggingStatusCheck(prevData);

            } else if (valueName === 'terminal') {
                console.log('terminal false')
                prevData.terminal = false;
                setLoggingStatusCheck(prevData);

            }
        }

        if (loggingStatusCheck.google || loggingStatusCheck.discord || loggingStatusCheck.terminal) {
            setSaveBtnDisabled(false);
        } else {
            setSaveBtnDisabled(true);
        }
    }






    useEffect(() => {
        getLoggingStatus();
    }, []);

    return (
        <div className="console-canvas">
            <div className='console-canvas-heading-container'>
                <h2 className='console-canvas-heading'>Enable / Disable Logs</h2>
            </div>
            <div className='console-canvas-content'>
                <div className='switch-container'>
                    <div className='switch-text-container'>
                        <p>Google Logs : </p>
                    </div>

                    <div className='switch-cont'>
                        <Switch
                            disabled={switchDisabled}
                            checked={googleLogsEnabled}
                            onChange={(e) => onChange(e.target.checked, 'google', loggingStatus.google, setGoogleLogsEnabled)}
                        />
                    </div>
                </div>

                <div className='switch-container'>
                    <div className='switch-text-container'>
                        <p>Discord Logs : </p>
                    </div>
                    <Switch
                        disabled={switchDisabled}
                        checked={discordLogsEnabled}
                        onChange={(e) => onChange(e.target.checked, 'discord', loggingStatus.discord, setDiscordLogsEnabled)}
                    />
                </div>

                <div className='switch-container'>
                    <div className='switch-text-container'>
                        <p>Terminal Logs : </p>
                    </div>
                    <Switch
                        disabled={switchDisabled}
                        checked={terminalLogsEnabled}
                        onChange={(e) => onChange(e.target.checked, 'terminal', loggingStatus.terminal, setTerminalLogsEnabled)}
                    />
                </div>
                <div className='save-button-container'>
                    <button disabled={saveBtnDisabled} className='btn' onClick={onSaveLoggingStatus}>Save</button>
                </div>

            </div>
            <ReCAPTCHA
                sitekey={import.meta.env.VITE_G_RECAPTCHA_SITE_KEY}
                size='invisible'
                ref={recaptchaRef}

            />
            <SnackBar
                open={successSnackBarOpen}
                message='Changes Saved Successfully'
                success={true}
                handleClose={() => setSuccessSnackBarOpen(false)}
            />
            <SnackBar
                open={failedSnackBarOpen}
                message='Failed to Save Changes'
                success={false}
                handleClose={() => setFailedSnackBarOpen(false)}
            />
        </div>
    );
}

export default EnableDisableLogs;