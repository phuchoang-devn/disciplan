from pydantic import BaseModel, model_validator
from datetime import date

from ..configs.default import FrequencyUnit


class RepetitionIn(BaseModel):
    repetition_end: date | None
    frequency: int
    frequency_unit: FrequencyUnit

    def validate_frequency(self):
        if self.frequency <= 0:
            raise ValueError("frequency smaller than 0")

    @model_validator(mode='after')
    def set_default_values(self):
        self.validate_frequency()
        return self

    class Config:
        from_attributes = True


class RepetitionOut(RepetitionIn):
    id: int
    first_task: int

    class Config:
        from_attributes = True

