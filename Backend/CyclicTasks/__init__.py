try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass

from asyncio import Queue

start_tasks_queue: Queue = Queue()
stop_task_queue: Queue = Queue()

