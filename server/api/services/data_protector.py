from functools import wraps
from fastapi import HTTPException
from starlette import status


def database_protect_when_error(func):
    @wraps(func)
    async def inner_func(self, *args, **kwargs):
        savepoint = await self.task_repo.db.begin_nested()

        try:
            result = await func(self, *args, **kwargs)
        except Exception as exception:
            await savepoint.rollback()
            raise exception
            #format_and_raise_exception_to_client(exception)
        else:
            await savepoint.commit()
            return result

    def format_and_raise_exception_to_client(exception):
        if type(exception) is HTTPException:
            raise exception
        else:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Errors appeared. No changes are implemented."
            )

    return inner_func
