from sqlalchemy.orm import Session

from app.models import Role, Todo, User
from app.security import create_access_token, hash_password

password = "it-is-a-fake-password"


def create_user(db: Session, username: str, role: str = Role.USER) -> User:
    user = User(
        username=f"{username}",
        first_name="Alice",
        last_name="Smith",
        hashed_password=hash_password(password),
        role=role,
        email=f"{username}@example.com",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_todo(db: Session, owner: User, title: str = "Buy milk") -> Todo:
    todo = Todo(title=title, description="2 litres, oat", priority=3, owner_id=owner.id)
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


def auth_headers(user: User) -> dict[str, str]:
    token = create_access_token(subject=str(user.id))
    return {"Authorization": f"Bearer {token}"}
