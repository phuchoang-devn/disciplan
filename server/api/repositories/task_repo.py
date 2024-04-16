from datetime import date
from fastapi import Depends
from sqlalchemy import select, and_, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..configs.database import get_db_connection
from ..models.task_model import Task
from ..models.task_tag_assoc_model import TaskTagAssociation


class TaskRepository:
    db: AsyncSession

    def __init__(
        self, db: AsyncSession = Depends(get_db_connection)
    ) -> None:
        self.db = db

    @staticmethod
    def modify_query_with_view(query, query_from, query_to):
        return query.where(and_(
            Task.date_start >= query_from,
            Task.date_start <= query_to
        )).order_by(Task.date_start, Task.time_start)

    async def get_all(self):
        query = select(Task)
        result = await self.db.scalars(query)
        return result.all()

    async def get_task_by_id(self, task_id: int):
        return await self.db.get(Task, task_id)

    async def get_tasks_by_period(self, user_id: str, query_from: date, query_to: date):
        query = select(Task).where(Task.user_id == user_id)
        query = self.modify_query_with_view(query, query_from, query_to)
        result = await self.db.scalars(query)
        return result.all()

    async def get_tasks_by_tag(self, tag_id: int, query_from: date, query_to: date):
        sub_query = select(TaskTagAssociation.task_id).where(TaskTagAssociation.tag_id == tag_id)
        query = select(Task).where(Task.id.in_(sub_query))
        query = self.modify_query_with_view(query, query_from, query_to)
        result = await self.db.scalars(query)
        return result.all()

    async def get_archived_tasks(self, user_id: str, query_from: date, query_to: date):
        query = select(Task).where(and_(
            Task.user_id == user_id,
            Task.is_archived == True
        ))
        query = self.modify_query_with_view(query, query_from, query_to)
        result = await self.db.scalars(query)
        return result.all()

    async def get_tasks_with_notification(self, user_id: str, query_from: date, query_to: date):
        query = select(Task).where(and_(
            Task.user_id == user_id,
            Task.notification != None
        ))
        query = self.modify_query_with_view(query, query_from, query_to)
        result = await self.db.scalars(query)
        return result.all()

    async def get_unfinished_tasks(self, user_id: str):
        today = date.today()
        query = select(Task).where(and_(
            Task.user_id == user_id,
            Task.status != 100,
            Task.date_start <= today,
            Task.date_end >= today
        )).order_by(Task.date_start, Task.time_start, Task.priority, Task.status)
        result = await self.db.scalars(query)
        return result.all()

    async def get_tasks_in_group(self, repetition_id: int, query_from: date | None, query_to: date | None):
        query = select(Task).where(Task.repetition_group == repetition_id)
        if query_from:
            query = query.where(Task.date_start >= query_from)
        if query_to:
            query = query.where(Task.date_start <= query_to)
        query = query.order_by(Task.date_start)
        result = await self.db.scalars(query)
        return result.all()

    async def get_number_of_tasks_in_group(self, repetition_id: int):
        query = select(func.count()).select_from(Task).where(Task.repetition_group == repetition_id)
        result = await self.db.scalars(query)
        return result.first()

    async def get_previous_task_in_group(self, task: Task):
        query = select(Task).where(and_(
            Task.repetition_group == task.repetition_group,
            Task.date_start < task.date_start
        )).order_by(Task.date_start.desc()).limit(1)
        result = await self.db.scalars(query)
        return result.first()

    async def get_task_behind_in_group(self, task: Task):
        query = select(Task).where(and_(
            Task.repetition_group == task.repetition_group,
            Task.date_start > task.date_start
        )).order_by(Task.date_start).limit(1)
        result = await self.db.scalars(query)
        return result.first()

    async def add_task(self, task: Task):
        savepoint = await self.db.begin_nested()
        self.db.add(task)
        await savepoint.commit()
        await self.db.refresh(task)

    async def update_task(self, task_id: int, new_values: dict):
        stmt = update(Task).where(Task.id == task_id).values(new_values).returning(Task)
        result = await self.db.scalars(stmt)
        return result.one()

    async def update_tasks_in_group(self, repetition_id: int, new_values: dict):
        query = update(Task).where(Task.repetition_group == repetition_id).values(new_values).returning(Task)
        result = await self.db.scalars(query)
        return result.all()

    async def delete_task(self, task: Task):
        savepoint = await self.db.begin_nested()
        await self.db.delete(task)
        await savepoint.commit()
