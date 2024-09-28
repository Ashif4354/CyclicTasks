from aiohttp import ClientSession

async def verify_recaptcha(session: ClientSession, token: str, api_key: str) -> bool:
    url = "https://www.google.com/recaptcha/api/siteverify"

    data = {
        'secret': api_key,
        'response': token
    }

    try:
        response = await session.post(url, data=data)
        verified = await response.json()    
        return verified['success']
    except:
        return False

