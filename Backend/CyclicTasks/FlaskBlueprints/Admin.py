from flask import Blueprint, jsonify, request
from firebase_admin import auth
from aiohttp import ClientSession
from inspect import currentframe
from os import environ

from ..lib.Logger import Logger
from ..lib.Firestore import Firestore
from ..lib.Authentication import Authentication
from ..CyclicTasks import CyclicTasks
from .lib.ValidateUser import admin
from .Users import Users


Admin = Blueprint('admin', __name__, url_prefix='/admin')
Admin.register_blueprint(Users)

@Admin.before_request
async def before_request():
    """
    This function will run before every request to the Admin Blueprint.
    """
    async with ClientSession() as session:
        logger = Logger(session)
        if request.method in ('GET', 'POST'):
            if request.headers.get('host-token') == environ['host-token']:
                pass
            elif not request.headers.get('Authorization') or not request.headers.get('Authorization').startswith('Bearer '):
                await logger.ALERT(f'FlaskApp/Admin/before_request/{currentframe().f_lineno}', 
                            'Authorization failed', 
                            request,
                            labels={
                                'alert_type': 'authorization_failed'
                            })
                
                return jsonify({
                    'message': 'Authorization failed',
                    'success': False
                })
                
            elif not admin(request.headers.get('Authorization').split(' ')[1]):
                await logger.ALERT(f'FlaskApp/Admin/before_request/{currentframe().f_lineno}', 
                            'User is not an Admin', 
                            request,
                            labels={
                                'alert_type': 'not_an_admin'
                            })
                
                return jsonify({
                    'message': 'You are not an Admin',
                    'success': False
                })
                
            elif admin(request.headers.get('Authorization').split(' ')[1]):
                user = auth.verify_id_token(request.headers.get('Authorization').split(' ')[1], clock_skew_seconds=10)
                
                if 'blocked' in user and user['blocked']:
                    await logger.ALERT(f'FlaskApp/Admin/before_request/{currentframe().f_lineno}', 
                            'Blocked Admin tried to access admin console', 
                            request,
                            labels={
                                'alert_type': 'user_is_blocked'
                            })
                    
                    return jsonify({
                        'message': 'You are Blocked',
                        'success': False
                    })


@Admin.route('/verifyadmin', methods=['POST'])
async def verify_admin():
    """
    This endpoint will verify if the user is an admin or not.
    """
    user = auth.verify_id_token(request.headers.get('Authorization').split(' ')[1], clock_skew_seconds=10)

    if 'owner' in user and user['owner']:
        return jsonify({
            'success': True,
            'owner': True
        })
    else:
        return jsonify({
            'success': True,
            'owner': False
        })
    

@Admin.route('/getrunningtasks', methods=['GET'])
async def get_running_tasks():
    """
    This endpoint will return the list of tasks that are currently running.
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
                                request,
                                labels={
                                    'alert_type': 'just_exception'
                                })
            return jsonify({
                'message': 'Internal Server Error',
                'success': False
            })

@Admin.route('/loggingstatus', methods=['GET', 'POST'])
async def logging_status():
    """
    This endpoint will return the status of the logging.
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
                            None,
                            labels={
                                'accessed_admin': auth.verify_id_token(request.headers.get('Authorization').split(' ')[1], clock_skew_seconds=10)['email'],
                                'event_type': 'logging_status_updated'
                            })

            return jsonify({
                'success': True,
                'message': 'Logging status updated'
            })
    

@Admin.route('/getusers', methods=['POST'])
async def get_users():
    """
    This endpoint will return the list of users.
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
    This endpoint will return the list of all tasks.
    """

    async with ClientSession() as session:
        logger = Logger(session)
        
        try:
            FS = Firestore(initialized=True)
            tasks: list[dict] = await FS.get_all_tasks(for_='FlaskApp', include_inactive_tasks=True)

            await logger.LOG_EVENT(f'FlaskApp/Admin/GetAllTasks/{currentframe().f_lineno}', 
                        'FlaskApp', 
                        f'All Tasks fetched for admin: {len(tasks)}', 
                        None,
                        labels={
                            'event_type': 'fetch_all_tasks',
                        })
        
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
        

@Admin.route('/getadmins', methods=['GET'])
async def get_admins():
    """
    This endpoint will return the list of admins.
    """

    async with ClientSession() as session:
        logger = Logger(session)

        try:
            Auth = Authentication(initialized=True)
            admins: list[dict] = await Auth.get_admins()

            await logger.LOG_EVENT(f'FlaskApp/Admin/GetAdmins/{currentframe().f_lineno}',
                        'FlaskApp',
                        f'Admins fetched: {len(admins)}',
                        None,
                        labels={
                            'accessed_admin': auth.verify_id_token(request.headers.get('Authorization').split(' ')[1], clock_skew_seconds=10)['email'],
                            'event_type': 'fetch_admins'
                        })
            
            return jsonify({
                'success': True,
                'admins': admins
            })
        
        except Exception as e:
            await logger.LOG_ERROR(f'FlaskApp/Admin/GetAdmins/{currentframe().f_lineno}', e, None)

            return jsonify({
                'message': 'Internal Server Error',
                'success': False
            })
        

@Admin.route('/grantrevokeadmin', methods=['POST'])
async def make_admin():
    """
    This endpoint will grant or revoke the admin role to the user.
    """

    async with ClientSession() as session:
        logger = Logger(session)
        
        admin = auth.verify_id_token(request.headers.get('Authorization').split(' ')[1], clock_skew_seconds=10)        
        if 'owner' in admin and not admin['owner']:
            await logger.ALERT(f'FlaskApp/Admin/MakeAdmin/{currentframe().f_lineno}',
                               'A user tried to make an admin without being the owner',
                                 request,
                                 labels={
                                     'alert_type': 'not_owner'
                                 })
            
            return jsonify({
                'message': 'You are not the owner of the application',
                'success': False
            })

        try:
            Auth = Authentication(initialized=True)
            if request.json['admin']:
                await Auth.grant_admin(request.json['email'])

                await logger.LOG_EVENT(f'FlaskApp/Admin/MakeAdmin/{currentframe().f_lineno}',
                            'FlaskApp',
                            f'User {request.json["email"]} granted admin role',
                            None,
                            labels={
                                'accessed_admin': auth.verify_id_token(request.headers.get('Authorization').split(' ')[1], clock_skew_seconds=10)['email'],
                                'event_type': 'grant_admin'
                            })
            
            else:
                await Auth.revoke_admin(request.json['email'])

                await logger.LOG_EVENT(f'FlaskApp/Admin/MakeAdmin/{currentframe().f_lineno}',
                            'FlaskApp',
                            f'User {request.json["email"]} revoked from admin role',
                            None,
                            labels={
                                'accessed_admin': auth.verify_id_token(request.headers.get('Authorization').split(' ')[1], clock_skew_seconds=10)['email'],
                                'event_type': 'revoke_admin'
                            })

            return jsonify({
                'success': True
            })
        
        except Exception as e:
            await logger.LOG_ERROR(f'FlaskApp/Admin/MakeAdmin/{currentframe().f_lineno}', e, None)

            return jsonify({
                'message': 'Internal Server Error',
                'success': False
            })


__all__ = ['Admin']