from fastapi import APIRouter
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
