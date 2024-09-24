from dotenv import load_dotenv
load_dotenv()

from asyncio import Queue

start_tasks_queue: Queue = Queue()
stop_task_queue: Queue = Queue()

running_tasks: dict[str, dict] = {}

