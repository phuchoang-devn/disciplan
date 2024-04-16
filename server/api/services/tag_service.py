import copy
from fastapi import Depends, HTTPException
from starlette import status

from ..models.tag_models import Tag
from ..models.task_model import Task
from ..repositories.tag_repo import TagRepository
from ..repositories.assoc_repo import TaskTagAssocRepository
from ..schemas.tag_schemas import TagOut, TagIn


class TagService:
    tag_repo: TagRepository
    assoc_repo: TaskTagAssocRepository

    def __init__(
            self,
            tag_repo: TagRepository = Depends(),
            assoc_repo: TaskTagAssocRepository = Depends()
    ) -> None:
        self.tag_repo = tag_repo
        self.assoc_repo = assoc_repo

    async def check_and_return_valid_tag_ids(self, user_id: str, list_ids: list[int] | None):
        set_of_ids = set(list_ids) if list_ids else None
        for tag_id in (list_ids or []):
            await self.check_and_return_valid_tag(user_id, tag_id)
        return list(set_of_ids) if list_ids else None

    async def check_and_return_valid_tag(self, user_id: str, tag_id: int):
        if not (tag := await self.tag_repo.get_tag_by_id(tag_id)) or (tag.user_id != user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User does not have tag {tag_id}"
            )
        else:
            return tag

    async def check_valid_tag_name(self, user_id: str, tag_id: int | None, tag_name: str):
        tag = await self.tag_repo.get_tag_by_name(user_id, tag_name)
        if tag and (not tag_id or tag_id != tag.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tag name already exists",
            )

    async def get_all_tag(self, user_id: str):
        list_tag_outs = []
        for tag in await self.tag_repo.get_all_tag(user_id):
            list_tag_outs.append(TagOut.model_validate(tag))
        return list_tag_outs

    async def add_tag(self, user_id: str, tag_in: TagIn):
        await self.check_valid_tag_name(user_id, None, tag_in.name)
        tag = Tag(**tag_in.model_dump(), user_id=user_id)
        await self.tag_repo.add_tag(tag)
        return TagOut.model_validate(tag)

    async def add_assoc(self, task: Task, list_tag_ids: list[int]):
        for tag_id in (list_tag_ids or []):
            await self.assoc_repo.add_assoc(task, tag_id)

    async def delete_tag(self, user_id: str, tag_id: int):
        tag = await self.check_and_return_valid_tag(user_id, tag_id)
        await self.tag_repo.delete_tag(tag)
        return tag_id

    async def update_tag(self, user_id: str, tag_id: int, tag_in: TagIn):
        await self.check_and_return_valid_tag(user_id, tag_id)
        await self.check_valid_tag_name(user_id, tag_id, tag_in.name)
        updated_tag = await self.tag_repo.update_tag(tag_id, {**tag_in.model_dump()})
        return TagOut.model_validate(updated_tag)

    async def update_assoc(self, task: Task, list_new_ids: list[int]):
        list_tags_to_add = await self.remove_old_assoc_and_calc_list_to_add(task, list_new_ids)
        await self.add_new_assoc(task, list_tags_to_add)

    async def remove_old_assoc_and_calc_list_to_add(self, task: Task, list_new_ids: list[int]):
        list_tags_to_delete = copy.deepcopy(list_new_ids)
        for old_id in (task.get_tag_ids() or []):
            if old_id in (list_new_ids or []):
                list_tags_to_delete.remove(old_id)
            else:
                await self.assoc_repo.delete_assoc(task, old_id)
        return list_tags_to_delete

    async def add_new_assoc(self, task: Task, list_tags_to_add: list[int]):
        for updated_tag_id in (list_tags_to_add or []):
            await self.assoc_repo.add_assoc(task, updated_tag_id)
