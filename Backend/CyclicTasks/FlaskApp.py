from flask import Flask, jsonify, request
from flask_cors import CORS

from . import start_tasks_queue, stop_task_queue
from .lib.Firestore import Firestore
from .CyclicTasks import CyclicTasks

app = Flask(__name__)
CORS(app)

@app.before_request
def before_request():
    if request.method == "POST":
        pass
        
        # print('Before Request')

@app.route('/')
def entry():
    return jsonify({
        'CyclicTasks API': 'Running'
    })

@app.route('/getrunningtasks', methods=['GET'])
async def get_running_tasks():
    tasks = CyclicTasks.RUNNING_TASKS
    return jsonify({
        'tasks': tasks
    })

@app.route('/newtask', methods=['POST'])
async def new_task():
    task = request.json['task']

    FS = Firestore(initialized=True)
    id = await FS.add_new_task(task)

    task['id'] = id

    if task['active']:
        await start_tasks_queue.put(task)

    return jsonify({
        'message': 'Task has been added'
    })



@app.route('/edittask', methods=['POST'])
async def change_task():
    try:
        task = request.json['task']
        FS = Firestore(initialized=True)
        await FS.edit_task(task)
        # await stop_task_queue.put(task)
        
        # task['restart'] = True
        
        # print('TASK ACTIVE', task['active'])
        # print(task)
        if task['active']:
            await start_tasks_queue.put(task)
        else:
            await stop_task_queue.put(task)

        return jsonify({
            'message': 'Task data has been changed'  + ' and restarted' if task['active'] else '',
            'success': True

        })
    
    except Exception as e:
        print("Error", e)
        return jsonify({
            'message': 'Some error occured on server side',
            'success': False
        })
    

# @app.route('/starttask', methods=['POST'])
# async def start_task():
#     try:

#         task = request.json['tasks']

#         await start_tasks_queue.put(task)

#         return jsonify({
#             'message': 'Task has been queued',
#             'success': True
#         })
#     except:
#         return jsonify({
#             'message': 'Some error occured on server side',
#             'success': False
#         })

# @app.route('/stoptask', methods=['POST'])
# async def stop_task():
#     try:
#         task = request.json['task']

#         await stop_task_queue.put(task)
        
#         return jsonify({
#             'message': 'Task has been stopped',
#             'success': True
#         })
#     except Exception as e:
#         print("Error", e)
#         return jsonify({
#             'message': 'Some error occured on server side',
#             'success': False
#         })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)