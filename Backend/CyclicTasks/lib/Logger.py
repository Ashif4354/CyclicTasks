from aiohttp import ClientSession
from os import environ
from flask import request
from werkzeug.local import LocalProxy
from traceback import format_exc
from logging import getLogger
from inspect import currentframe

from .Discord import Discord
from .GetIstTime import get_ist_time


class Logger(Discord):
    def __init__(self, session: ClientSession | None = None) -> None:
        super().__init__()

        if session:
            self.session = session

        self.dev_logs_event_url = environ['DISCORD_WEBHOOK_URL_DEV_EVENT_LOGS']
        self.dev_logs_request_url = environ['DISCORD_WEBHOOK_URL_DEV_REQUESTS_LOGS']
        self.dev_logs_error_url = environ['DISCORD_WEBHOOK_URL_DEV_ERRORS_LOGS']

        self.flask_app_logger = getLogger('flask_app')
        self.cyclic_tasks_logger = getLogger('cyclic_tasks')
        

    async def REQUESTS(self, request: LocalProxy) -> None:
        request_headers: dict = request.headers

        try:
            request_body: dict = request.json 
        except Exception as _:
            request_body: dict = {}

        request_method: str = request.method
        request_path: str = request.path
        request_url: str = request.url
        request_ip: str = request.remote_addr
        request_size = str((request.content_length if request.content_length else 0) + sum([len(key) + len(value) for key, value in request_headers.items()]))
        
        self.flask_app_logger.info('New Request recieved', extra={
            'json_fields' : {
                'remote_ip': request_ip,
                'request_method': request_method,
                'request_path': request_path,
                'request_url': request_url,
                'request_size': request_size,
                'request_headers': {key: value for key, value in request_headers.items()},
                'request_body': request_body
            },
            'labels': {
                'remote_ip': request_ip,
                'log_type': 'request',
            }
        })
        
        if environ['ENABLE_DISCORD_LOGS'] == 'True':
            log_data = {
                'title': 'New Request Recieved',
                'description': f'TIME_STAMP: {get_ist_time()}',
                'fields': [
                    {'name': 'IP', 'value': request_ip},
                    {'name': 'Method', 'value': request_method},
                    {'name': 'Path', 'value': request_path},
                    {'name': 'URL', 'value': request_url},
                    {'name': 'Headers', 'value': '\n'.join([f'{key}: {value}' for key, value in request_headers.items()])},
                    {'name': 'Body', 'value': '\n'.join([f'{key}: {request_body[key]}' for key, value in request_body])}
                ],
                'color': 0xffffff
            }
            discord_embed_data = {
                'embeds': [
                    log_data
                ]
            }
            await self.send_webhook(self.dev_logs_request_url, discord_embed_data)


    async def LOG_ERROR(self, location: str, error: Exception, task: dict | None = None, error_not_exception: bool = False) -> None:
        error_data = {
            'location': location,
            'error': str(error),
            'traceback': format_exc(),
        }                        

        if location.startswith('CyclicTasks'):
            if task:
                labels = {
                    'task_id': task['id'],
                    'task_name': task['task_name'],
                    'user_email': task['user_email'],
                    'url': task['url'],
                }
            else:
                labels = {
                    'task': 'Not a task related error'
                }
            labels['log_type'] = 'error'
            
            if error_not_exception:
                self.cyclic_tasks_logger.error('CyclicTasks Error', extra={
                    'json_fields': error_data,
                    'labels': labels
                })
            else:
                self.cyclic_tasks_logger.exception('CyclicTasks Exception', extra={
                    'json_fields': error_data,
                    'labels': labels
                })
        else:
            if task:
                labels = {
                    'task_id': task['id'],
                    'task_name': task['task_name'],
                    'user_email': task['user_email'],
                    'url': task['url'],
                }
            else:
                labels = {
                    "end_point": '/' + '/'.join(location.split('/')[1:]).rstrip('/'),
                    'task': 'Not a task related error'
                }
            
            labels['log_type'] = 'error'

            if error_not_exception:
                self.flask_app_logger.error('FlaskApp Error', extra={
                    'json_fields': error_data,
                    'labels': labels
                })
            else:
                self.flask_app_logger.exception('FlaskApp Exception', extra={
                    'json_fields': error_data,
                    'labels': labels
                })

        if environ['ENABLE_TERMINAL_LOGS'] == 'True':
            for key in error_data:
                print(f'{key}: {error_data[key]}')


        if environ['ENABLE_DISCORD_LOGS'] == 'True':
            data = {
                'embeds': [
                    {
                        'title': 'Error Occured',
                        'description': f'TIME_STAMP: {get_ist_time()}',
                        'fields': [
                            { 'name': 'Location','value': location },
                            { 'name': 'Error','value': str(error) },
                            { 'name': 'Task in progress','value': task if task else 'Not a task related error' },
                            { 'name': 'Traceback','value': format_exc() }
                        ],
                        'color': 0xff0000
                    }
                ]
            }

            await self.send_webhook(self.dev_logs_error_url, data)


    async def ALERT(self, location: str, message: str, request: LocalProxy) -> None:

        if location.startswith('CyclicTasks'):
            self.cyclic_tasks_logger.critical('CyclicTasks Alert', extra={
                'json_fields': {
                    'info': message,
                    'location': location
                },
                'labels': {
                    'log_type': 'alert'
                }
            })

        else:
            self.flask_app_logger.critical('FlaskApp Alert', extra={
                'json_fields': {
                    'info': message,
                    'location': location,
                    'remote_ip': request.remote_addr
                },
                'labels': {
                    'log_type': 'alert',
                    'remote_ip': request.remote_addr
                }
            })

        if environ['ENABLE_TERMINAL_LOGS'] == 'True':
            print(f'ALERT: {message}')


        if environ['ENABLE_DISCORD_LOGS'] == 'True':
            data = {
                'embeds': [
                    {
                        'title': 'Alert',
                        'description': f'TIME_STAMP: {get_ist_time()}',
                        'fields': [
                            { 'name': 'Alert Message','value': message }
                        ],
                        'color': 0xff0000
                    }
                ]
            }

            await self.send_webhook(self.dev_logs_event_url, data)
    
    async def LOG_EVENT(self, location: str, For: str, message: str, task: dict | None) -> None:

        data: dict = {
            'location': location,
            'message': message,
        }

        labels: dict = {
            'log_type': 'event'
        }

        if task:
            labels['task_id'] = task['id']
            labels['task_name'] = task['task_name']
            labels['user_email'] = task['user_email']
            labels['url'] = task['url']
        else:
            labels['task'] = 'Not a task related event'

        if For == 'FlaskApp':
            self.flask_app_logger.info(message, extra={
                'json_fields': data,
                'labels': labels
            })

        elif For == 'CyclicTasks':
            self.cyclic_tasks_logger.info(message, extra={
                'json_fields': data,
                'labels': labels
            })

        if environ['ENABLE_TERMINAL_LOGS'] == 'True':
            print(f'EVENT: {message}')


        if environ['ENABLE_DISCORD_LOGS'] == 'True':
            data = {
                'embeds': [
                    {
                        'title': 'Event',
                        'description': f'TIME_STAMP: {get_ist_time()}',
                        'fields': [
                            { 'name': 'Location','value': location },
                            { 'name': 'Message','value': message },
                            { 'name': 'Task in progress','value': task if task else 'Not a task related event' }
                        ],
                        'color': 0xffffff
                    }
                ]
            }

            await self.send_webhook(self.dev_logs_event_url, data)


__all__ = ['Logger']