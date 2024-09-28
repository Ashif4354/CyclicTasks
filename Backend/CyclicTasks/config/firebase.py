from os import environ

import firebase_admin
from firebase_admin import credentials


class FirebaseConfig:
    def __init__(self):
        self.firebaseConfig = {
            "type": environ['FIREBASE_TYPE'],
            "project_id": environ['FIREBASE_PROJECT_ID'],
            "private_key_id":   environ['FIREBASE_PRIVATE_KEY_ID'],
            "private_key": environ['FIREBASE_PRIVATE_KEY'].replace('\\n', '\n'),
            "client_email": environ['FIREBASE_CLIENT_EMAIL'],
            "client_id": environ['FIREBASE_CLIENT_ID'],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": environ['FIREBASE_CLIENT_X509_CERT_URL'],
            "universe_domain": "googleapis.com"
        }
        

    def initialize_firebase(self):
        cred = credentials.Certificate(self.firebaseConfig)
        firebase_admin.initialize_app(cred)
