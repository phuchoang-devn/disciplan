from datetime import date

from fastapi.params import Depends

from api.models.task_model import Task
from api.repositories.repetition_repo import RepetitionRepository
from api.repositories.task_repo import TaskRepository
from api.schemas.out_schemas import GetResult
from api.schemas.repetition_schemas import RepetitionOut
from api.schemas.task_schemas import TaskOut


class GetHandler:
    task_repo = TaskRepository
    repetition_repo: RepetitionRepository

    def __init__(
            self,
            task_repo: TaskRepository = Depends(),
            repetition_repo: RepetitionRepository = Depends(),
    ) -> None:
        self.task_repo = task_repo
        self.repetition_repo = repetition_repo

    async def get_tasks_by_period(self, user_id: str, view_start: date, view_end: date):
        return await self.task_repo.get_tasks_by_period(user_id, view_start, view_end)

    async def get_tasks_by_tag(self, tag_id: int, view_start: date, view_end: date):
        return await self.task_repo.get_tasks_by_tag(tag_id, view_start, view_end)

    async def get_archived_tasks(self, user_id: str, view_start: date, view_end: date):
        return await self.task_repo.get_archived_tasks(user_id, view_start, view_end)

    async def get_tasks_with_notification(self, user_id: str, view_start: date, view_end: date):
        return await self.task_repo.get_tasks_with_notification(user_id, view_start, view_end)

    async def get_unfinished_tasks(self, user_id: str):
        return await self.task_repo.get_unfinished_tasks(user_id)

    async def get_all_tasks_behind(self, task: Task):
        return await self.task_repo.get_task_behind_in_group(task)

    async def format_db_to_get_result(self, list_tasks: list[Task]):
        result = GetResult()

        for task in list_tasks:
            task_out = TaskOut.model_validate(task)
            result.tasks.append(task_out)

            repetition_out = await self.get_repetition_out(task)
            if repetition_out is not None:
                result.repetitions.append(repetition_out)

        return result

    async def get_repetition_out(self, task: Task):
        added_repetitions = []

        if ((group_id := task.repetition_group)
                and (group_id not in added_repetitions)):
            added_repetitions.append(group_id)
            repetition = await self.repetition_repo.get_repetition(group_id)
            return RepetitionOut.model_validate(repetition)

        return None
