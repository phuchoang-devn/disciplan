from fastapi import Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..configs.database import get_db_connection
from ..models.user_model import User


class UserRepository:
    db: AsyncSession

    def __init__(
            self, db: AsyncSession = Depends(get_db_connection)
    ) -> None:
        self.db = db

    async def add_user(self, user: User):
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

    async def get_user_by_id(self, user_id: str):
        return await self.db.get(User, user_id)

    async def get_user_by_email(self, email: str):
        query = select(User).where(User.email == email)
        result = await self.db.scalars(query)
        return result.first()

    async def update_user(self, user: User, new_values: dict):
        stmt = update(User).where(User.id == user.id).values(new_values)
        await self.db.execute(stmt)
        await self.db.commit()



