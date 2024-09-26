from asyncio import sleep , Task, gather
from asyncio import create_task as asyncio_create_task
from aiohttp import ClientSession

from .lib.Firestore import Firestore
from .lib.Discord import Discord
from . import start_tasks_queue, stop_task_queue

class CyclicTasks(Firestore, Discord):

    RUNNING_TASKS: dict[str, dict] = {}

    def __init__(self, session: ClientSession) -> None:
        super().__init__()
        Discord.__init__(self)
        self.session = session


    async def get_request(self, url: str, task_name: str, webhook_url: str, webhook_color: int, notify_admin: bool) -> None:
        try:
            await self.session.get(url)
            await self.send_vitals(webhook_url, task_name, webhook_color, notify_admin=notify_admin)
        except Exception as _:
            await self.send_vitals(webhook_url, task_name, success=False, notify_admin=notify_admin)


    async def create_task(self, task: dict, running_id: int) -> Task:
        
        async def runner_task():
            task_id: str = task['id']

            while self.RUNNING_TASKS[task_id]['running_tasks'][running_id]:

                await self.get_request(
                    url = task['url'], 
                    task_name = task['task_name'], 
                    webhook_url= task['discord_webhook_url'],
                    webhook_color = hex(int(task['discord_webhook_color'], 16)) if task['discord_webhook_color'] else 0xffffff,
                    notify_admin = task['notify_admin']
                )

                await sleep(task['interval'])
        
        async_task: Task = asyncio_create_task(runner_task())

        return async_task


    async def start_task(self, task: dict) -> None:

        if task['id'] not in self.RUNNING_TASKS:
            self.RUNNING_TASKS[task['id']] = {
                'running_tasks': {},
                'current_running_task': None
            }

        
        running_id = str(len(self.RUNNING_TASKS[task['id']]['running_tasks']))


        self.RUNNING_TASKS[task['id']]['current_running_task'] = running_id
        self.RUNNING_TASKS[task['id']]['running_tasks'][running_id] = True

        await self.send_start_task_acknowledgement(task)

        async_task: Task = await self.create_task(task, running_id)
        

        await async_task


    async def starter_task(self) -> None:
        global start_tasks_queue
        print('Starter Task Started')

        tasks: list[dict] = await self.get_all_tasks()
        # print(tasks)

        for task in tasks:
            await start_tasks_queue.put(task)

        # print(start_tasks_queue)

        while True:
            task: dict = await start_tasks_queue.get()
            # print('Task', task['id'], 'Queued')

            asyncio_create_task(self.start_task(task))

            # await TASK
            print('Task', task['id'], 'Started')

            # await start_tasks_queue.task_done()        


    async def stop_task(self, task: dict) -> None:
        current_task_running_id = self.RUNNING_TASKS[task['id']]['current_running_task']

        if current_task_running_id is None:
            print('Task', task['id'], 'Already Stopped')
            return

        self.RUNNING_TASKS[task['id']]['running_tasks'][current_task_running_id] = False
        self.RUNNING_TASKS[task['id']]['current_running_task'] = None

        print('Task', task['id'], 'Stopped')

        await self.send_stop_task_acknowledgement(task)

        
    async def stopper_task(self) -> None:
        global stop_task_queue
        print('Stopper Task Started')

        while True:
            task: dict = await stop_task_queue.get()
            
            if task['id'] not in self.RUNNING_TASKS:
                continue

            # await self.stop_task(task)
            asyncio_create_task(self.stop_task(task))

            # await stop_task_queue.task_done()

    async def run(self) -> None:

        STARTER_TASK = asyncio_create_task(self.starter_task())
        STOPPER_TASK = asyncio_create_task(self.stopper_task())
        print('Tasks Started')

        await gather(STARTER_TASK, STOPPER_TASK)


__all__ = ['CyclicTasks']