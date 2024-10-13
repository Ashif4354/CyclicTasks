from smtplib import SMTP
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from os import environ

class Email:
    def __init__(self):
        self.server = SMTP('smtp.gmail.com', 587)
        self.server.starttls()
        self.server.login(environ['USER_EMAIL_FOR_EMAIL'], environ['PASSWORD_FOR_EMAIL'])

    def __enter__(self):
        return self
    
    def send_email(self, recipient_email: str, subject: str, body: str):
        msg = MIMEMultipart()
        msg['From'] = f"CyclicTasks <{environ['USER_EMAIL_FOR_EMAIL']}>"
        msg['To'] = recipient_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))
        self.server.sendmail(msg['From'], msg['To'], msg.as_string())

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.server.quit()  