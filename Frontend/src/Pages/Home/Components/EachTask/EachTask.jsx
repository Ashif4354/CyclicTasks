import { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import './EachTask.css';
import { TaskDialog } from '../TaskDialog/TaskDialog';
import { DeleteTaskDialog } from '../DeleteTaskDialog/DeleteTaskDialog';
import SnackBar from '../../../../Components/SnackBar/Snackbar';

import { analytics } from '../../../../config/firebase';
import { logEvent } from 'firebase/analytics';


const EachTask = (props) => {

    const { index, task, tasks, setTasks, setSuccessDeleteSnackBarOpen, setFailedDeleteSnackBarOpen } = props;

    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(task);
    const [successUpdateSnackBarOpen, setSuccessUpdateSnackBarOpen] = useState(false);
    const [failedUpdateSnackBarOpen, setFailedUpdateSnackBarOpen] = useState(false);

    const handleUpdate = () => {
        logEvent(analytics, 'update-task-dialog-open')
        setTaskDialogOpen(true);
    }

    const handleDelete = () => {
        logEvent(analytics, 'delete-task-dialog-open')
        setDeleteTaskDialogOpen(true);
    }

    return (
        <div className="each-task-container">
            <div className="details-container">
                <div className='task-number-container'>
                    <p>{index + 1}.</p>
                </div>
                <div className="task-details-container">
                    <p className='task-detail-text'>Task ID: {currentTask.id}</p>
                    <p className='task-detail-text'>Task Name: {currentTask.task_name}</p>
                    <p className='task-detail-text'>Interval: {currentTask.interval}</p>

                    <div className='status-container'>
                        <p className='status-text'>Status: </p>
                        {
                            currentTask.active ? (
                                <p className='task-detail-text-active task-active'>&nbsp;&nbsp;&nbsp;Active</p>
                            ) : (
                                <p className='task-detail-text-inactive task-inactive'>&nbsp;&nbsp;&nbsp;Inactive</p>
                            )
                        }

                    </div>
                </div>
            </div>
            <div className='edit-btn-container'>
                <IconButton
                    sx={{ '&:hover': { backgroundColor: '#242424' } }}
                    onClick={handleUpdate}
                >
                    <EditIcon sx={{ color: 'white' }} />
                </IconButton>
                <IconButton
                    sx={{ '&:hover': { backgroundColor: '#242424' } }}
                    onClick={handleDelete}
                >
                    <DeleteIcon sx={{ color: 'white' }} />
                </IconButton>
            </div>

            <TaskDialog
                open={taskDialogOpen} setOpen={setTaskDialogOpen} type={'Update'}
                task={currentTask} setTask={setCurrentTask} tasks={null} setTasks={null}
                setSuccessUpdateSnackBarOpen={setSuccessUpdateSnackBarOpen}
                setFailedUpdateSnackBarOpen={setFailedUpdateSnackBarOpen}
            />
            <DeleteTaskDialog
                open={deleteTaskDialogOpen} setOpen={setDeleteTaskDialogOpen}
                task={currentTask} tasks={tasks} setTasks={setTasks}
                setSuccessDeleteSnackBarOpen={setSuccessDeleteSnackBarOpen}
                setFailedDeleteSnackBarOpen={setFailedDeleteSnackBarOpen}
            />
            <SnackBar
                open={successUpdateSnackBarOpen}
                handleClose={() => setSuccessUpdateSnackBarOpen(false)}
                success={true}
                message='Task updated successfully!'
            />
            <SnackBar
                open={failedUpdateSnackBarOpen}
                handleClose={() => setFailedUpdateSnackBarOpen(false)}
                success={false}
                message='Failed to update task! Try again.'
            />
        </div>
    )
}

export default EachTask;