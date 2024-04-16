from pydantic import BaseModel, Field, model_validator

from ..configs.default import get_default_values

dv = get_default_values()


class TagIn(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    color: str | None = Field(pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")

    def validate_color(self):
        if not self.color:
            self.color = dv.TAG_DEFAULT_COLOR

    @model_validator(mode='after')
    def set_default_values(self):
        self.validate_color()
        return self

    class Config:
        from_attributes = True


class TagOut(TagIn):
    id: int
