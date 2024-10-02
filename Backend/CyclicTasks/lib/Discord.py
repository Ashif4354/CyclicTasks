from os import environ
from inspect import currentframe
from .GetIstTime import get_ist_time

class Discord:
    def __init__(self) -> None:
        self.dev_webhook_url = environ['DISCORD_WEBHOOK_URL_DEV_ADMIN']
        self.dev_vitals_webhook_url = environ['DISCORD_WEBHOOK_URL_DEV_VITALS']

    async def send_start_task_acknowledgement(self, task: dict, success: bool=True) -> None:
        """
        Sends a embed to the discord channel that the task has been started.
        """
        embed: dict = {}
        data: dict = {
            'embeds': []
        }

        embed['title'] = 'New Task' + (' Started' if success else ' Failed') + f': {task["task_name"]}'
        embed['description'] = (
            f'Task ID: {task["id"]}\n'
            f'Task Name: {task["task_name"]}\n'
            f'URL: {task["url"]}\n'
            f'Interval : {task["interval"]}\n'
            f'User Email: {task["user_email"]}\n'
            f'User Name: {task["user_name"]}\n'
            f'Start Date-Time: {get_ist_time()}\n'
        )

        if success:
            embed['color'] = 0x00ff00 # Green
        else:
            embed['color'] = 0xff0000 # Red

        data['embeds'].append(embed)

        await self.send_to_webhook(task['discord_webhook_url'], data)

        if task['notify_admin']:
            await self.send_to_webhook(self.dev_webhook_url, data)

        await self.LOG_EVENT(f'Discord/send_start_task_acknowledgement/{currentframe().f_lineno}', 'CyclicTasks', f'Start Task Acknowledgement sent in discord', task)


    async def send_stop_task_acknowledgement(self, task: dict) -> None:
        """
        Sends a embed to the discord channel that the task has been stopped.
        """
        data: dict = {
            'embeds' : [
                {
                    'title': f'Task Stopped: {task["task_name"]}',
                    'description': f'Task ID: {task["id"]}\nStopping Date-Time: {get_ist_time()}',
                    'color': 0xffa600
                }
            ]
        }

        await self.send_to_webhook(task['discord_webhook_url'], data)

        if task['notify_admin']:
            await self.send_to_webhook(self.dev_webhook_url, data)

        await self.LOG_EVENT(f'Discord/send_stop_task_acknowledgement/{currentframe().f_lineno}', 'CyclicTasks', f'Stop Task Acknowledgement sent in discord', task)



    async def send_vitals(self, url: str, task_name: str, color: int=0xff0000, success: bool=True, notify_admin: bool=False) -> None:
        """
        Send an acknowledgement to the discord channel that the pulse has been sent.
        """

        data: dict = {
            'embeds': [
                {
                    'title': task_name + ' Vitals',
                    'description': f'Sent one pulse at: {get_ist_time()}' if success else f'Failed to send pulse at: {get_ist_time()}',
                    'color': color      
                }          
            ]
        }

        await self.send_to_webhook(url, data)

        if notify_admin:
            await self.send_to_webhook(self.dev_vitals_webhook_url, data)

    async def send_to_webhook(self, url: str, data: dict):
        """
        This functiomn sends the embed to the discord webhook.
        """
        if url == '':
            return

        headers: dict = {
            'Content-Type': 'application/json'
        }

        try:
            await self.session.post(
                url = url,
                headers=headers,
                json=data
            )
        except Exception as e:
            await self.LOG_ERROR(f'Discord/send_to_webhook/{currentframe().f_lineno}', e, None)



    