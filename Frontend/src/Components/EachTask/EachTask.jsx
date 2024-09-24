import { useState } from 'react';

import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';

import './EachTask.css';
import { TaskDialog } from '../TaskDialog/TaskDialog';


const EachTask = (props) => {

    const {index, task, changes, setChanges} = props;

    const [dialogOpen, setDialogOpen] = useState(false);

    const handleEdit = () => {
        setDialogOpen(true);
    }

    return (
        <div className="each-task-container">
            <TaskDialog open={dialogOpen} setOpen={setDialogOpen} type={'Edit'} changes={changes} setChanges={setChanges} task={task}/>
            <div className="details-container">
                <div className='task-number-container'>
                    <p>{index + 1}.</p>
                </div>
                <div className="task-details-container">
                    <p className='task-detail-text'>Task Name: {task.task_name}</p>
                    <p className='task-detail-text'>Task ID: {task.id}</p>
                    <p className='task-detail-text'>Interval: {task.interval}</p>

                    <div className='status-container'>
                        <p className='status-text'>Status: </p>
                        {
                            task.active ? (
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
                    onClick={handleEdit}

                >
                    <EditIcon sx={{ color: 'white' }} />
                </IconButton>
            </div>
        </div>
    )

}

export default EachTask;