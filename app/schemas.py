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
