from pydantic import BaseModel


class UserIn(BaseModel):
    email: str
    password: str

    class Config:
        from_attributes = True
