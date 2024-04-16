from datetime import date

from fastapi.params import Depends

from api.models.repetition_model import Repetition
from api.models.task_model import Task
from api.repositories.repetition_repo import RepetitionRepository
from api.repositories.task_repo import TaskRepository
from api.schemas.out_schemas import UpdateResult
from api.schemas.repetition_schemas import RepetitionOut
from api.schemas.task_schemas import TaskOut


class DeleteHandler:
    task_repo: TaskRepository
    repetition_repo: RepetitionRepository

    def __init__(
            self,
            task_repo: TaskRepository = Depends(),
            repetition_repo: RepetitionRepository = Depends(),
    ) -> None:
        self.task_repo = task_repo
        self.repetition_repo = repetition_repo

    async def delete_task(self, task: Task):
        await self.task_repo.delete_task(task)

    async def delete_all_in_group(self, repetition: Repetition):
        await self.repetition_repo.delete_repetition(repetition)

        result = UpdateResult()
        result.deleted_repetition = repetition.id
        return result

    async def delete_one_in_group(self, task: Task, repetition: Repetition):
        response = UpdateResult()

        await self.task_repo.delete_task(task)
        response.deleted_tasks.append(task.id)

        new_repetition_values = {}
        if (await self.task_repo.get_number_of_tasks_in_group(repetition.id)) <= 1:
            last_task = await self.put_last_task_alone_and_delete_repetition(repetition)

            response.deleted_repetition = repetition.id
            response.deleted_tasks = []
            response.changed_tasks.append(TaskOut.model_validate(last_task))
        elif repetition.repetition_end and repetition.repetition_end == task.date_start:
            previous_task = await self.task_repo.get_previous_task_in_group(task)
            new_repetition_values.update({Repetition.repetition_end: previous_task.date_start})
        elif repetition.first_task == task.id:
            task_behind = await self.task_repo.get_task_behind_in_group(task)
            new_repetition_values.update({Repetition.first_task: task_behind.id})

        is_standard_task_for_endless_repetition_deleted = (not repetition.repetition_end
                                                           and not response.deleted_repetition
                                                           and task.id == repetition.standard_task)
        if is_standard_task_for_endless_repetition_deleted:
            new_repetition_values.update({Repetition.standard_task: repetition.first_task})

        if new_repetition_values:
            updated_repetition = await self.repetition_repo.update_repetition(repetition.id, new_repetition_values)
            response.changed_repetition = RepetitionOut.model_validate(updated_repetition)

        return response

    async def put_last_task_alone_and_delete_repetition(self, repetition):
        last_task = (await self.task_repo.update_tasks_in_group(repetition.id,
                                                                {Task.repetition_group: None}))[0]
        await self.repetition_repo.delete_repetition(repetition)
        return last_task

    async def delete_from_one_in_group(self,
                                       task: Task,
                                       repetition: Repetition,
                                       view_end: date):
        if task.id == repetition.first_task:
            return await self.delete_all_in_group(repetition)

        previous_task = await self.task_repo.get_previous_task_in_group(task)
        if previous_task.id == repetition.first_task:
            return await self.delete_all_except_first_task(previous_task.id, repetition)

        response = UpdateResult()
        await self.delete_tasks_and_assemble_response(task, view_end, response)
        await self.update_repetition_and_assemble_response(repetition.id, previous_task.date_start, response)
        return response

    async def delete_all_except_first_task(self, first_task_id, repetition: Repetition):
        updated_previous_task = await self.task_repo.update_task(first_task_id, {Task.repetition_group: None})
        response = await self.delete_all_in_group(repetition)

        response.changed_tasks.append(TaskOut.model_validate(updated_previous_task))
        return response

    async def delete_tasks_and_assemble_response(self, task: Task, view_end: date, response: UpdateResult):
        list_tasks = await self.task_repo.get_tasks_in_group(task.repetition_group, task.date_start, None)

        for task_to_delete in list_tasks:
            await self.task_repo.delete_task(task_to_delete)
            if task_to_delete.date_start <= view_end:
                response.deleted_tasks.append(task_to_delete.id)

    async def update_repetition_and_assemble_response(self,
                                                      repetition_id: int,
                                                      new_repetition_end: date,
                                                      response: UpdateResult):
        new_repetition_values = {
            Repetition.repetition_end: new_repetition_end,
            Repetition.standard_task: None
        }
        updated_repetition = await self.repetition_repo.update_repetition(repetition_id, new_repetition_values)
        response.changed_repetition = RepetitionOut.model_validate(updated_repetition)