from functools import lru_cache
from pydantic.v1 import BaseSettings


class EnvironmentSettings(BaseSettings):
    API_VERSION: str
    APP_NAME: str
    DATABASE_DIALECT: str
    DATABASE_HOSTNAME: str
    DATABASE_NAME: str
    DATABASE_PASSWORD: str
    DATABASE_PORT: int
    DATABASE_USERNAME: str
    DEBUG_MODE: bool
    AUTH_SECRET_KEY: str
    AUTH_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_DAYS: int

    class Config:
        env_file = "api/.env"
        env_file_encoding = "utf-8"


class DefaultValues(BaseSettings):
    REPETITION_LIMIT: int

    TAG_DEFAULT_COLOR: str
    CRITICAL_PRIORITY_COLOR: str
    HIGH_PRIORITY_COLOR: str
    MEDIUM_PRIORITY_COLOR: str
    LOW_PRIORITY_COLOR: str

    class Config:
        env_file = "api/.env"
        env_file_encoding = "utf-8"


@lru_cache
def get_environment_variables():
    return EnvironmentSettings()


@lru_cache
def get_default_values():
    return DefaultValues()
