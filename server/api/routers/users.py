from datetime import timedelta, datetime
from typing import Annotated
from fastapi import Depends, HTTPException, APIRouter, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from starlette import status
from starlette.responses import JSONResponse

from ..configs.enviroment import get_environment_variables
from ..models.user_model import User
from ..services.user_service import UserService


router = APIRouter(
    prefix="/users",
)

env = get_environment_variables()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=env.ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, env.AUTH_SECRET_KEY, algorithm=env.AUTH_ALGORITHM)
    return encoded_jwt


async def get_current_user(
        token: Annotated[str, Depends(oauth2_scheme)],
        user_service: Annotated[UserService, Depends()]
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, env.AUTH_SECRET_KEY, algorithms=[env.AUTH_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    if not (user := await user_service.get_user_by_id(user_id)):
        raise credentials_exception
    return user


async def get_current_active_user(
        current_user: Annotated[User, Depends(get_current_user)]
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@router.post("/token/")
async def login_for_access_token(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
        user_service: Annotated[UserService, Depends()]
):
    user = await user_service.authenticate_user(form_data.username, form_data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.uuid})
    return JSONResponse(content={"access_token": access_token, "token_type": "bearer"})


@router.post("/register/")
async def user_register(
        email: Annotated[str, Form()],
        password: Annotated[str, Form()],
        user_service: Annotated[UserService, Depends()]
):
    await user_service.add_user(email, password)


@router.post("/verify/", dependencies=[Depends(get_current_active_user)])
async def token_verify():
    return {"message": "success"}


@router.get("/default-color/")
async def get_default_color(
        user: Annotated[User, Depends(get_current_active_user)]
):
    return {
        "critical": user.critical_color,
        "high": user.high_color,
        "medium": user.medium_color,
        "low": user.low_color,
        "tag": user.tag_color
    }


@router.put("/update/password")
async def update_password(
        user: Annotated[User, Depends(get_current_active_user)],
        current_password: Annotated[str, Form()],
        new_password: Annotated[str, Form()],
        user_service: Annotated[UserService, Depends()]
):
    await user_service.update_password(user, current_password, new_password)
