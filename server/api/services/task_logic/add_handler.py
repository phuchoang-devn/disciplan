import copy
from datetime import date, timedelta

from fastapi.params import Depends

from api.models.repetition_model import Repetition
from api.models.task_model import Task
from api.repositories.repetition_repo import RepetitionRepository
from api.repositories.task_repo import TaskRepository
from api.schemas.repetition_schemas import RepetitionIn
from api.schemas.task_schemas import TaskIn, TaskOut
from api.services.tag_service import TagService


class AddHandler:
    task_repo: TaskRepository
    repetition_repo: RepetitionRepository
    tag_service: TagService

    def __init__(
            self,
            task_repo: TaskRepository = Depends(),
            repetition_repo: RepetitionRepository = Depends(),
            tag_service: TagService = Depends(),
    ) -> None:
        self.task_repo = task_repo
        self.repetition_repo = repetition_repo
        self.tag_service = tag_service

    async def add_task(self, user_id: str, repetition_id: int | None, task_in: TaskIn):
        task = Task(**task_in.model_dump(exclude={"tags"}), user_id=user_id, repetition_group=repetition_id)
        await self.task_repo.add_task(task)
        await self.tag_service.add_assoc(task, task_in.tags)
        return TaskOut.model_validate(task)

    async def add_repetition(self, user_id: str, repetition_in: RepetitionIn, first_task_id: int):
        repetition = Repetition(**repetition_in.model_dump(), user_id=user_id, first_task=first_task_id)
        await self.repetition_repo.add_repetition(repetition)
        return repetition.id

    async def add_repeated_tasks(self,
                                 user_id: str,
                                 list_dates: list[date],
                                 group_id: int,
                                 task_in: TaskIn,
                                 view_end: date):
        list_repeated_task_outs = []
        duration = task_in.date_end - task_in.date_start
        for i in range(len(list_dates)):
            new_task_in = self.create_new_taskin(task_in, list_dates[i], duration)
            task_out = await self.add_task(user_id, group_id, new_task_in)

            if view_end >= task_in.date_start:
                list_repeated_task_outs.append(task_out)

        return list_repeated_task_outs

    @staticmethod
    def create_new_taskin(task_in: TaskIn, task_date: date, duration: timedelta):
        new_task_in = copy.deepcopy(task_in)
        new_task_in.date_start = task_date
        new_task_in.date_end = task_date + duration
        return new_task_in

    async def update_repetition(self,
                                repetition_id: int,
                                repetition_in: RepetitionIn,
                                first_task_id: int,
                                last_date: date):
        repetition_new_values = {Repetition.first_task: first_task_id}
        if repetition_in.repetition_end:
            repetition_new_values.update({Repetition.repetition_end: last_date})
        else:
            repetition_new_values.update({Repetition.standard_task: first_task_id})

        return await self.repetition_repo.update_repetition(repetition_id, repetition_new_values)
