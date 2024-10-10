from flask import Blueprint, jsonify, request
from aiohttp import ClientSession
from inspect import currentframe
from os import environ

from ..lib.Logger import Logger
from ..lib.Firestore import Firestore
from ..lib.Authentication import Authentication
from .. import stop_task_queue

Users = Blueprint('users', __name__, url_prefix='/users')

@Users.before_request
async def before_request():
    pass


@Users.route('/suspenduserstasks', methods=['POST'])
async def suspend_user():
    async with ClientSession() as session:
        logger = Logger(session)
        try:
            users_emails: list[str] = request.json['emails']

            FS = Firestore(initialized=True)

            for user_email in users_emails:

                user_tasks: list = await FS.get_all_task_of_user(user_email)
                
                if user_tasks == []:
                    await logger.LOG_EVENT(f'FlaskApp/Admin/Users/suspend_user/{currentframe().f_lineno}', 
                                        'FlaskApp', 
                                        f'No tasks found for user: {user_email}', 
                                        None,
                                        labels={
                                                'user_email': user_email
                                        })
                    continue

                for task in user_tasks:
                    task['active'] = False
                    # print(task)
                    
                    await stop_task_queue.put(task.copy())
                    await FS.update_task(task)

                await logger.LOG_EVENT(f'FlaskApp/Admin/Users/suspend_user/{currentframe().f_lineno}',
                                        'FlaskApp',
                                        f'User tasks suspended: {user_email}',
                                        None,
                                        labels={
                                            'user_email': user_email
                                        })

            await logger.LOG_EVENT(f'FlaskApp/Admin/Users/suspend_user/{currentframe().f_lineno}', 
                                'FlaskApp', 
                                f'Users tasks suspended', 
                                None,
                                extra_payload={
                                    'users_emails': '\n'.join(users_emails)
                                })
            
            return jsonify({
                'message': 'Users tasks suspended',
                'success': True
            })
        except Exception as e:
            await logger.LOG_ERROR(f'FlaskApp/Admin/Users/suspend_user/{currentframe().f_lineno}', e, None)

            return jsonify({
                'message': 'Some error occurred',
                'success': False
            })
        

@Users.route('/blockuser', methods=['POST'])
async def block_user():
    async with ClientSession() as session:
        logger = Logger(session)

        try:
            user_emails: str = request.json['emails']
            Auth = Authentication(initialized=True)

            for user_email in user_emails:

                if request.json['block']:
                    await Auth.block_user(user_email)
                    
                    await logger.LOG_EVENT(f'FlaskApp/Admin/Users/block_user/{currentframe().f_lineno}',
                                            'FlaskApp',
                                            f'User blocked: {user_email}',
                                            None,
                                            labels={
                                                'user_email': user_email
                                            })
                else:
                    await Auth.unblock_user(user_email)
                    
                    await logger.LOG_EVENT(f'FlaskApp/Admin/Users/block_user/{currentframe().f_lineno}',
                                            'FlaskApp',
                                            f'User unblocked: {user_email}',
                                            None,
                                            labels={
                                                'user_email': user_email
                                            })
            
            await logger.LOG_EVENT(f'FlaskApp/Admin/Users/block_user/{currentframe().f_lineno}',
                                    'FlaskApp',
                                    f'Users ' + ('Blocked' if request.json['block'] else 'Unblocked'),
                                    None,
                                    extra_payload={
                                        'users_emails': '\n'.join(user_emails)
                                    })
                   
            return jsonify({
                'message': 'Users ' + ('Blocked' if request.json['block'] else 'Unblocked'),
                'success': True
            })  


        except Exception as e:
            await logger.LOG_ERROR(f'FlaskApp/Admin/Users/block_user/{currentframe().f_lineno}', e, None)

            return jsonify({
                'message': 'Some error occurred',
                'success': False
            })








__all__ = ['Users']