from datetime import date, timedelta

from fastapi.params import Depends

from api.models.repetition_model import Repetition
from api.models.task_model import Task
from api.repositories.repetition_repo import RepetitionRepository
from api.repositories.task_repo import TaskRepository
from api.schemas.out_schemas import UpdateResult
from api.schemas.repetition_schemas import RepetitionOut
from api.schemas.task_schemas import TaskIn, TaskOut
from api.services.tag_service import TagService
from api.services.task_logic.task_checker import TaskChecker


class UpdateHandler:
    task_checker: TaskChecker
    task_repo: TaskRepository
    repetition_repo: RepetitionRepository
    tag_service: TagService

    def __init__(
            self,
            task_checker: TaskChecker = Depends(),
            task_repo: TaskRepository = Depends(),
            repetition_repo: RepetitionRepository = Depends(),
            tag_service: TagService = Depends(),
    ) -> None:
        self.task_checker = task_checker
        self.task_repo = task_repo
        self.repetition_repo = repetition_repo
        self.tag_service = tag_service

    async def update_repetition(self, repetition_id: int, new_repetition_values: dict):
        return await self.repetition_repo.update_repetition(repetition_id, new_repetition_values)

    async def update_task(self, task_id: int, new_task_values: dict):
        return await self.task_repo.update_task(task_id, new_task_values)

    async def update_task_and_assoc(self, task: Task, task_in: TaskIn):
        task = await self.task_repo.update_task(task.id, task_in.model_dump(exclude={"tags"}))
        await self.tag_service.update_assoc(task, task_in.tags)

        result = UpdateResult()
        result.changed_tasks.append(TaskOut.model_validate(task))
        return result

    async def update_info_one_in_group(self,
                                       task: Task,
                                       repetition: Repetition,
                                       task_in: TaskIn):
        old_date_start = task.date_start
        response = await self.update_task_and_assoc(task, task_in)
        await self.handle_change_of_repetition_end(repetition, old_date_start, task_in.date_start, response)
        return response

    async def handle_change_of_repetition_end(self,
                                              repetition: Repetition,
                                              old_date_start: date,
                                              new_date_start: date,
                                              response: UpdateResult):
        is_date_of_last_task_changed = (repetition.repetition_end
                                        and (old_date_start == repetition.repetition_end)
                                        and (old_date_start != new_date_start))
        if is_date_of_last_task_changed:
            updated_repetition = await self.update_repetition(repetition.id, {
                Repetition.repetition_end: new_date_start
            })
            response.changed_repetition = RepetitionOut.model_validate(updated_repetition)

    async def update_info_all_in_group(self,
                                       task: Task,
                                       repetition: Repetition,
                                       task_in: TaskIn,
                                       view_start: date,
                                       view_end: date):
        list_tasks = await self.task_repo.get_tasks_in_group(task.repetition_group, None, None)

        date_start_delta = task_in.date_start - task.normalize_date().date_start
        return await self.update_info_multiple_tasks(task,
                                                     repetition,
                                                     task_in,
                                                     list_tasks,
                                                     date_start_delta,
                                                     view_start,
                                                     view_end)

    async def update_info_after_in_group(self,
                                         task: Task,
                                         repetition: Repetition,
                                         task_in: TaskIn,
                                         view_end: date):
        list_tasks = await self.task_repo.get_tasks_in_group(task.repetition_group, task.date_start, None)

        date_start_delta = task_in.date_start - task.normalize_date().date_start
        return await self.update_info_multiple_tasks(task,
                                                     repetition,
                                                     task_in,
                                                     list_tasks,
                                                     date_start_delta,
                                                     task_in.date_start,
                                                     view_end)

    async def update_info_multiple_tasks(self,
                                         task: Task,
                                         repetition: Repetition,
                                         task_in: TaskIn,
                                         list_tasks: list[Task],
                                         date_start_delta: timedelta,
                                         view_start: date,
                                         view_end: date):
        response = UpdateResult()
        duration = task_in.date_end - task_in.date_start

        await self.update_multiple_tasks_and_assoc(list_tasks,
                                                   task_in,
                                                   date_start_delta,
                                                   duration,
                                                   view_start,
                                                   view_end,
                                                   response)
        is_date_of_last_task_changed = date_start_delta and repetition.repetition_end
        if is_date_of_last_task_changed:
            await self.handle_change_repetition_end_in_update_multiple(repetition.id,
                                                                       list_tasks[-1].normalize_date().date_start,
                                                                       response)
        if not repetition.repetition_end:
            await self.update_repetition(repetition.id, {Repetition.standard_task: task.id})

        return response

    async def update_multiple_tasks_and_assoc(self,
                                              list_tasks: list[Task],
                                              task_in: TaskIn,
                                              date_start_delta: timedelta,
                                              duration: timedelta,
                                              view_start: date,
                                              view_end: date,
                                              response: UpdateResult):
        for task in list_tasks:
            task = task.normalize_date()
            next_date_start = task.date_start + date_start_delta

            updated_task = await self.task_repo.update_task(task.id,
                                                            {**task_in.model_dump(
                                                                exclude={"date_start", "date_end", "tags"}),
                                                             Task.date_start: next_date_start,
                                                             Task.date_end: next_date_start + duration})

            await self.tag_service.update_assoc(task, task_in.tags)

            if (next_date_start >= view_start) and (next_date_start <= view_end):
                response.changed_tasks.append(TaskOut.model_validate(updated_task))

    async def handle_change_repetition_end_in_update_multiple(self,
                                                              repetition_id: int,
                                                              new_repetition_end: date,
                                                              response: UpdateResult):
        updated_repetition = await self.update_repetition(repetition_id,
                                                          {Repetition.repetition_end: new_repetition_end})
        response.changed_repetition = RepetitionOut.model_validate(updated_repetition)
