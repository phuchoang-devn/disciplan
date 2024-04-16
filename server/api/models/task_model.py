from datetime import date
from sqlalchemy.types import Date, Time
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, UUID
from sqlalchemy.orm import relationship

from .base_model import Base


class Task(Base):
    __tablename__ = "tasks"

    user_id = Column(String, ForeignKey("users.uuid", ondelete="CASCADE"), index=True, nullable=False)
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    description = Column(String)
    priority = Column(String, index=True)
    date_start = Column(Date, nullable=False, index=True)
    time_start = Column(Time, index=True)
    date_end = Column(Date, nullable=False)
    time_end = Column(Time)
    # "status" is stored in percentage of perfection
    status = Column(Integer, nullable=False, default=0, index=True)
    color = Column(String, nullable=False)
    # "notification" is the number of minutes before the task
    notification = Column(Integer, index=True)
    is_archived = Column(Boolean, nullable=False, default=False, index=True)
    repetition_group = Column(Integer, ForeignKey("repetitions.id", ondelete="CASCADE"))

    tags = relationship("Tag",
                        secondary="task_tag_association",
                        lazy="selectin")
    associations = relationship("TaskTagAssociation",
                                back_populates="task",
                                cascade="all, delete",
                                passive_deletes=False)
    repetition = relationship("Repetition", back_populates="tasks", lazy="noload")
    user = relationship("User", back_populates="tasks", lazy="noload")

    def normalize_date(self):
        self.date_start = date(self.date_start.year, self.date_start.month, self.date_start.day)
        self.date_end = date(self.date_end.year, self.date_end.month, self.date_end.day)
        return self

    def get_tag_ids(self):
        return list(map(lambda c: c.id, self.tags))

    def dict_task_in(self):
        task_dict = dict(map(lambda attr: (attr, getattr(self, attr)),
                             {"name", "description", "priority",
                              "date_start", "time_start", "date_end",
                              "time_end", "status", "color",
                              "notification", "is_archived", "repetition_group"}))
        task_dict.update({"tags": self.get_tag_ids()})
        return task_dict
