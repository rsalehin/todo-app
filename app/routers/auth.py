from fastapi import APIRouter, status

from app.dependencies import DbSession
from app.models import User
from app.schemas import UserCreate, UserPublic
from app.security import hash_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: DbSession) -> User:
    user = User(
        **payload.model_dump(exclude={"password"}), hashed_password=hash_password(payload.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
