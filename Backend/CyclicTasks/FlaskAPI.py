from flask import Flask, jsonify, request, Response, jsonify
from flask_cors import CORS
# from flask_restful import Api
from aiohttp import ClientSession
from inspect import currentframe

from . import dummy_task, start_tasks_queue, stop_task_queue
from .CyclicTasks import CyclicTasks
from .lib.Logger import Logger
from .lib.Firestore import Firestore
from .lib.VerifyRecaptcha import verify_recaptcha
from .lib.ValidateIncomingTask import validate_incoming_task

from os import environ

app = Flask(__name__)
CORS(app)

@app.before_request
async def before_request() -> Response | None:
    """
    Before every request to the API, this function will be called.\n
    If the request is a POST request, it will check for recaptcha token and verify it.\n
    If the request is to /newtask, /updatetask, /deletetask, it will check for task data and validate it.\n
    After passing this phase the request will be passed to the respective endpoint.
    """
    
    async with ClientSession() as session:
        logger = Logger(session) # Logger object to log events
        
        await logger.REQUESTS(request) # Log the incoming request
        
        if request.method == "POST":
            if 'recaptchaToken' in request.json:
                recaptcha_token = request.json['recaptchaToken']
                verified = await verify_recaptcha(session, recaptcha_token, environ['G_RECAPTCHA_SECRET_KEY'])

                if not verified:
                    await logger.ALERT(f'FlaskApp/before_request/{currentframe().f_lineno}', 
                                        'Recaptcha verification failed', 
                                        request,
                                        labels={
                                            'alert_type': 'Recaptcha Verification Failed'
                                        })

                    return jsonify({
                        'message': 'Recaptcha verification failed',
                        'success': False
                    })
                
                await logger.LOG_EVENT(f'FlaskApp/before_request/{currentframe().f_lineno}', 'FlaskApp', 'Recaptcha verification success', None)
            else:
                await logger.ALERT(f'FlaskApp/before_request/{currentframe().f_lineno}', 
                                    'Recaptcha token not found', 
                                    request,
                                    labels={
                                        'alert_type': 'Recaptcha Token Not Found'
                                    })

                return jsonify({
                    'message': 'Recaptcha token not found',
                    'success': False
                })
            if request.path in ('/newtask', '/updatetask', '/deletetask'):
                if 'task' not in request.json:
                    await logger.ALERT(f'FlaskApp/before_request/{currentframe().f_lineno}', 
                                        'Task data not found', 
                                        request,
                                        labels={
                                           'alert_type': 'Task Data Not Found'
                                        })
                    return jsonify({
                        'message': 'Task data not found',
                        'success': False
                    })
                elif (not isinstance(request.json['task'], dict) or 
                      request.json['task'].keys() != dummy_task.keys() or
                      not validate_incoming_task(request.json['task'])
                      ):
                    
                    await logger.ALERT(f'FlaskApp/before_request/{currentframe().f_lineno}', 
                                        'Task data is not valid JSON', 
                                        request,
                                        labels={
                                           'alert_type': 'Task Data Not Valid JSON'
                                        })

                    return jsonify({
                        'message': 'Task data is not valid JSON',
                        'success': False
                    })
                
@app.route('/', methods=['GET'])
async def entry():
    return jsonify({'message': 'CyclicTasks API is running'})

@app.route('/getrunningtasks', methods=['GET'])
async def get_running_tasks():
    """
    This endpoint will return the list of tasks that are currently running.
    Need to be authorized by the ADMIN_PWD environment variable.
    """
    async with ClientSession() as session:
        logger = Logger(session)

        try:
            if request.args.get('pwd') != environ['ADMIN_PWD']:

                await logger.ALERT(f'FlaskApp/GetRunningTasks/{currentframe().f_lineno}', 
                                    f'Someone tried to access running_tasks without authorization\nUsed Password: {request.args.get('pwd')}',
                                    request,
                                    labels={
                                        'alert_type': 'Wrong Password'                                        
                                    })

                return jsonify({
                    'message': 'Unauthorized',
                    'success': False
                })
            tasks = CyclicTasks.RUNNING_TASKS
            return jsonify({
                'tasks': tasks
            })
        except Exception as e:
            await logger.ALERT(f'FlaskApp/GetRunningTasks/{currentframe().f_lineno}', 
                                f'Error: {e}', 
                                request)
            return jsonify({
                'message': 'Internal Server Error',
                'success': False
            })

@app.route('/getversion', methods=['GET'])
async def get_version():
    """
    This endpoint will return the version of the API.
    """
    return jsonify({
        'version': '1.0'
    })

@app.route('/newtask', methods=['POST'])
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

            await logger.LOG_EVENT(f'FlaskApp/new_task/{currentframe().f_lineno}', 'FlaskApp', 'Task added to Database', task)


            if task['active']:
                await start_tasks_queue.put(task)
                await logger.LOG_EVENT(f'FlaskApp/new_task/{currentframe().f_lineno}', 'FlaskApp', f'Task Queued for Starting: {task["id"]}', task)

            return jsonify({
                'message': 'Task has been added',
                'success': True,
                'new_task_id': id
            })
        except Exception as e:
            await logger.LOG_ERROR(f'FlaskApp/new_task/line {currentframe().f_lineno}', e, task)
            return jsonify({
                'message': 'Some error occurred on server side',
                'success': False
            })
        

@app.route('/updatetask', methods=['POST'])
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
            await FS.edit_task(task)
            task['id'] = id

            await logger.LOG_EVENT(f'FlaskApp/update_task/{currentframe().f_lineno}', 'FlaskApp', 'Task data has been updated', task)
            await logger.LOG_EVENT(f'FlaskApp/update_task/{currentframe().f_lineno}', 'FlaskApp', 'Task yet to be restarted', task)
            
            await stop_task_queue.put(task)

            await logger.LOG_EVENT(f'FlaskApp/update_task/{currentframe().f_lineno}', 'FlaskApp', f'Task Queued for Stopping: {task["id"]}', task)

            if task['active']:
                await start_tasks_queue.put(task)

                await logger.LOG_EVENT(f'FlaskApp/update_task/{currentframe().f_lineno}', 'FlaskApp', f'Task Queued for Starting: {task["id"]}', task)

            return jsonify({
                'message': 'Task data has been changed'  + ' and restarted' if task['active'] else '',
                'success': True
            })
    
        except Exception as e:
            await logger.LOG_ERROR(f'FlaskApp/update_task/line {currentframe().f_lineno}', e, task)
            return jsonify({
                'message': 'Some error occurred on server side',
                'success': False
            })


@app.route('/deletetask', methods=['POST'])
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

            await logger.LOG_EVENT(f'FlaskApp/delete_task/{currentframe().f_lineno}', 'FlaskApp', f'Task has been deleted from Database: {task['id']}', task)

            await stop_task_queue.put(task)

            await logger.LOG_EVENT(f'FlaskApp/delete_task/{currentframe().f_lineno}', 'FlaskApp', f'Task Queued for Stopping: {task["id"]}', task)

            return jsonify({
                'message': 'Task has been deleted',
                'success': True
            })
        except Exception as e:
            await logger.LOG_ERROR(f'FlaskApp/delete_task/line {currentframe().f_lineno}', e, task)
            return jsonify({
                'message': 'Some error occurred on server side',
                'success': False
            })

__all__ = ['app'] # Exports