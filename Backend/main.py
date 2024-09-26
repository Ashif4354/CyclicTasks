from asyncio import run, new_event_loop, set_event_loop
from aiohttp import ClientSession
from threading import Thread

from CyclicTasks.CyclicTasks import CyclicTasks
from CyclicTasks.FlaskApp import app

async def main() -> None:
    async with ClientSession() as session:
        cyclic_tasks = CyclicTasks(session)
        await cyclic_tasks.run()


def run_main_in_thread() -> None:
    loop = new_event_loop()
    set_event_loop(loop)
    loop.run_until_complete(main())

Thread(target=run_main_in_thread).start() # Starting ina separate thread to avoid blocking the Flask app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)