from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from .base_model import Base


class TaskTagAssociation(Base):
    __tablename__ = "task_tag_association"

    task_id = Column(Integer, ForeignKey('tasks.id', ondelete="CASCADE"), primary_key=True, index=True)
    tag_id = Column(Integer, ForeignKey('tags.id', ondelete="CASCADE"), primary_key=True, index=True)

    task = relationship("Task", back_populates="associations", lazy="noload")
    tag = relationship("Tag", back_populates="associations", lazy="noload")
