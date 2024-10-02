from flask import request
from flask_restful import Resource
from aiohttp import ClientSession
from os import environ
from inspect import currentframe

from ....CyclicTasks import CyclicTasks
from ....lib.Logger import Logger

class GetRunningTasks(Resource):
    async def get(self):
        async with ClientSession() as session:
            logger = Logger(session)
            try:
                if request.args.get('pwd') != environ['ADMIN_PWD']:

                    await logger.ALERT(f'FlaskApp/GetRunningTasks/{currentframe().f_lineno}', 
                                       f'Someone tried to access running_tasks without authorization\nUsed Password: {request.args.get('pwd')}',
                                        request)
                    return {
                        'message': 'Unauthorized',
                        'success': False
                    }
                tasks = CyclicTasks.RUNNING_TASKS
                return {
                    'tasks': tasks
                }
            except Exception as e:
                await logger.ALERT(f'FlaskApp/GetRunningTasks/{currentframe().f_lineno}', 
                                   f'Error: {e}', 
                                   request)
                return {
                    'message': 'Internal Server Error',
                    'success': False
                }


    
    async def post(self):
        return {'message': 'Post method not allowed'}