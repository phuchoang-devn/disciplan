from datetime import date
from typing import Annotated
from fastapi import APIRouter, Depends, Query, HTTPException, Request
from starlette import status

from .users import get_current_active_user
from ..configs.default import UpdateType, FrequencyUnit
from ..models.user_model import User
from ..schemas.repetition_schemas import RepetitionIn
from ..schemas.task_schemas import TaskIn
from ..services.task_service import TaskService

router = APIRouter(
    prefix="/tasks",
)


class RequestView:
    def __init__(self, fr: Annotated[date, Query(alias="from")], to: date):
        if fr > to:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid time period",
            )
        self.fr = fr
        self.to = to


class RepetitionInReformat:
    repetition_in: RepetitionIn

    def __init__(self, repetition_in: RepetitionIn):
        if (repetition_in.frequency_unit == FrequencyUnit.DAY) and (repetition_in.frequency % 7 == 0):
            repetition_in.frequency_unit = FrequencyUnit.WEEK
            repetition_in.frequency = int(repetition_in.frequency / 7)
        elif (repetition_in.frequency_unit == FrequencyUnit.MONTH) and (repetition_in.frequency % 12 == 0):
            repetition_in.frequency_unit = FrequencyUnit.YEAR
            repetition_in.frequency = int(repetition_in.frequency / 12)

        self.repetition_in = repetition_in


@router.post("/add/s/")
async def add_one(
        user: Annotated[User, Depends(get_current_active_user)],
        request: Request,
        task_in: TaskIn,
        task_service: Annotated[TaskService, Depends()]
):
    print(await request.json(), await request.body())
    return await task_service.add_single(user.uuid, task_in)


@router.post("/add/g/")
async def add_group(
        user: Annotated[User, Depends(get_current_active_user)],
        task_in: TaskIn,
        repetition_depend: Annotated[RepetitionInReformat, Depends(RepetitionInReformat)],
        view: Annotated[RequestView, Depends(RequestView)],
        task_service: Annotated[TaskService, Depends()]
):
    return await task_service.add_group(user.uuid, task_in, repetition_depend.repetition_in, view.to)


@router.get("/period/")
async def get_task_by_period_of_time(
        user: Annotated[User, Depends(get_current_active_user)],
        view: Annotated[RequestView, Depends(RequestView)],
        task_service: Annotated[TaskService, Depends()]
):
    return await task_service.get_tasks_by_period(user.uuid, view.fr, view.to)


@router.get("/tag/{tag_id}")
async def get_task_by_period_of_time(
        user: Annotated[User, Depends(get_current_active_user)],
        tag_id: int,
        view: Annotated[RequestView, Depends(RequestView)],
        task_service: Annotated[TaskService, Depends()]
):
    return await task_service.get_tasks_by_tag(user.uuid, tag_id, view.fr, view.to)


@router.get("/archive/")
async def get_archived_tasks(
        user: Annotated[User, Depends(get_current_active_user)],
        view: Annotated[RequestView, Depends(RequestView)],
        task_service: Annotated[TaskService, Depends()]
):
    return await task_service.get_archived_tasks(user.uuid, view.fr, view.to)


@router.get("/notification/")
async def get_archived_tasks(
        user: Annotated[User, Depends(get_current_active_user)],
        view: Annotated[RequestView, Depends(RequestView)],
        task_service: Annotated[TaskService, Depends()]
):
    return await task_service.get_tasks_with_notification(user.uuid, view.fr, view.to)


@router.get("/waiting/")
async def get_waiting_tasks(
        user: Annotated[User, Depends(get_current_active_user)],
        task_service: Annotated[TaskService, Depends()]
):
    return await task_service.get_unfinished_tasks(user.uuid)


@router.delete("/delete/s/{task_id}/")
async def delete_single(
        user: Annotated[User, Depends(get_current_active_user)],
        task_id: int,
        task_service: Annotated[TaskService, Depends()]
):
    return await task_service.delete_single(user.uuid, task_id)


@router.delete("/delete/g/{task_id}/")
async def delete_group(
        user: Annotated[User, Depends(get_current_active_user)],
        task_id: int,
        delete_type: Annotated[UpdateType, Query(alias="type")],
        view: Annotated[RequestView, Depends(RequestView)],
        task_service: Annotated[TaskService, Depends()]
):
    return await task_service.delete_group(user.uuid, task_id, delete_type, view.to)


@router.put("/update/s/{task_id}/")
async def update_single(
        user: Annotated[User, Depends(get_current_active_user)],
        task_id: int,
        task_in: TaskIn,
        task_service: Annotated[TaskService, Depends()]
):
    return await task_service.update_info_single(user.uuid, task_id, task_in)


@router.put("/add/r/{task_id}/")
async def add_repetition_to_single(
        user: Annotated[User, Depends(get_current_active_user)],
        task_id: int,
        repetition_depend: Annotated[RepetitionInReformat, Depends(RepetitionInReformat)],
        view: Annotated[RequestView, Depends(RequestView)],
        task_service: TaskService = Depends()
):
    return await task_service.add_repetition_to_single(user.uuid,
                                                       task_id,
                                                       repetition_depend.repetition_in,
                                                       view.to)


@router.put("/update/r/{task_id}/")
async def update_repetition(
        user: Annotated[User, Depends(get_current_active_user)],
        task_id: int,
        repetition_depend: Annotated[RepetitionInReformat, Depends(RepetitionInReformat)],
        view: Annotated[RequestView, Depends(RequestView)],
        task_service: Annotated[TaskService, Depends()]
):
    return await task_service.update_repetition(user.uuid, task_id, repetition_depend.repetition_in, view.to)


@router.put("/update/g/{task_id}/")
async def update_group_info(
        user: Annotated[User, Depends(get_current_active_user)],
        task_id: int,
        task_in: TaskIn,
        view: Annotated[RequestView, Depends(RequestView)],
        update_type: Annotated[UpdateType, Query(alias="type")],
        task_service: Annotated[TaskService, Depends()]
):
    return await task_service.update_info_in_group(user.uuid, task_id, task_in, update_type, view.fr, view.to)
