from flask import Blueprint, jsonify, request
from aiohttp import ClientSession
from inspect import currentframe
from os import environ
from firebase_admin import auth

from ..lib.Logger import Logger
from ..lib.Firestore import Firestore
from ..lib.Authentication import Authentication
from .. import stop_task_queue, scheduler_event_loop

Users = Blueprint('users', __name__, url_prefix='/users')

@Users.before_request
async def before_request():
    pass


@Users.route('/suspenduserstasks', methods=['POST'])
async def suspend_user():
    """ 
    This endpoint is used to suspend the tasks of a specific user.
    """
    async with ClientSession() as session:
        logger = Logger(session)
        try:
            accessed_admin = auth.verify_id_token(request.headers.get('Authorization').split(' ')[1], clock_skew_seconds=60)['email']
        except:
            if request.headers.get('host-token'):
                accessed_admin = 'HOST, because the suspenduserstasks endpoint is triggered by the host to suspend blocked user tasks'
            else:
                return jsonify({
                    'message': 'Unauthorized access',
                    'success': False
                })

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
                                                'user_email': user_email,
                                                'event_type': 'no_tasks_found_for_user', 
                                                'accessed_admin': accessed_admin                                          
                                        })
                    continue

                for task in user_tasks:
                    task['active'] = False
                    
                    scheduler_event_loop.call_soon_threadsafe(stop_task_queue.put_nowait, task.copy())
                    await FS.update_task(task)

                await logger.LOG_EVENT(f'FlaskApp/Admin/Users/suspend_user/{currentframe().f_lineno}',
                                        'FlaskApp',
                                        f'User tasks suspended: {user_email}',
                                        None,
                                        labels={
                                            'user_email': user_email,
                                            'event_type': 'user_tasks_suspended',
                                            'accessed_admin': accessed_admin
                                        })

            await logger.LOG_EVENT(f'FlaskApp/Admin/Users/suspend_user/{currentframe().f_lineno}', 
                                'FlaskApp', 
                                f'Users tasks suspended', 
                                None,
                                extra_payload={
                                    'users_emails': '\n'.join(users_emails)
                                },
                                labels={
                                    'event_type': 'users_tasks_suspended',
                                    'accessed_admin': accessed_admin
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
    """ 
    This endpoint is used to block/unblock a specific user.
    """
    async with ClientSession() as session:
        logger = Logger(session)
        accessed_admin = auth.verify_id_token(request.headers.get('Authorization').split(' ')[1], clock_skew_seconds=60)['email']

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
                                                'user_email': user_email,
                                                'event_type': 'user_blocked',
                                                'accessed_admin': accessed_admin
                                            })
                    
                    await session.post(environ['CT_SERVER_URL'] + '/admin/users/suspenduserstasks',                                       
                                        json={'emails': [user_email]},
                                        headers={'host-token': environ['host-token']}
                                        )
                                             
                    
                                 


                else:
                    await Auth.unblock_user(user_email)
                    
                    await logger.LOG_EVENT(f'FlaskApp/Admin/Users/block_user/{currentframe().f_lineno}',
                                            'FlaskApp',
                                            f'User unblocked: {user_email}',
                                            None,
                                            labels={
                                                'user_email': user_email,
                                                'event_type': 'user_unblocked',
                                                'accessed_admin': accessed_admin
                                            })
            
            await logger.LOG_EVENT(f'FlaskApp/Admin/Users/block_user/{currentframe().f_lineno}',
                                    'FlaskApp',
                                    f'Users ' + ('Blocked' if request.json['block'] else 'Unblocked'),
                                    None,
                                    extra_payload={
                                        'users_emails': '\n'.join(user_emails)
                                    },
                                    labels={
                                        'event_type': 'users_blocked' if request.json['block'] else 'users_unblocked',
                                        'accessed_admin': accessed_admin
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
        
@Users.route('/getusertasks', methods=['POST'])
async def get_user_tasks():
    """ 
    This endpoint is used to get the tasks of a specific user.
    """
    async with ClientSession() as session:
        logger = Logger(session)

        try:
            user_email: str = request.json['email']
            FS = Firestore(initialized=True)

            user_tasks: list = await FS.get_all_task_of_user(user_email)

            await logger.LOG_EVENT(f'FlaskApp/Admin/Users/get_user_tasks/{currentframe().f_lineno}',
                                    'FlaskApp',
                                    f'Tasks fetched for user: {user_email}',
                                    None,
                                    labels={
                                        'user_email': user_email,
                                        'event_type': 'user_tasks_fetched'                                        
                                    })

            return jsonify({
                'success': True,
                'tasks': user_tasks
            })
        except Exception as e:
            await logger.LOG_ERROR(f'FlaskApp/Admin/Users/get_user_tasks/{currentframe().f_lineno}', e, None)

            return jsonify({
                'message': 'Some error occurred',
                'success': False
            })
      
       
@Users.route('/suspendtasks', methods=['POST'])
async def suspend_tasks():
    """
    This endpoint is used to suspend the tasks of the user.
    """
    tasks = request.json['tasks']
    async with ClientSession() as session:
        logger = Logger(session)
        accessed_admin = auth.verify_id_token(request.headers.get('Authorization').split(' ')[1], clock_skew_seconds=60)['email']

        try:
            FS = Firestore(initialized=True)
            for task in tasks:
                task['active'] = False
                
                scheduler_event_loop.call_soon_threadsafe(stop_task_queue.put_nowait, task.copy())
                await FS.update_task(task.copy())

                await logger.LOG_EVENT(f'FlaskApp/Admin/Users/suspend_tasks/{currentframe().f_lineno}', 
                                        'FlaskApp', 
                                        f'Task suspended: {task["id"]}', 
                                        task,
                                        labels={
                                            'event_type': 'suspend_task',
                                            'accessed_admin': accessed_admin
                                        })

            await logger.LOG_EVENT(f'FlaskApp/Admin/Users/suspend_tasks/{currentframe().f_lineno}', 
                                   'FlaskApp', 
                                   f'Tasks suspended: {len(tasks)}', 
                                   None,
                                   extra_payload={
                                       'tasks': '\n'.join([task['id'] for task in tasks])
                                   },
                                   labels={
                                       'event_type': 'suspend_tasks',
                                       'accessed_admin': accessed_admin
                                   })

            return jsonify({
                'message': 'Tasks have been suspended',
                'success': True
            })
        except Exception as e:
            await logger.LOG_ERROR(f'FlaskApp/Tasks/suspend_tasks/line {currentframe().f_lineno}', e, None)
            return jsonify({
                'message': 'Some error occurred on server side',
                'success': False
            })








__all__ = ['Users']