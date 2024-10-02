from flask_restful import Resource

class Entry(Resource):
    async def get(self) -> dict:
        return {'message': 'CyclicTasks API is running'}
    
    async def post(self) -> dict:
        return {'message': 'Post method not allowed'}

__all__ = ['Entry']