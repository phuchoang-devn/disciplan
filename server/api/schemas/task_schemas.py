from pydantic import BaseModel, Field, model_validator
from datetime import time, date

from ..configs.default import Priority, ColorForPriority
from ..schemas.tag_schemas import TagOut


class TaskBase(BaseModel):
    name: str = Field(max_length=200, min_length=1)
    description: str | None
    priority: Priority
    date_start: date
    time_start: time | None
    date_end: date
    time_end: time | None
    # "status" is stored in percentage of perfection
    status: int | None = Field(ge=0, le=100)
    color: str | None = Field(pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
    notification: int | None
    is_archived: bool | None

    class Config:
        from_attributes = True


class TaskIn(TaskBase):
    # id of Tags
    tags: list[int] | None
    
    def validate_time(self):
        if self.date_start > self.date_end:
            raise ValueError("date_start after date_end")

        if (self.date_end - self.date_start).days > 1:
            self.time_start = None
            self.time_end = None
        elif not self.time_start or not self.time_end:
            raise ValueError("time_end or time_start is empty")
        elif self.time_start >= self.time_end:
            raise ValueError("time_start after or same date_end in the same day")
        
        self.reformat_daytime_in_5min_unit()
            
    def reformat_daytime_in_5min_unit(self):
        if self.time_start:
            minute = self.time_start.minute
            self.time_start = self.time_start.replace(minute=round(minute/5)*5, second=0, microsecond=0)
        if self.time_end:
            minute = self.time_end.minute
            self.time_end = self.time_end.replace(minute=round(minute/5)*5, second=0, microsecond=0)
            
    def validate_status(self):
        if self.status is None:
            self.status = 0

    def validate_color(self):
        if self.color is None:
            self.color = ColorForPriority[self.priority.name].value

    def validate_archive_status(self):
        if self.is_archived is None:
            self.is_archived = False

    def validate_tags(self):
        if not self.tags:
            self.tags = None

    @model_validator(mode='after')
    def set_default_values(self):
        self.validate_time()
        self.validate_status()
        self.validate_color()
        self.validate_archive_status()
        self.validate_tags()
        return self

    class Config:
        from_attributes = True


class TaskOut(TaskBase):
    id: int
    tags: list[TagOut] | None = None
    repetition_group: int | None = None
