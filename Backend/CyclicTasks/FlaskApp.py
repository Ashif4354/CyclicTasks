from flask import Flask, jsonify, request
from flask_cors import CORS
from aiohttp import ClientSession
from json import dump
from inspect import currentframe


from . import start_tasks_queue, stop_task_queue, dummy_task
from .lib.Firestore import Firestore
from .CyclicTasks import CyclicTasks
from .lib.Logger import Logger
from .lib.VerifyRecaptcha import verify_recaptcha
from .lib.ValidateIncomingTask import validate_incoming_task


from os import environ

app = Flask(__name__)
CORS(app)

@app.before_request
async def before_request():
    
    async with ClientSession() as session:
        logger = Logger(session)
        await logger.REQUESTS(request)
        
        if request.method == "POST":
            if 'recaptchaToken' in request.json:
                recaptcha_token = request.json['recaptchaToken']
                verified = await verify_recaptcha(session, recaptcha_token, environ['G_RECAPTCHA_SECRET_KEY'])
                if not verified:
                    await logger.ALERT(f'FlaskApp/before_request/{currentframe().f_lineno}', 'Recaptcha verification failed', request)
                    return jsonify({
                        'message': 'Recaptcha verification failed',
                        'success': False
                    })
                await logger.LOG_EVENT(f'FlaskApp/before_request/{currentframe().f_lineno}', 'FlaskApp', 'Recaptcha verification success', None)
            else:
                await logger.ALERT(f'FlaskApp/before_request/{currentframe().f_lineno}', 'Recaptcha token not found', request)
                return jsonify({
                    'message': 'Recaptcha token not found',
                    'success': False
                })
            if request.path in ('/newtask', '/updatetask', '/deletetask'):
                if 'task' not in request.json:
                    await logger.ALERT(f'FlaskApp/before_request/{currentframe().f_lineno}', 'Task data not found', request)
                    return jsonify({
                        'message': 'Task data not found',
                        'success': False
                    })
                elif (not isinstance(request.json['task'], dict) or 
                      request.json['task'].keys() != dummy_task.keys() or
                      validate_incoming_task(request.json['task'])
                      ):
                    await logger.ALERT(f'FlaskApp/before_request/{currentframe().f_lineno}', 'Task data is not valid JSON', request)
                    return jsonify({
                        'message': 'Task data is not valid JSON',
                        'success': False
                    })
            
        if request.path in ['/getrunningtasks']:
            if  request.args.get('pwd') != environ['ADMIN_PWD']:
                await logger.ALERT(f'FlaskApp/before_request/{currentframe().f_lineno}', 
                    f'Someone tried to access running_tasks without authorization\nUsed Password: {request.args.get('pwd')}', 
                    request)
                
                return jsonify({
                    'message': 'Unauthorized',
                    'success': False
                })
                
        
    

@app.route('/')
def entry():
    return jsonify({
        'CyclicTasks API': 'Running'
    })
    

@app.route('/getrunningtasks', methods=['GET'])
async def get_running_tasks():
    tasks = CyclicTasks.RUNNING_TASKS
    return jsonify({
        'tasks': tasks
    })

@app.route('/newtask', methods=['POST'])
async def new_task():
    task = request.json['task']

    async with ClientSession() as session:
        logger = Logger(session)

        try:
            FS = Firestore(initialized=True)
            id = await FS.add_new_task(task)

            await logger.LOG_EVENT(f'FlaskApp/new_task/{currentframe().f_lineno}', 'FlaskApp', 'Task added to Database', task)

            task['id'] = id

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
                'message': 'Some error occured on server side',
                'success': False
            })



@app.route('/updatetask', methods=['POST'])
async def update_task():
    task = request.json['task']
    with ClientSession() as session:
        logger = Logger(session)
        try:        
            id = task['id']

            FS = Firestore(initialized=True)
            await FS.edit_task(task)

            await logger.LOG_EVENT(f'FlaskApp/update_task/{currentframe().f_lineno}', 'FlaskApp', 'Task data has been updated', task)
            await logger.LOG_EVENT(f'FlaskApp/update_task/{currentframe().f_lineno}', 'FlaskApp', 'Task yet to be restarted', task)
            
            await stop_task_queue.put(task)

            await logger.LOG_EVENT(f'FlaskApp/update_task/{currentframe().f_lineno}', 'FlaskApp', f'Task Queued for Stopping: {task["id"]}', task)


            task['id'] = id
            
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
                'message': 'Some error occured on server side',
                'success': False
            })
    
@app.route('/deletetask', methods=['POST'])
async def delete_task():
    task = request.json['task']

    with ClientSession() as session:
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
                'message': 'Some error occured on server side',
                'success': False
            })
    



__all__ = ['app']