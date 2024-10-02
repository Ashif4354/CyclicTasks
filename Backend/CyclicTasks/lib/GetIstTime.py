from datetime import datetime, timedelta, timezone

def get_ist_time() -> str:
    """
    Returns the current time in IST timezone
    """
    utc_now: datetime = datetime.now(timezone.utc)
    ist_now: datetime = utc_now + timedelta(hours=5, minutes=30)
    
    return ist_now.strftime('%d-%m-%Y %H:%M:%S IST')
