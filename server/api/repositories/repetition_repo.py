from fastapi import Depends
from sqlalchemy import update, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..configs.database import get_db_connection
from ..models.repetition_model import Repetition


class RepetitionRepository:
    db: AsyncSession

    def __init__(
        self, db: AsyncSession = Depends(get_db_connection)
    ) -> None:
        self.db = db

    async def add_repetition(self, repetition: Repetition):
        savepoint = await self.db.begin_nested()
        self.db.add(repetition)
        await savepoint.commit()
        await self.db.refresh(repetition)

    async def get_all_repe(self):
        query = select(Repetition)
        result = await self.db.scalars(query)
        return result.all()

    async def get_repetition(self, repetition_id: int):
        return await self.db.get(Repetition, repetition_id)

    async def update_repetition(self, repetition_id: int, new_values: dict):
        stmt = update(Repetition).where(Repetition.id == repetition_id).values(new_values).returning(Repetition)
        result = await self.db.scalars(stmt)
        return result.one()

    async def delete_repetition(self, repetition: Repetition):
        await self.db.delete(repetition)
