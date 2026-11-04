from fastapi import APIRouter

from app.dependencies import CurrentUser
from app.models import User
from app.schemas import UserPublic

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
def read_me(user: CurrentUser) -> User:
    return user
