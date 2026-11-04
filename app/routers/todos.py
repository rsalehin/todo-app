from fastapi import APIRouter, status

from app.dependencies import CurrentUser, DbSession
from app.models import Todo
from app.schemas import TodoCreate, TodoPublic

router = APIRouter(prefix="/todos", tags=["todos"])


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
