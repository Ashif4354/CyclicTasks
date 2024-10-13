import { useEffect, useState } from 'react';
import { Checkbox } from '@mui/material';
import { Link } from '@mui/material';

import './EachPanelTask.css';
import SuspendTasksDialog from '../SuspendTasksDialog/SuspendTasksDialog';
import SnackBar from '../../../../../../../Components/SnackBar/Snackbar';




const EachPanelTask = (props) => {
    const { task, tabValue, selectedTasks, setSelectedTasks, adminPassword, selectNone, setSelectNone } = props;

    const [checked, setChecked] = useState(false);
    const [active, setActive] = useState(task.active);
    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
    const [suspendSuccessSnackBarOpen, setSuspendSuccessSnackBarOpen] = useState(false);
    const [suspendFailedSnackBarOpen, setSuspendFailedSnackBarOpen] = useState(false);

    const onCheckboxChange = (e) => {
        setChecked(e.target.checked);

        if (e.target.checked) {
            setSelectNone(false);
            setSelectedTasks([...selectedTasks, { task, setActive }]);
        } else {
            setSelectedTasks(selectedTasks.filter(selectedTask => selectedTask.task.id !== task.id));
        }
    }

    const onSuspend = () => {
        setSuspendDialogOpen(true);
    }

    useEffect(() => {
        if (selectNone) {
            setChecked(false);
        }
    }, [selectNone])


    return (
        <div className='each-panel-task-container'>
            <div className='checkbox-container'>
                <Checkbox
                    disabled={!active || task.deleted}
                    checked={checked}
                    onChange={onCheckboxChange}
                    sx={{
                        color: 'white',
                        '&.Mui-checked': {
                            color: 'white'
                        },
                    }}
                />
            </div>
            <div className='task-inner-container'>
                <div className='task-detail-container'>
                    <span className='each-panel-task-detail'>Task id: {task.id}</span>
                    <span className='each-panel-task-detail'>Task Name: {task.task_name}</span>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <span className='each-panel-task-detail'>Target Url: </span>
                        <Link href={task.url} target='_blank'>{task.url}</Link>
                    </div>
                    {
                        tabValue != '3' ? (
                            <>
                                <span className='each-panel-task-detail'>User Name: {task.user_name}</span>
                                <span className='each-panel-task-detail'>User Email: {task.user_email}</span>
                            </>
                        ) : (
                            <div />
                        )
                    }
                    <div className='active-container' style={{ display: 'flex', flexDirection: 'row' }}>
                        Active:
                        {
                            active ?
                                (
                                    <span className='task-detail-text-active task-active' style={{ fontSize: '1rem', marginLeft: '10px' }}>Active</span>
                                ) : (
                                    <span className='task-detail-text-active task-inactive' style={{ fontSize: '1rem', marginLeft: '10px' }}>Inactive</span>
                                )
                        }
                    </div>
                    <span className='deleted-text'>
                        {
                            task.deleted ? 'Deleted' : ''
                        }
                    </span>
                </div>
                <div className='panel-task-actions-container'>
                    <button className='panel-task-action-button' disabled={!active || task.deleted} onClick={onSuspend}>Suspend</button>
                </div>
            </div>

            <SuspendTasksDialog
                open={suspendDialogOpen}
                setOpen={setSuspendDialogOpen}
                tasks={[{ task, setActive }]}
                adminPassword={adminPassword}
                setSuccessSnackBarOpen={setSuspendSuccessSnackBarOpen}
                setFailedSnackBarOpen={setSuspendFailedSnackBarOpen}
                onSelectNone={setSelectNone}
            />

            <SnackBar
                open={suspendSuccessSnackBarOpen}
                success={true}
                message='Task Suspended Successfully'
                handleClose={() => setSuspendSuccessSnackBarOpen(false)}
            />

            <SnackBar
                open={suspendFailedSnackBarOpen}
                success={false}
                message='Failed to Suspend Task'
                handleClose={() => setSuspendFailedSnackBarOpen(false)}
            />


        </div>
    )
}

export default EachPanelTask;