from ..config.firebase import FirebaseConfig

from firebase_admin import firestore

from string import ascii_letters, digits
from random import choices

class Firestore(FirebaseConfig):
    def __init__(self) -> None:
        super().__init__()

        self.initialize_firebase()
        # self.db = firestore_async.client()
        self.db = firestore.client()

        self.tasks_collection = self.db.collection('Tasks')
        self.users_collection = self.db.collection('Users')

    async def get_all_tasks(self) -> list[dict]:
        self.fetched_tasks = []
        
        for task in self.tasks_collection.stream():
        # async for task in self.tasks_collection.stream():

            task_: dict = task.to_dict()
            # print(task_)

            if not task_['active']:
                continue

            task_['id'] = task.id


            self.fetched_tasks.append(task_)
        return self.fetched_tasks
    
    async def add_new_task(self, task: dict) -> None:

        random_id = ''.join(choices(ascii_letters + digits, k=20))
        user_email = task['user_email']

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

    async def delete_task(self, task_id: str, user_email: str) -> None:
        self.tasks_collection.document(task_id).delete()

        userDocRef = self.users_collection.document(user_email)
        userDoc = userDocRef.get()

        if userDoc.exists:
            userDocRef.update({
                'tasks': firestore.ArrayRemove([task_id])
            })

    async def edit_task(self, task: dict) -> None:
        self.tasks_collection.document(task['id']).update(task)


  