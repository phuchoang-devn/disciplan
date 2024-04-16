from fastapi import Depends
from sqlalchemy import select, update, and_
from sqlalchemy.ext.asyncio import AsyncSession

from ..configs.database import get_db_connection
from ..models.tag_models import Tag


class TagRepository:
    db: AsyncSession

    def __init__(
        self, db: AsyncSession = Depends(get_db_connection)
    ) -> None:
        self.db = db

    async def get_tag_by_id(self, tag_id: int):
        return await self.db.get(Tag, tag_id)

    async def get_tag_by_name(self, user_id: str, tag_name: str):
        query = select(Tag).where(and_(
            Tag.user_id == user_id,
            Tag.name == tag_name
        ))
        result = await self.db.scalars(query)
        return result.first()

    async def get_all_tag(self, user_id: str):
        query = select(Tag).where(Tag.user_id == user_id)
        result = await self.db.scalars(query)
        return result.all()

    async def add_tag(self, tag: Tag):
        self.db.add(tag)
        await self.db.commit()
        await self.db.refresh(tag)

    async def update_tag(self, tag_id: int, new_values: dict):
        stmt = update(Tag).where(Tag.id == tag_id).values(new_values).returning(Tag)
        result = await self.db.scalars(stmt)
        return result.one()

    async def delete_tag(self, tag: Tag):
        await self.db.delete(tag)
        await self.db.commit()
