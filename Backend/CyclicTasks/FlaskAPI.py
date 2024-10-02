from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from flask_restful import Api
from aiohttp import ClientSession
from inspect import currentframe

from . import dummy_task
from .lib.Logger import Logger
from .lib.VerifyRecaptcha import verify_recaptcha
from .lib.ValidateIncomingTask import validate_incoming_task

from .api_endpoints.Entry.Entry import Entry
from .api_endpoints.NewTask.NewTask import NewTask
from .api_endpoints.UpdateTask.UpdateTask import UpdateTask
from .api_endpoints.DeleteTask.DeleteTask import DeleteTask

from os import environ

app = Flask(__name__)
api = Api(app)
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
                      not validate_incoming_task(request.json['task'])
                      ):
                    
                    await logger.ALERT(f'FlaskApp/before_request/{currentframe().f_lineno}', 'Task data is not valid JSON', request)

                    return jsonify({
                        'message': 'Task data is not valid JSON',
                        'success': False
                    })
                
                
api.add_resource(Entry, '/')
api.add_resource(NewTask, '/newtask')
api.add_resource(UpdateTask, '/updatetask')
api.add_resource(DeleteTask, '/deletetask')


__all__ = ['app'] # Exports