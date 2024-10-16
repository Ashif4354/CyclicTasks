from firebase_admin import auth

def user_not_owner(task: dict, user_token: str) -> bool:
    """
    It will check if the task owner is the same as the user who is trying to access it.\n
    """
    try:
        user = auth.verify_id_token(user_token, clock_skew_seconds=10)

        if user['email'] != task['user_email']:
            return True
        
    except Exception as _:        
        return False
    
    return False
    

def user_blocked(user_token: str) -> bool:
    """
    It will check if the user is blocked or not.\n
    """    
    try:
        user = auth.verify_id_token(user_token, clock_skew_seconds=10)

        if 'blocked' in user:
            return user['blocked']
        
        else:
            return False
        
    except Exception as _:
        return True
    
def admin(user_token: str) -> bool:
    """
    It will check if the user is an admin or not.\n
    """
    try:
        user = auth.verify_id_token(user_token, clock_skew_seconds=10)

        if 'owner' in user:
            return user['owner']
        
        if 'admin' in user:
            return user['admin']        
        else:
            return False
        
    except Exception as _:
        return False

__all__ = ['validate_accessing_user', 'user_blocked', 'admin']
