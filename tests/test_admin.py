from app.models import Role
from tests.helpers import auth_headers, create_todo, create_user


def test_admin_sees_everyones_todos(client, db):
    alice = create_user(db, "alice")
    bob = create_user(db, "bob")
    boss = create_user(db, "boss", Role.ADMIN)

    for i in range(1, 5):
        create_todo(db, alice, title=f"Title {i}")
        create_todo(db, bob, title=f"Title {i}")
    response = client.get("/admin/todos", headers=auth_headers(boss))
    assert response.status_code == 200
    assert len(response.json()) == 8


def test_normal_user_will_get_403(client, db):
    alice = create_user(db, "alice")
    response = client.get("/admin/todos", headers=auth_headers(alice))
    assert response.status_code == 403


def test_someone_without_a_token_get_401(client, db):
    response = client.get("/admin/todos")
    assert response.status_code == 401
