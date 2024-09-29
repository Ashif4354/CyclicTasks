from google.cloud.logging import Client
from google.cloud.logging.handlers import CloudLoggingHandler
from logging import getLogger, INFO

from os import environ

google_cloud_logger_json = {
    "type": environ['GOOGLE_CLOUD_TYPE'],
    "project_id": environ['GOOGLE_CLOUD_PROJECT_ID'],
    "private_key_id":   environ['GOOGLE_CLOUD_PRIVATE_KEY_ID'],
    "private_key": environ['GOOGLE_CLOUD_PRIVATE_KEY'].replace('\\n', '\n'),
    "client_email": environ['GOOGLE_CLOUD_CLIENT_EMAIL'],
    "client_id": environ['GOOGLE_CLOUD_CLIENT_ID'],
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": environ['GOOGLE_CLOUD_CLIENT_X509_CERT_URL'],
    "universe_domain": "googleapis.com"
}

client = Client.from_service_account_info(google_cloud_logger_json)

flask_app_logging_handler = CloudLoggingHandler(client, name='flask_app', async_=True, buffer_size=10, flush_interval=2)
CyclicTasks_logging_handler = CloudLoggingHandler(client, name='cyclic_tasks', async_=True, buffer_size=10, flush_interval=2)

flask_app_logger = getLogger('flask_app')
flask_app_logger.addHandler(flask_app_logging_handler)
flask_app_logger.setLevel(INFO)

cyclic_tasks_logger = getLogger('cyclic_tasks')
cyclic_tasks_logger.addHandler(CyclicTasks_logging_handler)
cyclic_tasks_logger.setLevel(INFO)

__all__ = [] # export nothing