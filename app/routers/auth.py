from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.dependencies import DbSession
from app.models import User
from app.schemas import Token, UserCreate, UserPublic
from app.security import DUMMY_HASH, create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    statement = select(User).where(User.username == username)
    user = db.scalar(statement)
    if user is None:
        verify_password(password, DUMMY_HASH)
        return None
    password_ok = verify_password(password, user.hashed_password)
    if not password_ok:
        return None
    if not user.is_active:
        return None
    return user


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: DbSession) -> User:
    user = User(
        **payload.model_dump(exclude={"password"}), hashed_password=hash_password(payload.password)
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status.HTTP_409_CONFLICT, detail="Username or email already taken"
        ) from None
    db.refresh(user)
    return user


@router.post("/token", response_model=Token)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], db: DbSession) -> Token:
    user = authenticate_user(db, form.username, form.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(subject=str(user.id))
    return Token(access_token=token)
