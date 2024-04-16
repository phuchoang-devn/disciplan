from sqlalchemy import Column, String, Integer, ForeignKey, UUID
from sqlalchemy.orm import relationship

from .base_model import Base


class Tag(Base):
    __tablename__ = "tags"

    user_id = Column(String, ForeignKey("users.uuid", ondelete="CASCADE"), index=True, nullable=False)
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False, index=True)
    color = Column(String)

    associations = relationship("TaskTagAssociation",
                                back_populates="tag",
                                cascade="all, delete",
                                passive_deletes=False)
    user = relationship("User", back_populates="tags", lazy="noload")
