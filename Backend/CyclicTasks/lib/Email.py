from smtplib import SMTP
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from os import environ

from .email_template import email_template

class Email:
    def __init__(self):
        self.server = SMTP('smtp.gmail.com', 587)
        self.server.starttls()
        self.server.login(environ['USER_EMAIL_FOR_EMAIL'], environ['PASSWORD_FOR_EMAIL'])
        
        
    async def __aenter__(self):
        return self
    
    
    async def send_suspend_tasks_email(self, recipient_email: str, recipient_name: str, task_names: list):
        """ 
        Send an email to the user informing them that their tasks have been suspended.
        """
        email_content = (
            '<p>We regret to inform you that the following tasks of yours have been <span class="red">suspended</span>:<br></p>'
            f'{''.join([f'<pre>{i+1}. {task_name}</pre>' for i, task_name in enumerate(task_names)])}'            
            f'<br>Total tasks suspended: {len(task_names)}<br>'
            '<p><br>Your tasks have been suspended due to violation of our terms and conditions.</p>'
            '<p><br>If you believe this action was taken in error, or if you would like to discuss the matter further, please feel free to reach out to our support team.</p>'
            '<p><br>We take the security and compliance of our platform seriously and appreciate your understanding in this matter.</p>'
        )
        
        subject = 'Tasks Suspended'
        
        body = email_template.format(
            USER_NAME = recipient_name,
            EMAIL_CONTENT = email_content
        )
        
        await self.send_email(recipient_email, subject, body)
        
        
    async def block_user(self, recipient_email: str, recipient_name: str):
        """ 
        Send an email to the user informing them that their account has been blocked.
        """
        email_content = (
            '<p>We regret to inform you that your account has been <span class="red">blocked</span> and your tasks have been suspended.<br></p>'
            '<p><br>Your account was blocked due to violation of our terms and conditions.</p>'
            '<p><br>While blocked, you will not be able to add / modify your tasks.</p>'
            '<p><br>If you believe this action was taken in error, or if you would like to discuss the matter further, please feel free to reach out to our support team.</p>'
            '<p><br>We take the security and compliance of our platform seriously and appreciate your understanding in this matter.</p>'
        )
        
        subject = 'Account Blocked'
        
        body = email_template.format(
            USER_NAME = recipient_name,
            EMAIL_CONTENT = email_content
        )
        
        await self.send_email(recipient_email, subject, body)
        
        
    async def unblock_user(self, recipient_email: str, recipient_name: str):
        """ 
        Send an email to the user informing them that their account has been unblocked.
        """
        email_content = (
            '<p>We are pleased to inform you that your account has been <span class="green">unblocked</span>.<br></p>'
            '<p><br>You can now add / modify your tasks.</p>'
            '<p><br>If you have any questions or need further assistance, please feel free to reach out to our support team.</p>'
            '<p><br>Thank you for your understanding and cooperation.</p>'
        )
        
        subject = 'Account Unblocked'
        
        body = email_template.format(
            USER_NAME = recipient_name,
            EMAIL_CONTENT = email_content
        )
        
        await self.send_email(recipient_email, subject, body)
        
    async def grant_admin(self, recipient_email: str, recipient_name: str):
        """ 
        Send an email to the user informing them that they have been granted admin privileges.
        """
        email_content = (
            '<p>We are pleased to inform you that you have been granted <span class="green">admin</span> privileges.<br></p>'
            '<p><br>You can now access the admin console and manage the tasks of all users.</p>'
            '<p><br>If you have any questions or need further assistance, please feel free to reach out to our support team.</p>'
            '<p><br>Thank you for your understanding and cooperation.</p>'
        )
        
        subject = 'Admin Privileges Granted'
        
        body = email_template.format(
            USER_NAME = recipient_name,
            EMAIL_CONTENT = email_content
        )
        
        await self.send_email(recipient_email, subject, body)
        
    async def revoke_admin(self, recipient_email: str, recipient_name: str):
        """ 
        Send an email to the user informing them that their admin privileges have been revoked.
        """
        email_content = (
            '<p>We regret to inform you that your <span class="red">admin</span> privileges have been revoked.<br></p>'
            '<p><br>You will no longer have access to the admin console.</p>'
            '<p><br>If you have any questions or need further assistance, please feel free to reach out to our support team.</p>'
            '<p><br>Thank you for your understanding and cooperation.</p>'
        )
        
        subject = 'Admin Privileges Revoked'
        
        body = email_template.format(
            USER_NAME = recipient_name,
            EMAIL_CONTENT = email_content
        )
        
        await self.send_email(recipient_email, subject, body)     
        
    
    async def send_email(self, recipient_email: str, subject: str, body: str):
        """ 
        Send an email to the recipient.
        """
        msg = MIMEMultipart()
        msg['From'] = f'CyclicTasks <{environ['USER_EMAIL_FOR_EMAIL']}>'
        msg['To'] = recipient_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))
        self.server.sendmail(msg['From'], msg['To'], msg.as_string())

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self.server.quit()
        

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()   
    from asyncio import run
    
    async def main():
        async with Email() as email:
            # await email.send_suspend_tasks_email('ashif.abhas@gmail.com', 'Ashif', ['Task 1', 'Task 2', 'Task 3'])
            await email.grant_admin('ashif.abhas@gmail.com', 'Ashif')
        
    run(main())
    