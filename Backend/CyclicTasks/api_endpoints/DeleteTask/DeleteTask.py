from flask import request
from flask_restful import Resource
from aiohttp import ClientSession
from inspect import currentframe

from ...lib.Firestore import Firestore
from ...lib.Logger import Logger
from ... import stop_task_queue

class DeleteTask(Resource):
    async def get(self) -> dict:
        return {'message': 'DeleteTask end point is running'}
    
    async def post(self) -> dict:
        task = request.json['task']

        async with ClientSession() as session:
            logger = Logger(session)
            try:

                FS = Firestore(initialized=True)
                await FS.delete_task(task['id'], task['user_email'])

                await logger.LOG_EVENT(f'FlaskApp/delete_task/{currentframe().f_lineno}', 'FlaskApp', f'Task has been deleted from Database: {task['id']}', task)

                await stop_task_queue.put(task)

                await logger.LOG_EVENT(f'FlaskApp/delete_task/{currentframe().f_lineno}', 'FlaskApp', f'Task Queued for Stopping: {task["id"]}', task)

                return {
                    'message': 'Task has been deleted',
                    'success': True
                }
            except Exception as e:
                await logger.LOG_ERROR(f'FlaskApp/delete_task/line {currentframe().f_lineno}', e, task)
                return {
                    'message': 'Some error occured on server side',
                    'success': False
                }
            
__all__ = ['DeleteTask']