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
    try:
        task = request.json['task']

        FS = Firestore(initialized=True)
        id = await FS.add_new_task(task)

        task['id'] = id

        if task['active']:
            await start_tasks_queue.put(task)

        return jsonify({
            'message': 'Task has been added',
            'success': True,
            'new_task_id': id
        })
    except Exception as e:
        print("Error", e)
        return jsonify({
            'message': 'Some error occured on server side',
            'success': False
        })



@app.route('/edittask', methods=['POST'])
async def change_task():
    try:
        task = request.json['task']
        id = task['id']

        FS = Firestore(initialized=True)
        await FS.edit_task(task)
        
        await stop_task_queue.put(task)

        task['id'] = id
        
        if task['active']:
            await start_tasks_queue.put(task)

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
    
@app.route('/deletetask', methods=['POST'])
async def delete_task():
    try:
        task = request.json['task']

        FS = Firestore(initialized=True)
        await FS.delete_task(task['id'], task['user_email'])

        await stop_task_queue.put(task)

        return jsonify({
            'message': 'Task has been deleted',
            'success': True
        })
    except Exception as e:
        print("Error", e)
        return jsonify({
            'message': 'Some error occured on server side',
            'success': False
        })
    



__all__ = ['app']