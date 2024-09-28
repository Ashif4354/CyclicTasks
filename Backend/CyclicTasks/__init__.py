try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass

from os import environ
from asyncio import Queue

from .config.GoogleCloudLogging import *   # Initialize Google Cloud Logging

start_tasks_queue: Queue = Queue()
stop_task_queue: Queue = Queue()

dummy_task = {
    'id': 'dummy',
    'task_name': 'Dummy Task',
    'interval': 3600,
    'active': True,
    'notify_admin': True,
    'discord_webhook_url': '',
    'discord_webhook_color': '',
    'user_name': 'Dummy User',
    'user_email': 'dummy_user@gmail.com',
    'url': environ['CT_SITE_URL']
}

__all__ = [
    'start_tasks_queue',
    'stop_task_queue',
    'dummy_task'
]

