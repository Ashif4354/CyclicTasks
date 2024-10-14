from flask import Blueprint, jsonify, request
from aiohttp import ClientSession
from inspect import currentframe
from asyncio import get_event_loop
from firebase_admin import auth

from .. import dummy_task, start_tasks_queue, stop_task_queue
from ..lib.Logger import Logger
from ..lib.Firestore import Firestore
from ..CyclicTasks import CyclicTasks
from .lib.ValidateIncomingTask import validate_incoming_task
from .lib.ValidateUser import user_not_owner, user_blocked

Tasks = Blueprint('tasks', __name__, url_prefix='/tasks')

@Tasks.before_request
async def before_request():
    """
    It will check for task data and validate it.
    """    
    async with ClientSession() as session:
        logger = Logger(session)
        if request.method == 'POST':
            if request.path in ('/tasks/newtask', '/tasks/updatetask', '/tasks/deletetask'):

                if not request.headers.get('Authorization') and not request.headers.get('Authorization').startswith('Bearer '):
                    await logger.ALERT(f'FlaskApp/Tasks/before_request/{currentframe().f_lineno}', 
                                        'Authorization failed', 
                                        request,
                                        labels={
                                            'alert_type': 'authorization_failed'
                                        })
                    return jsonify({
                        'message': 'Authorization failed',
                        'success': False
                    })
                
                elif user_blocked(request.headers.get('Authorization').split(' ')[1]):
                    await logger.ALERT(f'FlaskApp/Tasks/before_request/{currentframe().f_lineno}', 
                                        'User is blocked', 
                                        request,
                                        labels={
                                            'alert_type': 'user_is_blocked'
                                        })
                    return jsonify({
                        'message': 'You are Blocked',
                        'success': False
                    })
                
                elif 'task' not in request.json:
                    await logger.ALERT(f'FlaskApp/Tasks/before_request/{currentframe().f_lineno}', 
                                        'Task data not found', 
                                        request,
                                        labels={
                                            'alert_type': 'task_data_not_found'
                                        })
                    return jsonify({
                        'message': 'Task data not found',
                        'success': False
                    })
                
                elif (not isinstance(request.json['task'], dict) or 
                        request.json['task'].keys() != dummy_task.keys() or
                        not validate_incoming_task(request.json['task'])
                        ):
                    
                    await logger.ALERT(f'FlaskApp/Tasks/before_request/{currentframe().f_lineno}', 
                                        'Task data is not valid JSON', 
                                        request,
                                        labels={
                                            'alert_type': 'invalid_task_data'
                                        })

                    return jsonify({
                        'message': 'Invalid Data',
                        'success': False
                    })
                
                elif user_not_owner(request.json['task'], request.headers.get('Authorization').split(' ')[1]):
                    await logger.ALERT(f'FlaskApp/Tasks/before_request/{currentframe().f_lineno}', 
                                        'User is not the owner of the task', 
                                        request,
                                        labels={
                                            'alert_type': 'non_task_owner_accessing_task'
                                        })
                    return jsonify({
                        'message': 'You are not the owner of the task',
                        'success': False
                    })
                
                

                

            


@Tasks.route('/newtask', methods=['POST'])
async def new_task():
    """
    This endpoint is used to add a new task to the database and queue it for starting.
    """
    task = request.json['task']

    async with ClientSession() as session:
        logger = Logger(session)

        try:
            FS = Firestore(initialized=True)
            id = await FS.add_new_task(task)
            task['id'] = id

            await logger.LOG_EVENT(f'FlaskApp/Tasks/new_task/{currentframe().f_lineno}', 
                                    'FlaskApp', 
                                    'Task added to Database', 
                                    task,
                                    labels={
                                        'event_type': 'new_user_task'
                                    })


            if task['active']:
                event_loop = get_event_loop()
                event_loop.call_soon_threadsafe(start_tasks_queue.put_nowait, task)
                
                await logger.LOG_EVENT(f'FlaskApp/Tasks/new_task/{currentframe().f_lineno}', 
                                        'FlaskApp', 
                                        f'Task Queued for Starting: {task["id"]}', 
                                        task,
                                        labels={
                                            'event_type': 'task_queued',
                                            'queueing_type': 'start',                                            
                                        })

            return jsonify({
                'message': 'Task has been added',
                'success': True,
                'new_task_id': id
            })
        except Exception as e:
            await logger.LOG_ERROR(f'FlaskApp/Tasks/new_task/line {currentframe().f_lineno}', e, task)
            return jsonify({
                'message': 'Some error occurred on server side',
                'success': False
            })
        

