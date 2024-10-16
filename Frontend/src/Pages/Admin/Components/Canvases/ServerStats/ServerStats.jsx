import { useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
import { Skeleton } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';

import './ServerStats.css';

const ServerStats = () => {
    const [hostAddress, setHostAddress] = useState(import.meta.env.VITE_CT_SERVER_URL);

    const [serverStatus, setServerStatus] = useState(false);
    const [serverStatusLoading, setServerStatusLoading] = useState(true);
    const [serverVersion, setServerVersion] = useState('');
    const [serverUpTime, setServerUpTime] = useState('');
    const [serverUpTimeLoading, setServerUpTimeLoading] = useState(true);
    const [serverStartTime, setServerStartTime] = useState('N/A');

    const getHostAddress = async () => {
        if (import.meta.env.VITE_CT_SERVER_URL) {
            setHostAddress(import.meta.env.VITE_CT_SERVER_URL);
        }
    }

    const checkServerStatus = async () => {
        setServerStatusLoading(true);

        fetch(`${hostAddress}/status`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setServerStatus(true);
                    setServerStatusLoading(false);
                } else {
                    setServerStatus(false);
                    setServerStatusLoading(false);
                    console.error("else", data.message); // required log
                }
            })
            .catch(error => {
                setServerStatusLoading(false);
                setServerStatus(false);

                console.error("ERROR", error); // required log
            })
    }

    const getServerVersion = async () => {
        fetch(`${hostAddress}/getversion`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setServerVersion(data.version);
                } else {
                    setServerVersion('N/A');
                    console.error("else", data.message); // required log
                }
            })
            .catch(error => {
                setServerVersion('N/A');
                console.error("ERROR", error); // required log
            })
    }

    const getServerUpStartTime = async () => {
        setServerUpTimeLoading(true);

        fetch(`${hostAddress}/getserveruptime`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setServerUpTime(data.uptime);
                    setServerStartTime(data.start_time);

                    setServerUpTimeLoading(false);
                } else {
                    setServerUpTime('N/A')
                    setServerStartTime('N/A')

                    setServerUpTimeLoading(false);

                    console.error("else", data.message); // required log
                }
            })
            .catch(error => {
                setServerUpTime('N/A')
                setServerStartTime('N/A')

                setServerUpTimeLoading(false);
                console.error("ERROR", error); // required log

            })
    }


    useEffect(() => {
        getHostAddress();

        checkServerStatus();
        getServerVersion();
        getServerUpStartTime();
    }, []);

    return (
        <div className="console-canvas">
            <div className='console-canvas-heading-container'>
                <h2 className='console-canvas-heading'>Server Stats</h2>
            </div>

            <div className='console-canvas-content'>
                <div className='server-stat'>
                    <span>Host address :  {hostAddress}</span>
                </div>

                <div className='server-stat'>
                    <div className='server-version-container'>
                        Server Version:
                            {
                                serverVersion ? (
                                    <span className='stat-value-text'>{serverVersion}</span>
                                ) : (
                                    <Skeleton
                                        variant="text"
                                        width='220px'
                                        sx={{ bgcolor: 'rgba(18, 18, 18, 0.3)', borderRadius: '20px', marginLeft: '10px' }}
                                    />
                                )
                            }
                        
                    </div>
                </div>

                <div className='server-stat'>
                    <div className='server-status-container'>
                        Server Status :
                        {
                            serverStatusLoading ? (
                                <Skeleton
                                    variant="text"
                                    width='220px'
                                    sx={{ bgcolor: 'rgba(18, 18, 18, 0.3)', borderRadius: '20px', marginLeft: '10px' }}
                                />
                            ) : (
                                serverStatus ? (
                                    <span className='status-text-online stat-value-text'>Online</span>
                                ) : (
                                    <span className='status-text-offline stat-value-text'>Offline</span>
                                )
                            )
                        }
                        <IconButton
                            onClick={checkServerStatus}
                            sx={{
                                '&:hover': { backgroundColor: '#00000050' },
                                marginLeft: '10px',
                                display: serverStatusLoading ? 'none' : 'flex'
                            }}
                        >
                            <ReplayIcon
                                sx={{ color: 'white' }}
                            />
                        </IconButton>

                    </div>
                </div>

                <div className='server-stat'>
                    <div className='server-start-time-container'>
                        Server Start Time :
                        {
                            (serverStartTime == '') ? (
                                <Skeleton
                                    variant="text"
                                    width='200px'
                                    sx={{ bgcolor: 'rgba(18, 18, 18, 0.3)', borderRadius: '20px', marginLeft: '10px' }}
                                />
                            ) : (
                                <span className='stat-value-text'>{serverStartTime}</span>
                            )
                        }

                    </div>
                </div>

                <div className='server-stat'>
                    <div className='server-uptime-container'>
                        Server Uptime :
                        {
                            serverUpTimeLoading ? (
                                <Skeleton
                                    variant="text"
                                    width='220px'
                                    sx={{ bgcolor: 'rgba(18, 18, 18, 0.3)', borderRadius: '20px', marginLeft: '10px' }}
                                />
                            ) : (
                                <span className='stat-value-text'>{serverUpTime}</span>
                            )
                        }

                        <IconButton
                            onClick={getServerUpStartTime}
                            sx={{
                                '&:hover': { backgroundColor: '#00000050' },
                                marginLeft: '10px',  
                                display: serverUpTimeLoading ? 'none' : 'flex'
                            }}
                        >
                            <ReplayIcon
                                sx={{ color: 'white' }}
                            />
                        </IconButton>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default ServerStats;