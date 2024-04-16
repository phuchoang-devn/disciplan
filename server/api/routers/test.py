from typing import Annotated

from fastapi import APIRouter, Depends

from api.models.user_model import User
from api.repositories.assoc_repo import TaskTagAssocRepository
from api.repositories.repetition_repo import RepetitionRepository
from api.repositories.task_repo import TaskRepository
from api.routers.users import get_current_active_user

router = APIRouter(
    prefix="/test",
)


@router.get("/get/r/")
async def get_all_repe(repo: Annotated[RepetitionRepository, Depends()]):
    return await repo.get_all_repe()


@router.get("/get/t/")
async def get_all_repe(repo: Annotated[TaskRepository, Depends()]):
    return await repo.get_all()


@router.get("/get/a/")
async def get_all_assoc(repo: Annotated[TaskTagAssocRepository, Depends()]):
    return await repo.get_all()
