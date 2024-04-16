from datetime import date

from sqlalchemy.orm import relationship
from sqlalchemy.types import Date
from sqlalchemy import Column, Integer, String, UUID, ForeignKey

from .base_model import Base


class Repetition(Base):
    __tablename__ = "repetitions"

    user_id = Column(String, ForeignKey("users.uuid", ondelete="CASCADE"), index=True, nullable=False)
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    repetition_end = Column(Date)
    frequency = Column(Integer, nullable=False)
    # "frequency_unit" can be one of these four: DAY, WEEK, MONTH, YEAR
    frequency_unit = Column(String, nullable=False)
    first_task = Column(Integer, nullable=False)
    # "standard_task" stores the id of task will be used for repetition process
    standard_task = Column(Integer)

    tasks = relationship("Task",
                         back_populates="repetition",
                         cascade='all, delete',
                         passive_deletes=False)
    user = relationship("User", back_populates="repetitions", lazy="noload")

    def normalize(self):
        self.repetition_end = date(self.repetition_end.year, self.repetition_end.month, self.repetition_end.day)