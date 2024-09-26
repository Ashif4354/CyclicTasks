from aiohttp import ClientSession

async def verify_recaptcha(token, api_key):
    async with ClientSession() as session:
        url = "https://www.google.com/recaptcha/api/siteverify"

        data = {
            'secret': api_key,
            'response': token
        }

        # print(data)
        try:
            response = await session.post(url, data=data)
            # print(response.json())
            verified = await response.json()    
            return verified['success']
        except:
            return False

