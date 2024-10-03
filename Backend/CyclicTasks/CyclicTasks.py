from asyncio import sleep , Task, gather
from asyncio import create_task as asyncio_create_task
from aiohttp import ClientSession
from inspect import currentframe

from .lib.Firestore import Firestore
from .lib.Discord import Discord
from .lib.Logger import Logger
from . import start_tasks_queue, stop_task_queue, dummy_task

class CyclicTasks(Firestore, Logger):

    RUNNING_TASKS: dict[str, dict] = {}

    def __init__(self, session: ClientSession) -> None:
        super().__init__()
        Logger.__init__(self)
        self.session = session


    async def get_request(self, task: dict) -> None:
        """
        Send a get request to the given URL.
        """
        try:
            await self.session.get(task['url'])
            await self.send_vitals(task['discord_webhook_url'], task['task_name'], task['discord_webhook_color'], notify_admin=task['notify_admin'])
            
            await self.LOG_EVENT(f'CyclicTasks/get_request/{currentframe().f_lineno}', 'CyclicTasks', f'One pulse sent: {task['id']}', task, labels = {'event_type': 'pulse'})
        except Exception as e:
            await self.send_vitals(task['discord_webhook_url'], task['task_name'], success=False, notify_admin=task['notify_admin'])
            
            await self.LOG_ERROR(f'CyclicTasks/get_request/{currentframe().f_lineno}', e, task, True)


    async def create_task(self, task: dict, running_id: int) -> Task:
        """
        Creates a task that will run the get request at the given interval and returns it.
        """
        
        async def runner_task() -> None:
            task_id: str = task['id']

            while self.RUNNING_TASKS[task_id]['running_tasks'][running_id]:

                await self.get_request(
                    task = task
                )

                await sleep(task['interval'])
        
        async_task: Task = asyncio_create_task(runner_task())
        await self.LOG_EVENT(f'CyclicTasks/create_task/{currentframe().f_lineno}', 'CyclicTasks', f'Runner Task Created: {task['id']}', task, labels = {'event_type': 'create_task'})

        return async_task


    async def start_task(self, task: dict) -> None:
        """
        Starts the task and adds it to the RUNNING_TASK
        """

        if task['id'] not in self.RUNNING_TASKS:
            self.RUNNING_TASKS[task['id']] = {
                'running_tasks': {},
                'current_running_task': None,
                'task_name': task['task_name'],
                'user_name': task['user_name'],
                'user_email': task['user_email']
            }

            await self.LOG_EVENT(f'CyclicTasks/start_task/{currentframe().f_lineno}', 'CyclicTasks', f'Task added to RUNNING_TASKS map: {task['id']}', task, labels = {'event_type': 'add_to_running_tasks'})

        
        running_id: str = str(len(self.RUNNING_TASKS[task['id']]['running_tasks']))
        await self.LOG_EVENT(f'CyclicTasks/start_task/{currentframe().f_lineno}', 'CyclicTasks', f'Running ID Assigned: {running_id} : {task['id']}', task, labels = {'event_type': 'running_id_assigned'})


        self.RUNNING_TASKS[task['id']]['current_running_task'] = running_id
        self.RUNNING_TASKS[task['id']]['running_tasks'][running_id] = True

        await self.send_start_task_acknowledgement(task)

        async_task: Task = await self.create_task(task, running_id)   

        await self.LOG_EVENT(f'CyclicTasks/start_task/{currentframe().f_lineno}', 'CyclicTasks', f'Task Started: {task['id']}', task, labels = {'event_type': 'task_started'})     

        await async_task


    async def starter_task(self) -> None:
        """
        This task will get all the active task from the database and starts them.\n
        It will also add a dummy task to the queue to keep the queue running.
        It will be listening for new tasks to be added to the queue and start them asynchronously.
        """
        global start_tasks_queue
        await self.LOG_EVENT(f'CyclicTasks/starter_task/{currentframe().f_lineno}', 'CyclicTasks', 'Starter Task Started', None, labels = {'event_type': 'starter_task_started'})

        tasks: list[dict] = await self.get_all_tasks()

        tasks.append(dummy_task)
        await self.LOG_EVENT(f'CyclicTasks/starter_task/{currentframe().f_lineno}', 'CyclicTasks', 'Dummy Task Added', dummy_task, labels = {'event_type': 'dummy_task_added'})

        for task in tasks:
            await start_tasks_queue.put(task)

            await self.LOG_EVENT(f'CyclicTasks/starter_task/{currentframe().f_lineno}', 'CyclicTasks', f'Task Queued for Starting: {task["id"]}', task, labels = {'event_type': 'task_queued', 'queueing_type': 'start'})


        while True:
            task = await start_tasks_queue.get()

            await self.LOG_EVENT(f'CyclicTasks/starter_task/{currentframe().f_lineno}', 'CyclicTasks', f'Task Dequeued for starting: {task["id"]}', task, labels = {'event_type': 'task_dequeued', 'dequeueing_type': 'start'})

            asyncio_create_task(self.start_task(task))     


    async def stop_task(self, task: dict) -> None:
        """
        Stops running tasks.
        """
        try:
            current_task_running_id: str | None = self.RUNNING_TASKS[task['id']]['current_running_task']

            if current_task_running_id is None:
                await self.LOG_EVENT(f'CyclicTasks/stop_task/{currentframe().f_lineno}', 'CyclicTasks', f'Task already stopped: {task['id']}', task, labels = {'event_type': 'task_already_stopped'})

                return

            self.RUNNING_TASKS[task['id']]['running_tasks'][current_task_running_id] = False
            self.RUNNING_TASKS[task['id']]['current_running_task'] = None

            await self.LOG_EVENT(f'CyclicTasks/stop_task/{currentframe().f_lineno}', 'CyclicTasks', f'Task Stopped: {task['id']}', task, labels = {'event_type': 'task_stopped'})

            await self.send_stop_task_acknowledgement(task)
        except Exception as e:
            await self.LOG_ERROR(f'CyclicTasks/stop_task/{currentframe().f_lineno}', e, task)

        
    async def stopper_task(self) -> None:
        """
        This task will keep listening for tasks to be stopped in the stop_task_queue and stops them.
        """
        global stop_task_queue
        await self.LOG_EVENT(f'CyclicTasks/stopper_task/{currentframe().f_lineno}', 'CyclicTasks', 'Stopper Task Started', None, labels = {'event_type': 'stopper_task_started'})

        while True:
            task = await stop_task_queue.get()
            await self.LOG_EVENT(f'CyclicTasks/stopper_task/{currentframe().f_lineno}', 'CyclicTasks', f'Task Dequeued stopping: {task["id"]}', task, labels = {'event_type': 'task_dequeued', 'dequeueing_type': 'stop'})
            
            if task['id'] not in self.RUNNING_TASKS:
                await self.LOG_EVENT(f'CyclicTasks/stopper_task/{currentframe().f_lineno}', 'CyclicTasks', f'Task not running: {task['id']}', task, labels = {'event_type': 'task_not_running'})
                continue

            asyncio_create_task(self.stop_task(task))

    async def run(self) -> None:
        """
        Starts the CyclicTasks Engine.
        It starts both the starter_task and stopper_task asynchronously.
        Call this function to start the engine.
        """

        STARTER_TASK: Task = asyncio_create_task(self.starter_task())
        STOPPER_TASK: Task = asyncio_create_task(self.stopper_task())
        await self.LOG_EVENT(f'CyclicTasks/run/{currentframe().f_lineno}', 'CyclicTasks', 'CyclicTasks Engine Started', None, labels = {'event_type': 'engine_started'})

        await gather(STARTER_TASK, STOPPER_TASK)


__all__ = ['CyclicTasks'] # Exports 