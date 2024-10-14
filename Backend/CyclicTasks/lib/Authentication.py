from ..config.Firebase import FirebaseConfig
from firebase_admin import auth


class Authentication(FirebaseConfig):
    def __init__(self, initialized: bool = False) -> None:
        super().__init__()
    
        if not initialized:
            self.initialize_firebase()

    async def get_all_users(self) -> list[dict]:
        """
        Fetches all the users from the Firestore database
        """
        self.fetched_users: list[dict] = []
        
        page = auth.list_users()

        while page:
            for user in page.users:

                user_custom_claims = user.custom_claims or {}

                if 'blocked' not in user_custom_claims:
                    user_custom_claims['blocked'] = False

                user_ = {
                    'name': user.display_name,
                    'email': user.email,
                    'photoUrl': user.photo_url,
                    'blocked': user_custom_claims['blocked']
                }

                self.fetched_users.append(user_)

            page = page.get_next_page()

        return self.fetched_users
    
    
    async def block_user(self, user_email: str) -> None:
        """
        Blocks a user on the application
        """
        try:
            user = auth.get_user_by_email(user_email)
            user_custom_claims = user.custom_claims or {}

            user_custom_claims['blocked'] = True  
            auth.update_user(user.uid, custom_claims=user_custom_claims)

        except Exception as e:
            print(e)
        

    async def unblock_user(self, user_email: str) -> None:
        """
        Unblocks a user on the application
        """
        try:
            user = auth.get_user_by_email(user_email)
            user_custom_claims = user.custom_claims or {}

            user_custom_claims['blocked'] = False  
            auth.update_user(user.uid, custom_claims=user_custom_claims)

        except Exception as e:
            print(e)


    async def get_admins(self) -> list[dict]:
        """
        Fetches all the admins from the Firestore database
        """
        self.fetched_admins: list[dict] = []
        
        page = auth.list_users()

        while page:
            for user in page.users:

                user_custom_claims = user.custom_claims or {}

                if 'admin' not in user_custom_claims:
                    continue

                self.fetched_admins.append({'email': user.email, 'name': user.display_name})

            page = page.get_next_page()

        return self.fetched_admins
        

    async def add_admin(self, user_email: str) -> None:
        """
        Adds an admin to the application
        """
        try:
            user = auth.get_user_by_email(user_email)
            user_custom_claims = user.custom_claims or {}

            user_custom_claims['admin'] = True  
            auth.update_user(user.uid, custom_claims=user_custom_claims)

        except Exception as e:
            print(e)

    async def revoke_admin(self, user_email: str) -> None:
        """
        Removes an admin from the application
        """
        try:
            user = auth.get_user_by_email(user_email)
            user_custom_claims = user.custom_claims or {}

            user_custom_claims['admin'] = False  
            auth.update_user(user.uid, custom_claims=user_custom_claims)

        except Exception as e:
            print(e)
