from flask import request
from flask_restful import Resource
from aiohttp import ClientSession
from inspect import currentframe

from ...lib.Firestore import Firestore
from ...lib.Logger import Logger
from ... import start_tasks_queue


class NewTask(Resource):
    async def get(self) -> dict:
        return {'message': 'NewTask end point is running'}
    
    async def post(self) -> dict:
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

                return {
                    'message': 'Task has been added',
                    'success': True,
                    'new_task_id': id
                }
            except Exception as e:
                await logger.LOG_ERROR(f'FlaskApp/new_task/line {currentframe().f_lineno}', e, task)
                return {
                    'message': 'Some error occured on server side',
                    'success': False
                }

__all__ = ['NewTask']