@Tasks.route('/updatetask', methods=['POST'])
async def update_task():
    """
    This endpoint is used to update the task data in the database and queue it for restarting.
    """
    task = request.json['task']
    async with ClientSession() as session:
        logger = Logger(session)
        try:        
            id = task['id']

            FS = Firestore(initialized=True)
            await FS.update_task(task)
            task['id'] = id

            await logger.LOG_EVENT(f'FlaskApp/Tasks/update_task/{currentframe().f_lineno}', 
                                    'FlaskApp', 
                                    'Task data has been updated', 
                                    task,
                                    labels={
                                        'event_type': 'task_updated'
                                    })
            
            await logger.LOG_EVENT(f'FlaskApp/Tasks/update_task/{currentframe().f_lineno}', 
                                    'FlaskApp', 
                                    'Task yet to be restarted', 
                                    task,
                                    labels={
                                        'event_type': 'task_to_be_restarted'
                                    })
            
            await stop_task_queue.put(task)

            await logger.LOG_EVENT(f'FlaskApp/Tasks/update_task/{currentframe().f_lineno}', 
                                    'FlaskApp', 
                                    f'Task Queued for Stopping: {task["id"]}', 
                                    task, 
                                    labels={
                                        'event_type': 'task_queued',
                                        'queueing_type': 'stop'
                                    })

            if task['active']:
                event_loop = get_event_loop()
                event_loop.call_soon_threadsafe(start_tasks_queue.put_nowait, task)

                await logger.LOG_EVENT(f'FlaskApp/Tasks/update_task/{currentframe().f_lineno}', 
                                        'FlaskApp', 
                                        f'Task Queued for Starting: {task["id"]}', 
                                        task,
                                        labels={
                                            'event_type': 'task_queued',
                                            'queueing_type': 'start',
                                        })

            return jsonify({
                'message': 'Task data has been changed'  + ' and restarted' if task['active'] else '',
                'success': True
            })
    
        except Exception as e:
            await logger.LOG_ERROR(f'FlaskApp/Tasks/update_task/line {currentframe().f_lineno}', e, task)
            return jsonify({
                'message': 'Some error occurred on server side',
                'success': False
            })


@Tasks.route('/deletetask', methods=['POST'])
async def delete_task():
    """
    This endpoint is used to delete the task from the database and queue it for stopping.
    """
    task = request.json['task']

    async with ClientSession() as session:
        logger = Logger(session)
        try:

            FS = Firestore(initialized=True)
            await FS.delete_task(task['id'], task['user_email'])
            CyclicTasks.RUNNING_TASKS[task['id']]['deleted'] = True

            await logger.LOG_EVENT(f'FlaskApp/Tasks/delete_task/{currentframe().f_lineno}', 
                                    'FlaskApp', 
                                    f'Task has been deleted from Database: {task['id']}', 
                                    task,
                                    labels={
                                        'event_type': 'task_deleted'
                                    })

            await stop_task_queue.put(task)

            await logger.LOG_EVENT(f'FlaskApp/Tasks/delete_task/{currentframe().f_lineno}', 
                                    'FlaskApp', 
                                    f'Task Queued for Stopping: {task["id"]}', 
                                    task,
                                    labels={
                                        'event_type': 'task_queued',
                                        'queueing_type': 'stop'
                                    })

            return jsonify({
                'message': 'Task has been deleted',
                'success': True
            })
        except Exception as e:
            await logger.LOG_ERROR(f'FlaskApp/Tasks/delete_task/line {currentframe().f_lineno}', e, task)
            return jsonify({
                'message': 'Some error occurred on server side',
                'success': False
            })
        


        

__all__ = ['Tasks']