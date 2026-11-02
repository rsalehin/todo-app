from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field

Username = Annotated[str, Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_.-]+$")]
Password = Annotated[str, Field(min_length=3, max_length=50)]
Name = Annotated[str, Field(min_length=3, max_length=50)]


class UserCreate(BaseModel):
    username: Username
    email: EmailStr
    first_name: Name
    last_name: Name
    password: Password


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    role: str
    is_active: bool


class PasswordChange(BaseModel):
    current_password: str
    new_password: Password


class TodoBase(BaseModel):
    """Fields shared by create, update and response."""

    title: Annotated[str, Field(min_length=3, max_length=100)]
    description: Annotated[str, Field(min_length=3, max_length=100)]
    priority: Annotated[int, Field(ge=1, le=5)]
    completed: bool = False


class TodoCreate(TodoBase):
    pass


class TodoUpdate(TodoBase):
    """Put replaces the whole todo, so every field is required, as in create."""


class TodoPublic(TodoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
