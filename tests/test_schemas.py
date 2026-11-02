import pytest
from pydantic import ValidationError

from app.models import User
from app.schemas import PasswordChange, TodoCreate, UserCreate, UserPublic

VALID_USER = {
    "username": "alice",
    "email": "alice@example.com",
    "first_name": "Alice",
    "last_name": "Smith",
    "password": "correct_password_pattern",
}


def test_valid_user_is_accepted():
    user = UserCreate.model_validate(VALID_USER)
    assert user.username == "alice"


@pytest.mark.parametrize(
    ("field", "bad_value"),
    [
        ("username", "al"),
        ("username", "alice smith"),
        ("email", "not-an-email"),
        ("first_name", ""),
        ("password", "sh"),
        ("password", "x" * 129),
    ],
)
def test_invalid_user_fields_are_rejected(field, bad_value):
    data = {**VALID_USER, field: bad_value}
    with pytest.raises(ValidationError) as error:
        UserCreate.model_validate(data)
    assert error.value.errors()[0]["loc"] == (field,)


def test_role_cannot_be_smuggled_in():
    user = UserCreate.model_validate({**VALID_USER, "role": "admin"})
    assert "role" not in user.model_dump()


def test_user_public_reads_orm_object_and_hides_password():
    orm_user = User(
        id=1,
        username="alice",
        first_name="alice",
        last_name="smith",
        email="alice@example.com",
        hashed_password="secret-hash",
        role="user",
        is_active=True,
    )
    public = UserPublic.model_validate(orm_user)
    assert public.username == "alice"
    assert "hashed_password" not in public.model_dump()


def test_password_change_enforces_password_rules():
    with pytest.raises(ValidationError) as error:
        PasswordChange.model_validate({"current_password": "anything", "new_password": "1"})
    assert error.value.errors()[0]["loc"] == ("new_password",)


def test_numeric_string_priority_is_coerced():
    todo = TodoCreate.model_validate(
        {
            "title": "Buy Milk",
            "description": "Oat",
            "priority": "4",
        }
    )
    assert todo.priority == 4
    assert todo.completed is False


def test_priority_must_be_between_one_and_five():
    with pytest.raises(ValidationError):
        TodoCreate.model_validate(
            {
                "title": "Buy Milk",
                "description": "Two bottles",
                "priority": "6",
            }
        )
