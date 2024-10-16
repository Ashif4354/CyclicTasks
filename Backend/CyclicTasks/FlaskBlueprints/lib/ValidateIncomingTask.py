

def validate_incoming_task(task: dict) -> bool:
    """
    Validates the incoming task data.
    """

    if not isinstance(task['id'], str):
        return False
    
    if not task['id']:
        return False
    
    if not isinstance(task['task_name'], str):
        return False
    
    if not task['task_name']:
        return False
    
    if not isinstance(task['interval'], int):
        return False
    
    if task['interval'] < 60:
        return False
    
    if not isinstance(task['active'], bool):
        return False
    
    if not isinstance(task['notify_admin'], bool):
        return False
    
    if not isinstance(task['discord_webhook_url'], str):
        return False
    
    if not isinstance(task['discord_webhook_color'], str):
        return False
    
    if len(task['discord_webhook_color']) not in (0, 6):
        return False
    
    for char in task['discord_webhook_color']:
        if char not in '0123456789abcdefABCDEF':
            return False
    
    if not isinstance(task['user_name'], str):
        return False
    
    if not task['user_name']:
        return False
    
    if not isinstance(task['user_email'], str):
        return False
    
    if not task['user_email']:
        return False
    
    if not isinstance(task['url'], str):
        return False
    
    if not task['url']:
        return False    


    return True


__all__ = ['validate_incoming_task']