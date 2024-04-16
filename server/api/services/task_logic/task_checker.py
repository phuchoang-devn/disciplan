from datetime import date

from fastapi import HTTPException
from fastapi.params import Depends
from starlette import status

from api.models.task_model import Task
from api.repositories.repetition_repo import RepetitionRepository
from api.repositories.task_repo import TaskRepository
from api.schemas.task_schemas import TaskIn

repetition_end_exception = HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail="Repetition_end before date_start of the task being edited"
)


class TaskChecker:
    task_repo: TaskRepository
    repetition_repo: RepetitionRepository

    def __init__(
            self,
            task_repo: TaskRepository = Depends(),
            repetition_repo: RepetitionRepository = Depends(),
    ) -> None:
        self.task_repo = task_repo
        self.repetition_repo = repetition_repo

    async def check_id_and_get_task(self, user_id: str, task_id: int):
        if not (task := await self.task_repo.get_task_by_id(task_id)) or (task.user_id != user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User does not have task {task_id}"
            )
        else:
            return task

    async def check_and_return_repetition(self, task: Task, is_request_for_group: bool):
        if is_request_for_group and not task.repetition_group:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Task {task.id} has no repetition"
            )
        if not is_request_for_group and task.repetition_group:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Task {task.id} is not single task, repetition_id: {task.repetition_group}"
            )
        return await self.repetition_repo.get_repetition(task.repetition_group) if is_request_for_group else None

    async def check_date_start_for_update_group(self, task: Task, task_in: TaskIn):
        previous_task = await self.task_repo.get_previous_task_in_group(task)
        if previous_task.date_start >= task_in.date_start:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Overlap in group is not allowed. "
                       f"Previous task starts in {str(previous_task.date_start)}"
                       f" ,current task starts in {str(task_in.date_start)}"
            )

    @staticmethod
    def check_valid_repetition_end(task_date_start: date, repetition_end: date):
        if task_date_start > repetition_end:
            raise repetition_end_exception
