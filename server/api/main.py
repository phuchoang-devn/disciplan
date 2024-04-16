from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from .configs.enviroment import get_environment_variables
from .models.base_model import init_models
from .routers import tags, tasks, users, test

# Application Environment Configuration
env = get_environment_variables()


app = FastAPI(
    title=env.APP_NAME,
    version=env.API_VERSION,
)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)
app.include_router(tags.router)
app.include_router(users.router)
app.include_router(test.router)

# Initialise Data Model Attributes


@app.on_event("startup")
async def init_tables():
    await init_models()


@app.get("/")
async def root():
    return {"message": "Hello Bigger Applications!"}
