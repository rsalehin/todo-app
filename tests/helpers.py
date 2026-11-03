from sqlalchemy.orm import Session

from app.models import User
from app.security import hash_password

password = "it-is-a-fake-password"


def create_user(db: Session, username: str) -> User:
    user = User(
        username=f"{username}",
        first_name="Alice",
        last_name="Smith",
        hashed_password=hash_password(password),
        email=f"{username}@example.com",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
