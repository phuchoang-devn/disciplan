from pydantic import BaseModel

from ..schemas.repetition_schemas import RepetitionOut
from ..schemas.task_schemas import TaskOut


class GetResult(BaseModel):
    repetitions: list[RepetitionOut] | None = []
    tasks: list[TaskOut] | None = []


class AddResult(BaseModel):
    repetition: RepetitionOut | None = None
    tasks: list[TaskOut] = []


class UpdateResult(BaseModel):
    deleted_repetition: int | None = None
    changed_repetition: RepetitionOut | None = None
    added_repetition: RepetitionOut | None = None
    deleted_tasks: list[int] | None = []
    changed_tasks: list[TaskOut] | None = []
    added_tasks: list[TaskOut] | None = []
