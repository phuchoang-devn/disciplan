from fastapi import Depends
from sqlalchemy import select, delete, and_
from sqlalchemy.ext.asyncio import AsyncSession

from ..configs.database import get_db_connection
from ..models.task_model import Task
from ..models.task_tag_assoc_model import TaskTagAssociation


class TaskTagAssocRepository:
    db: AsyncSession

    def __init__(
        self, db: AsyncSession = Depends(get_db_connection)
    ) -> None:
        self.db = db

    async def add_assoc(self, task: Task, tag_id: int):
        savepoint = await self.db.begin_nested()
        task_tag_assoc = TaskTagAssociation(task_id=task.id, tag_id=tag_id)
        self.db.add(task_tag_assoc)
        await savepoint.commit()
        await self.db.refresh(task)

    async def get_all(self):
        query = select(TaskTagAssociation)
        result = await self.db.scalars(query)
        return result.all()

    async def delete_assoc(self, task: Task, tag_id: int):
        savepoint = await self.db.begin_nested()
        stmt = delete(TaskTagAssociation).where(and_(
            TaskTagAssociation.tag_id == tag_id,
            TaskTagAssociation.task_id == task.id
        ))
        await self.db.execute(stmt)
        await savepoint.commit()
        await self.db.refresh(task)
