from sqlalchemy.ext.declarative import declarative_base

from ..configs.database import engine

# Base Entity Model Schema
Base = declarative_base()


"""
# For sync programming

def init_models():
    Base.metadata.create_all(bind=engine)
"""


async def init_models():
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
