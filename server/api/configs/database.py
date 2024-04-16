from asyncio import current_task

from sqlalchemy.ext.asyncio import async_sessionmaker, async_scoped_session, create_async_engine

from .enviroment import get_environment_variables

# Runtime Environment Configuration
env = get_environment_variables()

# Generate Database URL
#DATABASE_URL = f"{env.DATABASE_DIALECT}://{env.DATABASE_USERNAME}:{env.DATABASE_PASSWORD}@{env.DATABASE_HOSTNAME}:{env.DATABASE_PORT}/{env.DATABASE_NAME}"
DATABASE_URL = "sqlite+aiosqlite:///./test_todolist.db"

engine = create_async_engine(
    DATABASE_URL, echo=env.DEBUG_MODE, future=True
)
"""
engine = create_async_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
"""

SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)


async def get_db_connection():
    db = async_scoped_session(SessionLocal, scopefunc=current_task)
    #db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()
