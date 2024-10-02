from firebase_admin import firestore
from string import ascii_letters, digits
from random import choices
from inspect import currentframe

from ..config.Firebase import FirebaseConfig

class Firestore(FirebaseConfig):
    def __init__(self, initialized=False) -> None:
        super().__init__()
        
        if not initialized:
            self.initialize_firebase()

        self.db = firestore.client()

        self.tasks_collection = self.db.collection('Tasks')
        self.users_collection = self.db.collection('Users')

    async def get_all_tasks(self) -> list[dict]:
        """
        Fetches all the tasks from the Firestore database
        Returns only the active tasks
        """
        self.fetched_tasks: list = []
        
        for task in self.tasks_collection.stream():

            task_: dict = task.to_dict()

            if not task_['active']:
                continue

            task_['id'] = task.id


            self.fetched_tasks.append(task_)

        if self.fetched_tasks == []:
            await self.LOG_EVENT(f'Firestore/get_all_tasks/{currentframe().f_lineno}', 'CyclicTasks', 'No tasks available', None)
        else:
            await self.LOG_EVENT(f'Firestore/get_all_tasks/{currentframe().f_lineno}', 'CyclicTasks', f'Tasks fetched: {len(self.fetched_tasks)}', None)

        return self.fetched_tasks
    
    async def add_new_task(self, task: dict) -> str:
        """
        This function is used to add a new task to the Firestore database mapping to its respective user.
        """
        
        while True:
            random_id = ''.join(choices(ascii_letters + digits, k=20))
            taskDoc = self.tasks_collection.document(random_id).get()

            if not taskDoc.exists:
                break

        user_email: str = task['user_email']
        del task['id']

        self.tasks_collection.document(random_id).set(task)

        userDocRef = self.users_collection.document(user_email)
        userDoc = userDocRef.get()

        if userDoc.exists:
            userDocRef.update({
                'tasks': firestore.ArrayUnion([random_id])
            })

        else:
            userDocRef.set({
                'tasks': [random_id],
                'user_name': task['user_name']
            })

        return random_id

    async def delete_task(self, task_id: str, user_email: str) -> None:
        """
        This function is used to delete a task from the Firestore database.
        """
        self.tasks_collection.document(task_id).delete()

        userDocRef = self.users_collection.document(user_email)
        userDoc = userDocRef.get()

        if userDoc.exists:
            userDocRef.update({
                'tasks': firestore.ArrayRemove([task_id])
            })

    async def edit_task(self, task: dict) -> None:
        """
        This function is used to edit a task in the Firestore database.
        """
        taskRef = self.tasks_collection.document(task['id'])
        del task['id']
        
        taskRef.update(task)


  