import pytest

from app.cli import create_admin, main
from app.models import Role, Todo
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


def test_admin_can_delete_any_users_todo(client, db):
    alice = create_user(db, "alice")
    todo = create_todo(db, alice)
    boss = create_user(db, "boss", role=Role.ADMIN)
    response = client.delete(f"/admin/todos/{todo.id}", headers=auth_headers(boss))
    assert response.status_code == 204
    assert db.get(Todo, todo.id) is None


def test_normal_user_cannot_delete_others_todo(client, db):
    alice = create_user(db, "alice")
    bob = create_user(db, "bob")
    bobs_todo = create_todo(db, bob)
    response = client.delete(f"/admin/todos/{bobs_todo.id}", headers=auth_headers(alice))

    assert response.status_code == 403
    assert db.get(Todo, bobs_todo.id) is not None


def test_admin_delete_missing_todo_is_404(client, db):
    boss = create_user(db, "boss", role=Role.ADMIN)
    response = client.delete("/admin/todos/2", headers=auth_headers(boss))

    assert response.status_code == 404


def test_create_admin_makes_an_admin(db):
    admin = create_admin(db, "boss", "boss@example.com", "correct-horse-battery")
    assert admin.role == Role.ADMIN


def test_create_admin_rejects_a_taken_username(db):
    create_admin(db, "boss", "boss@example.com", "correct-horse-battery")
    with pytest.raises(SystemExit):
        create_admin(db, "boss", "other@example.com", "correct-horse-battery")


def fake_getpass_short(prompt):
    return "short"


def test_cli_rejects_short_password(monkeypatch):
    monkeypatch.setattr("getpass.getpass", fake_getpass_short)
    with pytest.raises(SystemExit):
        main(["create-admin", "--username", "boss", "--email", "boss@example.com"])


def test_cli_creates_admin(monkeypatch, db, capsys):
    def fake_getpass(prompt):
        return "correct-horse-battery"

    def fake_session_local():
        return db

    monkeypatch.setattr("getpass.getpass", fake_getpass)
    monkeypatch.setattr("app.cli.SessionLocal", fake_session_local)
    main(["create-admin", "--username", "boss", "--email", "boss@gmail.com"])
    output = capsys.readouterr().out
    assert "Admin 'boss' created" in output
