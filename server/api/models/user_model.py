import uuid
from sqlalchemy import Column, UUID, String, Date, Boolean
from sqlalchemy.orm import relationship

from .base_model import Base
from ..configs.enviroment import get_default_values


dv = get_default_values()


class User(Base):
    __tablename__ = "users"

    uuid = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    last_access = Column(Date, nullable=False, index=True)
    disabled = Column(Boolean, default=False, index=True)

    critical_color = Column(String, default=dv.CRITICAL_PRIORITY_COLOR)
    high_color = Column(String, default=dv.HIGH_PRIORITY_COLOR)
    medium_color = Column(String, default=dv.MEDIUM_PRIORITY_COLOR)
    low_color = Column(String, default=dv.LOW_PRIORITY_COLOR)
    tag_color = Column(String, default=dv.TAG_DEFAULT_COLOR)

    tasks = relationship("Task",
                         back_populates="user",
                         cascade='all, delete',
                         passive_deletes=False)
    repetitions = relationship("Repetition",
                               back_populates="user",
                               cascade='all, delete',
                               passive_deletes=False)
    tags = relationship("Tag",
                        back_populates="user",
                        cascade='all, delete',
                        passive_deletes=False)
