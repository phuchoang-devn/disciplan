from typing import Annotated

from fastapi import APIRouter, Depends
from starlette.requests import Request

from .users import get_current_active_user
from ..models.user_model import User
from ..schemas.tag_schemas import TagIn
from ..services.tag_service import TagService

router = APIRouter(
    prefix="/tags",
)


@router.post("/add/")
async def add_new_tag(
        user: Annotated[User, Depends(get_current_active_user)],
        tag_in: TagIn,
        tag_service: Annotated[TagService, Depends()]
):
    return await tag_service.add_tag(user.uuid, tag_in)


@router.get("/all/")
async def get_all_tag(
        user: Annotated[User, Depends(get_current_active_user)],
        tag_service: Annotated[TagService, Depends()]
):
    return await tag_service.get_all_tag(user.uuid)


@router.put("/update/{tag_id}/")
async def update_tag(
        user: Annotated[User, Depends(get_current_active_user)],
        request: Request,
        tag_id: int,
        tag_in: TagIn,
        tag_service: Annotated[TagService, Depends()]
):
    print(await request.body())
    return await tag_service.update_tag(user.uuid, tag_id, tag_in)


@router.delete("/delete/{tag_id}/")
async def delete_tag(
        user: Annotated[User, Depends(get_current_active_user)],
        tag_id: int,
        tag_service: Annotated[TagService, Depends()]
):
    return await tag_service.delete_tag(user.uuid, tag_id)
