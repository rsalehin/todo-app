import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Role, Todo, User


def new_user(username: str = "alice") -> User:
    return User(
        username=username,
        email=f"{username}@example.com",
        first_name="Alice",
        last_name="Smith",
        hashed_password="not-a-real-hash",
    )


def test_user_gets_id_and_defaults(db: Session):
    user = new_user()
    db.add(user)
    db.commit()
    assert user.id == 1
    assert user.is_active is True
    assert user.role == Role.USER


def test_user_name_must_be_unique(db: Session):
    user = new_user("alice")
    db.add(user)
    duplicate = new_user("alice")
    duplicate.email = "different@example.com"
    db.add(duplicate)
    with pytest.raises(IntegrityError):
        db.commit()


def test_todo_belongs_to_user(db: Session):
    user = new_user()
    user.todos.append(Todo(title="Buy Milk", description="Fridge is Empty", priority=3))
    db.add(user)
    db.commit()
    todo = db.scalar(select(Todo))
    assert todo is not None
    assert todo.owner_id == user.id
    assert todo.owner is user
    assert todo.completed is False


def test_deleting_user_deletes_their_todos(db: Session):
    user = new_user()
    user.todos.append(Todo(title="Buy Love", description="Love is empty in heart", priority=5))
    db.add(user)
    db.commit()
    db.delete(user)
    db.commit()
    todo = db.scalars(select(Todo)).all()
    assert todo == []


def test_todo_needs_an_existing_user(db: Session):
    todo = Todo(title="Buy love", description="Love is empty on heart", priority=5, owner_id=999)
    db.add(todo)
    with pytest.raises(IntegrityError):
        db.commit()
