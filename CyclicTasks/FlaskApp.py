from flask import Flask, jsonify, request
from flask_cors import CORS

from . import start_tasks_queue, stop_task_queue
from .lib.Firestore import Firestore

app = Flask(__name__)
CORS(app)

@app.before_request
def before_request():
    if request.method == "POST":
        
        print('Before Request')

@app.route('/')
def entry():
    return jsonify({
        'CyclicTasks API': 'Running'
    })

@app.route('/newtask', methods=['POST'])
def new_task():
    task = request.json['task']

    Firestore().add_new_task(task)

    if task['active']:
        start_tasks_queue.put(task)

    return jsonify({
        'message': 'Task has been added'
    })

@app.route('/starttask', methods=['POST'])
def start_task():

    task = request.json['tasks']

    start_tasks_queue.put(task)

    return jsonify({
        'message': 'Task has been queued'
    })

@app.route('/stoptask', methods=['POST'])
def stop_task():

    task = request.json['task']

    stop_task_queue.put(task)
    
    return jsonify({
        'message': 'Task has been stopped'
    })

@app.route('/changetask', methods=['POST'])
def change_task():
    task = request.json['task']

    Firestore().edit_task(task)

    stop_task_queue.put(task)

    if task['active']:
        start_tasks_queue.put(task)

    return jsonify({
        'message': 'Task data has been changed'  + ' and restarted' if task['active'] else ''
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)