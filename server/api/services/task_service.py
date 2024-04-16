from datetime import date
from fastapi.params import Depends

from .tag_service import TagService
from .task_logic.add_handler import AddHandler
from .task_logic.date_caculator import calcu_repeated_date
from .task_logic.task_checker import TaskChecker
from .task_logic.delete_handler import DeleteHandler
from .task_logic.get_handler import GetHandler
from .task_logic.update_handler import UpdateHandler
from ..configs.default import UpdateType
from ..models.repetition_model import Repetition
from ..models.task_model import Task
from ..repositories.task_repo import TaskRepository
from ..schemas.out_schemas import AddResult, UpdateResult
from ..schemas.repetition_schemas import RepetitionIn, RepetitionOut
from ..schemas.task_schemas import TaskIn, TaskOut
from .data_protector import database_protect_when_error


class TaskService:
    # task_repo is just used for data protector
    task_repo: TaskRepository
    tag_service: TagService
    task_checker: TaskChecker
    get_handler: GetHandler
    add_handler: AddHandler
    delete_handler: DeleteHandler
    update_handler: UpdateHandler

    def __init__(
            self,
            task_repo: TaskRepository = Depends(),
            tag_service: TagService = Depends(),
            task_checker: TaskChecker = Depends(),
            get_handler: GetHandler = Depends(),
            add_handler: AddHandler = Depends(),
            delete_handler: DeleteHandler = Depends(),
            update_handler: UpdateHandler = Depends()
    ) -> None:
        self.task_repo = task_repo
        self.tag_service = tag_service
        self.task_checker = task_checker
        self.get_handler = get_handler
        self.add_handler = add_handler
        self.delete_handler = delete_handler
        self.update_handler = update_handler

    async def get_tasks_by_period(self, user_id: str, view_start: date, view_end: date):
        list_tasks = await self.get_handler.get_tasks_by_period(user_id, view_start, view_end)
        return await self.get_handler.format_db_to_get_result(list_tasks)

    async def get_tasks_by_tag(self, user_id: str, tag_id: int, view_start: date, view_end: date):
        await self.tag_service.check_and_return_valid_tag(user_id, tag_id)
        list_tasks = await self.get_handler.get_tasks_by_tag(tag_id, view_start, view_end)
        return await self.get_handler.format_db_to_get_result(list_tasks)

    async def get_archived_tasks(self, user_id: str, view_start: date, view_end: date):
        list_tasks = await self.get_handler.get_archived_tasks(user_id, view_start, view_end)
        return await self.get_handler.format_db_to_get_result(list_tasks)

    async def get_tasks_with_notification(self, user_id: str, view_start: date, view_end: date):
        list_tasks = await self.get_handler.get_tasks_with_notification(user_id, view_start, view_end)
        return await self.get_handler.format_db_to_get_result(list_tasks)

    async def get_unfinished_tasks(self, user_id: str):
        list_tasks = await self.get_handler.get_unfinished_tasks(user_id)
        return await self.get_handler.format_db_to_get_result(list_tasks)

    @database_protect_when_error
    async def add_single(self, user_id: str, task_in: TaskIn):
        task_in.tags = await self.tag_service.check_and_return_valid_tag_ids(user_id, task_in.tags)
        task_out = await self.add_handler.add_task(user_id, None, task_in)

        result = AddResult()
        result.tasks.append(task_out)
        return result

    @database_protect_when_error
    async def add_group(self, user_id: str, task_in: TaskIn, repetition_in: RepetitionIn, view_end: date):
        self.task_checker.check_valid_repetition_end(task_in.date_start, repetition_in.repetition_end)

        task_in.tags = await self.tag_service.check_and_return_valid_tag_ids(user_id, task_in.tags)

        list_dates_of_repeated_tasks = calcu_repeated_date(task_in.date_start, repetition_in)
        if not list_dates_of_repeated_tasks:
            return await self.add_single(user_id, task_in)
        else:
            created_repetition_id = await self.add_handler.add_repetition(user_id, repetition_in, 0)

            list_dates_of_repeated_tasks.insert(0, task_in.date_start)
            list_repeated_tasks = await self.add_handler.add_repeated_tasks(user_id,
                                                                            list_dates_of_repeated_tasks,
                                                                            created_repetition_id,
                                                                            task_in,
                                                                            view_end)

            repetition = await self.add_handler.update_repetition(created_repetition_id,
                                                                  repetition_in,
                                                                  list_repeated_tasks[0].id,
                                                                  list_dates_of_repeated_tasks[-1])

            response = AddResult()
            response.repetition = RepetitionOut.model_validate(repetition)
            response.tasks.extend(list_repeated_tasks)
            return response

    @database_protect_when_error
    async def delete_single(self, user_id: str, task_id: int):
        task = await self.task_checker.check_id_and_get_task(user_id, task_id)
        await self.task_checker.check_and_return_repetition(task, False)
        await self.delete_handler.delete_task(task)

        result = UpdateResult()
        result.deleted_tasks.append(task_id)
        return result

    @database_protect_when_error
    async def delete_group(self, user_id: str, task_id: int, delete_type: UpdateType, view_end: date):
        task = await self.task_checker.check_id_and_get_task(user_id, task_id)
        repetition = await self.task_checker.check_and_return_repetition(task, True)

        match delete_type:
            case UpdateType.ALL_TASKS_WITH_REPETITION:
                return await self.delete_handler.delete_all_in_group(repetition)
            case UpdateType.ONLY_ONE_TASK:
                return await self.delete_handler.delete_one_in_group(task, repetition)
            case UpdateType.ALL_TASKS_FROM_ONE_TASK:
                return await self.delete_handler.delete_from_one_in_group(task, repetition, view_end)

    @database_protect_when_error
    async def update_repetition(self, user_id: str, task_id: int, repetition_in: RepetitionIn, view_end: date):
        task = await self.task_checker.check_id_and_get_task(user_id, task_id)
        old_repetition = await self.task_checker.check_and_return_repetition(task, True)

        if repetition_in.repetition_end:
            self.task_checker.check_valid_repetition_end(task.date_start, repetition_in.repetition_end)

        response = UpdateResult()
        new_repetition_values = {}
        new_repetition_values.update(**repetition_in.model_dump(exclude={"repetition_end"}))
        new_repetition_values.update({Repetition.repetition_end: task.date_start})

        if task.date_start != old_repetition.repetition_end:
            response = await self.delete_all_tasks_behind_edited_task(task, old_repetition, view_end)

        if task_id == old_repetition.first_task:
            new_response = await self.add_repetition_to_single(user_id, task_id, repetition_in, view_end)
            response.added_tasks.extend(new_response.added_tasks)
            response.added_repetition = new_response.added_repetition
            response.changed_tasks.clear()
            response.changed_tasks.extend(new_response.changed_tasks)
        elif list_dates := calcu_repeated_date(task.date_start, repetition_in):
            standard_task_in = TaskIn(**task.dict_task_in())
            relevant_tasks = await self.add_handler.add_repeated_tasks(user_id,
                                                                       list_dates,
                                                                       old_repetition.id,
                                                                       standard_task_in,
                                                                       view_end)
            response.added_tasks.extend(relevant_tasks)
            if repetition_in.repetition_end:
                new_repetition_values.update({Repetition.repetition_end: list_dates[-1],
                                              Repetition.standard_task: None})
            else:
                new_repetition_values.update({Repetition.repetition_end: None,
                                              Repetition.standard_task: task.id})

        if not response.deleted_repetition and (response.deleted_tasks or response.added_tasks):
            updated_repetition = await self.update_handler.update_repetition(old_repetition.id, new_repetition_values)
            response.changed_repetition = RepetitionOut.model_validate(updated_repetition)

        return response

    async def delete_all_tasks_behind_edited_task(self, task: Task, repetition: Repetition, view_end: date):
        next_task = await self.get_handler.get_all_tasks_behind(task)
        return await self.delete_handler.delete_from_one_in_group(next_task, repetition, view_end)

    @database_protect_when_error
    async def add_repetition_to_single(self, user_id: str, task_id: int, repetition_in: RepetitionIn, view_end: date):
        task = await self.task_checker.check_id_and_get_task(user_id, task_id)
        await self.task_checker.check_and_return_repetition(task, False)

        if repetition_in.repetition_end:
            self.task_checker.check_valid_repetition_end(task.date_start, repetition_in.repetition_end)

        response = UpdateResult()

        if list_dates := calcu_repeated_date(task.date_start, repetition_in):
            created_repetition_id = await self.create_and_group_tasks(user_id,
                                                                      repetition_in,
                                                                      task,
                                                                      list_dates,
                                                                      view_end,
                                                                      response)
            await self.update_values_to_created_repetition(task_id,
                                                           created_repetition_id,
                                                           repetition_in,
                                                           list_dates[-1],
                                                           response)
        return response

    async def create_and_group_tasks(self,
                                     user_id: str,
                                     repetition_in: RepetitionIn,
                                     task: Task,
                                     list_dates: list[date],
                                     view_end: date,
                                     response: UpdateResult):
        created_repetition_id = await self.add_handler.add_repetition(user_id, repetition_in, task.id)

        standard_task_in = TaskIn(**task.dict_task_in())
        repeated_tasks = await self.add_handler.add_repeated_tasks(user_id,
                                                                   list_dates,
                                                                   created_repetition_id,
                                                                   standard_task_in,
                                                                   view_end)
        updated_first_task = await self.update_handler.update_task(task.id,
                                                                   {Task.repetition_group: created_repetition_id})

        response.added_tasks.extend(repeated_tasks)
        response.changed_tasks.append(TaskOut.model_validate(updated_first_task))
        return created_repetition_id

    async def update_values_to_created_repetition(self,
                                                  task_id: int,
                                                  repetition_id: int,
                                                  repetition_in: RepetitionIn,
                                                  last_date: date,
                                                  response: UpdateResult):
        repetition_new_values = {}
        if repetition_in.repetition_end:
            repetition_new_values.update({Repetition.repetition_end: last_date})
        else:
            repetition_new_values.update({Repetition.standard_task: task_id})

        repetition = await self.update_handler.update_repetition(repetition_id, repetition_new_values)
        response.added_repetition = RepetitionOut.model_validate(repetition)

    @database_protect_when_error
    async def update_info_in_group(self,
                                   user_id: str,
                                   task_id: int,
                                   task_in: TaskIn,
                                   update_type: UpdateType,
                                   view_start: date,
                                   view_end: date):
        task = await self.task_checker.check_id_and_get_task(user_id, task_id)
        repetition = await self.task_checker.check_and_return_repetition(task, True)
        task_in.tags = await self.tag_service.check_and_return_valid_tag_ids(user_id, task_in.tags)

        if update_type == UpdateType.ALL_TASKS_WITH_REPETITION:
            return await self.update_handler.update_info_all_in_group(task, repetition, task_in, view_start, view_end)

        elif update_type == UpdateType.ALL_TASKS_FROM_ONE_TASK:
            if task.id == repetition.first_task:
                return await self.update_handler.update_info_all_in_group(task,
                                                                          repetition,
                                                                          task_in,
                                                                          view_start,
                                                                          view_end)
            await self.task_checker.check_date_start_for_update_group(task, task_in)
            return await self.update_handler.update_info_after_in_group(task, repetition, task_in, view_end)

        elif update_type == UpdateType.ONLY_ONE_TASK:
            if task.id != repetition.first_task:
                await self.task_checker.check_date_start_for_update_group(task, task_in)
            return await self.update_handler.update_info_one_in_group(task, repetition, task_in)

    @database_protect_when_error
    async def update_info_single(self, user_id: str, task_id: int, task_in: TaskIn):
        task = await self.task_checker.check_id_and_get_task(user_id, task_id)
        await self.task_checker.check_and_return_repetition(task, False)
        task_in.tags = await self.tag_service.check_and_return_valid_tag_ids(user_id, task_in.tags)

        return await self.update_handler.update_task_and_assoc(task, task_in)
