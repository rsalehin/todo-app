from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.dependencies import CurrentUser, DbSession
from app.models import Todo, User
from app.schemas import TodoCreate, TodoPublic, TodoUpdate

router = APIRouter(prefix="/todos", tags=["todos"])


def get_todo_or_404(db: Session, todo_id: int, user: User) -> Todo:
    statement = select(Todo).where(Todo.id == todo_id, Todo.owner_id == user.id)
    todo = db.scalar(statement)

    if todo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")

    return todo


@router.post("", response_model=TodoPublic, status_code=status.HTTP_201_CREATED)
def create_todo(payload: TodoCreate, user: CurrentUser, db: DbSession) -> Todo:
    todo = Todo(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        completed=payload.completed,
        owner_id=user.id,
    )

    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@router.get("", response_model=list[TodoPublic])
def list_todos(db: DbSession, user: CurrentUser) -> list[Todo]:
    statement = select(Todo).where(Todo.owner_id == user.id)
    statement = statement.order_by(Todo.id)
    todos = db.scalars(statement).all()
    return list(todos)


@router.get("/{todo_id}", response_model=TodoPublic)
def read_todo(todo_id: int, user: CurrentUser, db: DbSession) -> Todo:
    todo = get_todo_or_404(db, todo_id, user)
    return todo


@router.put("/{todo_id}", response_model=TodoPublic)
def update_todo(todo_id: int, payload: TodoUpdate, user: CurrentUser, db: DbSession) -> Todo:
    todo = get_todo_or_404(db, todo_id, user)

    todo.title = payload.title
    todo.description = payload.description
    todo.priority = payload.priority
    todo.completed = payload.completed

    db.commit()
    db.refresh(todo)

    return todo
