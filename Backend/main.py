from asyncio import run, new_event_loop, set_event_loop
from aiohttp import ClientSession
from threading import Thread

from CyclicTasks.CyclicTasks import CyclicTasks
from CyclicTasks.FlaskAPI import app

async def main() -> None:
    """
    Main function to run the CyclicTasks.
    """
    async with ClientSession() as session:
        cyclic_tasks = CyclicTasks(session)
        await cyclic_tasks.LOG_EVENT('main', 'CyclicTasks', 'CyclicTasks initiated', None)

        await cyclic_tasks.run()


def run_main_in_thread() -> None:
    """
    Run the main function in a separate thread,
    because FlaskAPI is running in the main thread,
    and we dont want it to block each other.
    """
    loop = new_event_loop() # Every thread must have its own event loop
    set_event_loop(loop)
    loop.run_until_complete(main())

Thread(target=run_main_in_thread).start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)