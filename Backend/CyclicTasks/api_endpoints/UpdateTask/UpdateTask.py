from flask import request
from flask_restful import Resource
from aiohttp import ClientSession
from inspect import currentframe

from ...lib.Firestore import Firestore
from ...lib.Logger import Logger
from ... import start_tasks_queue, stop_task_queue

class UpdateTask(Resource):
    async def get(self) -> dict:
        return {'message': 'UpdateTask end point is running'}
    
    async def post(self) -> dict:
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

                return {
                    'message': 'Task data has been changed'  + ' and restarted' if task['active'] else '',
                    'success': True

                }
        
            except Exception as e:
                await logger.LOG_ERROR(f'FlaskApp/update_task/line {currentframe().f_lineno}', e, task)
                return {
                    'message': 'Some error occured on server side',
                    'success': False
                }
            

__all__ = ['UpdateTask']