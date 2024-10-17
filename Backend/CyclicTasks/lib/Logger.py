from aiohttp import ClientSession
from os import environ
from werkzeug.local import LocalProxy
from traceback import format_exc
from logging import getLogger

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
        
        
    async def __aenter__(self):
        return self
    

    async def REQUESTS(self, request: LocalProxy, labels: dict = {}) -> None:
        """
        This function logs any incoming request to the API.
        """
        request_headers: dict = request.headers

        try:
            request_body: dict = request.json 
        except Exception as _:
            request_body: dict = {}

        request_method: str = request.method
        request_path: str = request.path
        request_url: str = request.url
        request_ip: str = request.remote_addr
        request_size: str = str((request.content_length if request.content_length else 0) + sum([len(key) + len(value) for key, value in request_headers.items()]))
        
        if environ['ENABLE_GOOGLE_CLOUD_LOGS'] == 'True':
            labels_: dict = {
                'remote_ip': request_ip,
                'log_type': 'request',
                'host': environ['CT_SERVER_URL'],
                'path': request_path
            }
            
            labels_.update(labels)

            self.flask_app_logger.info(f'New Request received:  {request_path}', extra={
                'json_fields' : {
                    'remote_ip': request_ip,
                    'request_method': request_method,
                    'request_path': request_path,
                    'request_url': request_url,
                    'request_size': request_size,
                    'request_headers': {key: value for key, value in request_headers.items()},
                    'request_body': request_body
                },
                'labels': labels_
            })
        
        if environ['ENABLE_DISCORD_LOGS'] == 'True':
            log_data: dict = {
                'title': 'New Request Received',
                'description': f'TIME_STAMP: {get_ist_time()}',
                'fields': [
                    {'name': 'IP', 'value': request_ip},
                    {'name': 'Method', 'value': request_method},
                    {'name': 'Path', 'value': request_path},
                    {'name': 'URL', 'value': request_url},
                    {'name': 'Headers', 'value': '\n'.join([f'{key}: {value}' for key, value in request_headers.items()])},
                    {'name': 'Body', 'value': '\n'.join([f'{key}: {request_body[key]}' for key in request_body])}
                ],
                'color': 0xffffff
            }
            discord_embed_data: dict = {
                'embeds': [
                    log_data
                ]
            }
            await self.send_to_webhook(self.dev_logs_request_url, discord_embed_data)


    async def LOG_ERROR(self, location: str, error: Exception, task: dict | None = None, error_not_exception: bool = False, labels: dict = {}) -> None:
        """
        This function logs any error that occurs in the application.
        """
        error_data: dict = {
            'location': location,
            'error': str(error),
            'traceback': format_exc(),
        }  

        if environ['ENABLE_GOOGLE_CLOUD_LOGS'] == 'True':                      

            if location.startswith('CyclicTasks'):
                if task:
                    labels_: dict = {
                        'task_id': task['id'],
                        'task_name': task['task_name'],
                        'user_email': task['user_email'],
                        'url': task['url'],
                    }
                else:
                    labels_: dict = {
                        'task': 'Not a task related error'
                    }
                    
                labels_['log_type'] = 'error'
                labels_['host'] = environ['CT_SERVER_URL']
                labels_.update(labels)                
                
                if error_not_exception:
                    self.cyclic_tasks_logger.error('CyclicTasks Error', extra={
                        'json_fields': error_data,
                        'labels': labels_
                    })
                    
                else:
                    self.cyclic_tasks_logger.exception('CyclicTasks Exception', extra={
                        'json_fields': error_data,
                        'labels': labels_
                    })
                    
            else:
                if task:
                    labels_: dict = {
                        'task_id': task['id'],
                        'task_name': task['task_name'],
                        'user_email': task['user_email'],
                        'url': task['url'],
                    }
                    
                else:
                    labels_: dict = {
                        "end_point": '/' + '/'.join(location.split('/')[1:]).rstrip('/'),
                        'task': 'Not a task related error'
                    }
                
                labels_['log_type'] = 'error'
                labels_['host'] = environ['CT_SERVER_URL']
                labels_.update(labels)

                if error_not_exception:
                    self.flask_app_logger.error('FlaskApp Error', extra={
                        'json_fields': error_data,
                        'labels': labels_
                    })
                    
                else:
                    self.flask_app_logger.exception('FlaskApp Exception', extra={
                        'json_fields': error_data,
                        'labels': labels_
                    })

        if environ['ENABLE_TERMINAL_LOGS'] == 'True':
            for key in error_data:
                print(f'{key}: {error_data[key]}')

        if environ['ENABLE_DISCORD_LOGS'] == 'True':
            data: dict = {
                'embeds': [
                    {
                        'title': 'Error Occurred',
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

            await self.send_to_webhook(self.dev_logs_error_url, data)


    async def ALERT(self, location: str, message: str, request: LocalProxy, labels: dict = {}) -> None:
        """
        This function logs any critical events that occurs in the application.
        """
        if environ['ENABLE_GOOGLE_CLOUD_LOGS'] == 'True':
            labels_: dict = {
                'log_type': 'alert',
                'host': environ['CT_SERVER_URL']
            }
            
            labels_.update(labels)

            if location.startswith('CyclicTasks'):

                self.cyclic_tasks_logger.critical('CyclicTasks Alert', extra={
                    'json_fields': {
                        'info': message,
                        'location': location
                    },
                    'labels': labels_
                })

            else:
                labels_['remote_ip'] = request.remote_addr
                
                self.flask_app_logger.critical('FlaskApp Alert', extra={
                    'json_fields': {
                        'info': message,
                        'location': location,
                        'remote_ip': request.remote_addr
                    },
                    'labels': labels_
                })

        if environ['ENABLE_TERMINAL_LOGS'] == 'True':
            print(f'ALERT: {message}')


        if environ['ENABLE_DISCORD_LOGS'] == 'True':
            data: dict = {
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

            await self.send_to_webhook(self.dev_logs_event_url, data)
    
    
    async def LOG_EVENT(self, location: str, For: str, message: str, task: dict | None, labels: dict = {}, extra_payload: dict = {}) -> None:
        """
        This function logs every event that occurs in the application.
        """
        if environ['ENABLE_GOOGLE_CLOUD_LOGS'] == 'True':

            data: dict = {
                'location': location,
                'message': message,
            }

            data.update(extra_payload)

            labels_: dict = {
                'log_type': 'event',
                'host': environ['CT_SERVER_URL']
            }
            
            labels_.update(labels)

            if task:
                labels_['task_id'] = task['id']
                labels_['task_name'] = task['task_name']
                labels_['user_email'] = task['user_email']
                labels_['url'] = task['url']
            else:
                labels_['task'] = 'Not a task related event'

            if For == 'FlaskApp':
                self.flask_app_logger.info(message, extra={
                    'json_fields': data,
                    'labels': labels_
                })

            elif For == 'CyclicTasks':
                self.cyclic_tasks_logger.info(message, extra={
                    'json_fields': data,
                    'labels': labels_
                })

        if environ['ENABLE_TERMINAL_LOGS'] == 'True':
            print(f'EVENT: {message}')

        if environ['ENABLE_DISCORD_LOGS'] == 'True':
            data: dict = {
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

            await self.send_to_webhook(self.dev_logs_event_url, data)
            
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass


__all__ = ['Logger']