from flask import Blueprint, jsonify, request
from firebase_admin import auth
from aiohttp import ClientSession
from inspect import currentframe
from os import environ

from ..lib.Logger import Logger
from ..lib.Firestore import Firestore
from ..lib.Authentication import Authentication
from ..CyclicTasks import CyclicTasks

from .Users import Users


Admin = Blueprint('admin', __name__, url_prefix='/admin')
Admin.register_blueprint(Users)

@Admin.before_request
async def before_request():
    async with ClientSession() as session:
        logger = Logger(session)

        if request.method == 'GET':
            if 'pwd' not in request.args:

                await logger.ALERT(f'FlaskApp/Admin/before_request/{currentframe().f_lineno}', 
                            'Admin Pwd not found in request', 
                            request)
                
                return jsonify({
                    'message': 'Admin Pwd not found in request',
                    'success': False
                })
            
            else:
                if request.args['pwd'] != environ['ADMIN_PWD']:

                    await logger.ALERT(f'FlaskApp/Admin/before_request/{currentframe().f_lineno}', 
                                'Admin Pwd mismatch', 
                                request)
                    
                    return jsonify({
                        'message': 'Admin Pwd mismatch',
                        'success': False
                    })
                
        elif request.method == 'POST':
            if request.path in ('/admin/verifyadminpwd',):
                pass
            else:
                if 'password' not in request.json:

                    await logger.ALERT(f'FlaskApp/Admin/before_request/{currentframe().f_lineno}', 
                                'Admin Pwd not found', 
                                request)
                    
                    return jsonify({
                        'message': 'Admin Pwd not found',
                        'success': False
                    })
                else:
                    if request.json['password'] != environ['ADMIN_PWD']:

                        await logger.ALERT(f'FlaskApp/Admin/before_request/{currentframe().f_lineno}', 
                                    'Admin Pwd mismatch', 
                                    request)
                        
                        return jsonify({
                            'message': 'Admin Pwd mismatch',
                            'success': False
                        })

            

@Admin.route('/verifyadminpwd', methods=['POST'])
async def verify_admin_pwd():
    """
    This endpoint will verify the ADMIN_PWD.\n
    Need to be authorized by the ADMIN_PWD.
    """
    async with ClientSession() as session:
        logger = Logger(session)

        if 'password' in request.json:
            if request.json['password'] == environ['ADMIN_PWD']:
                return jsonify({
                    'message': 'Admin Pwd verified',
                    'success': True,
                    'verified': True
                })
            else:
                await logger.ALERT(f'FlaskApp/Admin/VerifyAdminPwd/{currentframe().f_lineno}', 
                            'Admin Pwd mismatch', 
                            request)
                
                return jsonify({
                    'message': 'Admin Pwd mismatch',
                    'success': True,
                    'verified': False
                })
        else:
            await logger.ALERT(f'FlaskApp/Admin/VerifyAdminPwd/{currentframe().f_lineno}',
                        'Admin Pwd not found', 
                        request)
            
            return jsonify({
                'message': 'Admin Pwd not found',
                'success': False
            })


@Admin.route('/getrunningtasks', methods=['GET'])
async def get_running_tasks():
    """
    This endpoint will return the list of tasks that are currently running.\n
    Need to be authorized by the ADMIN_PWD.
    """

    async with ClientSession() as session:
        logger = Logger(session)

        try:
            tasks = CyclicTasks.RUNNING_TASKS
            return jsonify({
                'tasks': tasks,
                'success': True
            })
        except Exception as e:
            await logger.ALERT(f'FlaskApp/Admin/GetRunningTasks/{currentframe().f_lineno}', 
                                f'Error: {e}', 
                                request)
            return jsonify({
                'message': 'Internal Server Error',
                'success': False
            })

@Admin.route('/loggingstatus', methods=['GET', 'POST'])
async def logging_status():
    """
    This endpoint will return the status of the logging.\n
    Need to be authorized by the ADMIN_PWD.
    """
    async with ClientSession() as session:
        logger = Logger(session)

        if request.method == 'GET':
            return jsonify({
                'success': True,
                'google': True if environ['ENABLE_GOOGLE_CLOUD_LOGS'] == 'True' else False,
                'discord': True if environ['ENABLE_DISCORD_LOGS'] == 'True' else False,
                'terminal': True if environ['ENABLE_TERMINAL_LOGS'] == 'True' else False
            })

        if request.method == 'POST':
            if 'google' in request.json:
                if request.json['google']:
                    environ['ENABLE_GOOGLE_CLOUD_LOGS'] = 'True'
                else:
                    environ['ENABLE_GOOGLE_CLOUD_LOGS'] = 'False'

            if 'discord' in request.json:
                if request.json['discord']:
                    environ['ENABLE_DISCORD_LOGS'] = 'True'
                else:
                    environ['ENABLE_DISCORD_LOGS'] = 'False'

            if 'terminal' in request.json:
                if request.json['terminal']:
                    environ['ENABLE_TERMINAL_LOGS'] = 'True'
                else:
                    environ['ENABLE_TERMINAL_LOGS'] = 'False'   
            
            await logger.LOG_EVENT(f'FlaskApp/Admin/LoggingStatus/{currentframe().f_lineno}', 
                            'FlaskApp', 
                            'Logging status updated', 
                            None)

            return jsonify({
                'success': True,
                'message': 'Logging status updated'
            })
    

@Admin.route('/getusers', methods=['POST'])
async def get_users():
    """
    This endpoint will return the list of users.\n
    Need to be authorized by the ADMIN_PWD.
    """

    async with ClientSession() as session:
        logger = Logger(session)

        try:
            auth = Authentication(initialized=True)

            users: list[dict] = await auth.get_all_users()


            return jsonify({
                'success': True,
                'users': users
            })
        except Exception as e:
            await logger.LOG_ERROR(f'FlaskApp/Admin/GetUsers/{currentframe().f_lineno}', e, None)

            return jsonify({
                'message': 'Internal Server Error',
                'success': False
            })
        
    
@Admin.route('/getalltasks', methods=['POST'])
async def get_all_tasks():
    """
    This endpoint will return the list of all tasks.\n
    Need to be authorized by the ADMIN_PWD.
    """

    async with ClientSession() as session:
        logger = Logger(session)
        
        try:
            FS = Firestore(initialized=True)
            tasks: list[dict] = await FS.get_all_tasks(include_inactive_tasks=True)

            await logger.LOG_EVENT(f'FlaskApp/Admin/GetAllTasks/{currentframe().f_lineno}', 
                        'FlaskApp', 
                        f'All Tasks fetched for admin: {len(tasks)}', 
                        None)
        
            return jsonify({
                'success': True,
                'tasks': tasks
            })
        
        except Exception as e:
            await logger.LOG_ERROR(f'FlaskApp/Admin/GetAllTasks/{currentframe().f_lineno}', e, None)

            return jsonify({
                'message': 'Internal Server Error',
                'success': False
            })



__all__ = ['Admin']