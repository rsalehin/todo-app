from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.dependencies import AdminUser, DbSession
from app.models import Todo
from app.schemas import TodoPublic

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/todos", response_model=list[TodoPublic])
def list_all_todos(admin: AdminUser, db: DbSession) -> list[Todo]:
    statement = select(Todo).order_by(Todo.id)
    todos = db.scalars(statement).all()
    return list(todos)


@router.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_any_todo(todo_id: int, admin: AdminUser, db: DbSession) -> None:
    todo = db.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    db.delete(todo)
    db.commit()
