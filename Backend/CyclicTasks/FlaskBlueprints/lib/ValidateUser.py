from firebase_admin import auth

def user_not_owner(task: dict, user: dict) -> bool:
    """
    It will check if the task owner is the same as the user who is trying to access it.\n
    """
    if user['email'] != task['user_email']:
        return True

    return False
    

def user_blocked(user: dict) -> bool:
    """
    It will check if the user is blocked or not.\n
    """
    if 'blocked' in user:
        return user['blocked']
    
    else:
        return False
    
def admin(user: dict) -> bool:
    """
    It will check if the user is an admin or not.\n
    """
    if 'owner' in user:
        return user['owner']
    
    if 'admin' in user:
        return user['admin']        
    else:
        return False

__all__ = ['validate_accessing_user', 'user_blocked', 'admin']
