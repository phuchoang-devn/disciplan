from datetime import date
from fastapi import Depends, HTTPException
from passlib.context import CryptContext
from starlette import status

from ..models.user_model import User
from ..repositories.user_repo import UserRepository


class UserService:
    user_repo: UserRepository

    def __init__(
            self,
            user_repo: UserRepository = Depends()
    ) -> None:
        self.user_repo = user_repo
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    async def add_user(self, email: str, password: str):
        user = await self.user_repo.get_user_by_email(email)
        if user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sorry! This Email is already registered."
            )
        else:
            hashed_password = self.pwd_context.hash(password)
            user = User(email=email, hashed_password=hashed_password, last_access=date.today())
            await self.user_repo.add_user(user)

    async def authenticate_user(self, email: str, password: str):
        user = await self.user_repo.get_user_by_email(email)
        if not user:
            return None
        if not self.pwd_context.verify(password, user.hashed_password):
            return None
        return user

    async def get_user_by_id(self, user_id: str):
        return await self.user_repo.get_user_by_id(user_id)

    async def update_password(self, user: User, current_password: str, new_password: str):
        if not self.pwd_context.verify(current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password"
            )
        elif current_password == new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password is same as the current one"
            )
        else:
            hashed_password = self.pwd_context.hash(new_password)
            await self.user_repo.update_user(user, {User.hashed_password: hashed_password})
