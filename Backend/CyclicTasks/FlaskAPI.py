from flask import Flask, jsonify, request, Response, jsonify
from flask_cors import CORS
from aiohttp import ClientSession
from inspect import currentframe
from datetime import datetime

from .lib.Logger import Logger
from .lib.VerifyRecaptcha import verify_recaptcha

from .FlaskBlueprints.Admin import Admin
from .FlaskBlueprints.Tasks import Tasks

from os import environ

app = Flask(__name__)
CORS(app)

app.register_blueprint(Admin)
app.register_blueprint(Tasks)

@app.before_request
async def before_request() -> Response | None:
    """
    Before every request to the API, this function will be called.\n
    If the request is a POST request, it will check for recaptcha token and verify it.\n
    After passing this phase the request will be passed to the respective endpoint.
    """
    
    async with ClientSession() as session:
        async with Logger(session) as logger:
        
            await logger.REQUESTS(request)
            
            if request.method == "POST":

                if not request.json:
                    await logger.ALERT(f'FlaskApp/before_request/{currentframe().f_lineno}', 
                                        'Request data not found', 
                                        request,
                                        labels={
                                            'alert_type': 'request_data_not_found'
                                        })

                    return jsonify({
                        'message': 'Request data not found',
                        'success': False
                    })
                
                if 'recaptchaToken' in request.json:
                    recaptcha_token = request.json['recaptchaToken']
                    verified = await verify_recaptcha(session, recaptcha_token, environ['G_RECAPTCHA_SECRET_KEY'])

                    if not verified:
                        await logger.ALERT(f'FlaskApp/before_request/{currentframe().f_lineno}', 
                                            'Recaptcha verification failed', 
                                            request,
                                            labels={
                                                'alert_type': 'recaptcha_verification_failed'
                                            })

                        return jsonify({
                            'message': 'Recaptcha verification failed',
                            'success': False
                        })
                    
                    await logger.LOG_EVENT(f'FlaskApp/before_request/{currentframe().f_lineno}', 
                                        'FlaskApp', 
                                        'Recaptcha verification success', 
                                        None,
                                        labels={
                                            'event_type': 'recaptcha_verification_success'
                                        })
                
                elif request.headers.get('host-token'):

                    if request.headers.get('host-token') == environ['host-token']:
                        pass
                    else:
                        await logger.ALERT(f'FlaskApp/before_request/{currentframe().f_lineno}', 
                                            'Host token verification failed', 
                                            request,
                                            labels={
                                                'alert_type': 'host_token_verification_failed'
                                            })

                        return jsonify({
                            'message': 'Host token verification failed',
                            'success': False
                        })

                else:

                    await logger.ALERT(f'FlaskApp/before_request/{currentframe().f_lineno}', 
                                        'Recaptcha token not found', 
                                        request,
                                        labels={
                                            'alert_type': 'recaptcha_token_not_found'
                                        })

                    return jsonify({
                        'message': 'Recaptcha token not found',
                        'success': False
                    })
                
            if request.method == 'GET':
                pass
            
                
@app.route('/', methods=['GET'])
async def entry():
    return jsonify({'message': 'CyclicTasks API is running'})


@app.route('/status', methods=['GET'])
async def status():
    """
    This endpoint will return the status of the API.
    """
    return jsonify({
        'success': True,
        'status': True
    })

@app.route('/getserveruptime', methods=['GET'])
async def get_server_uptime():
    """
    This endpoint will return the uptime of the server.
    """
    return jsonify({
        'success': True,
        'start_time': datetime.strptime(environ['start_time'], '%Y-%m-%d %H:%M:%S').strftime('%d-%m-%Y  %H:%M:%S'),
        'uptime': str(datetime.now().replace(microsecond=0) - datetime.strptime(environ['start_time'], '%Y-%m-%d %H:%M:%S'))
    })



@app.route('/getversion', methods=['GET'])
async def get_version():
    """
    This endpoint will return the version of the API.
    """
    return jsonify({
        'success': True,
        'version': '1.2.0'
    })



__all__ = ['app'] # Exports