from app.models import Todo
from tests.helpers import auth_headers, create_todo, create_user

NEW_TODO = {"title": "Buy milk", "description": "2 litres, oat", "priority": 3}


def test_create_todo(client, db):
    user = create_user(db, "alice")
    response = client.post("/todos", json=NEW_TODO, headers=auth_headers(user))
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Buy milk"
    assert body["completed"] is False
    assert body["owner_id"] == user.id


def test_create_todo_without_token_is_401(client):
    response = client.post("/todos", json=NEW_TODO)
    assert response.status_code == 401


def test_create_todo_ignores_owner_id_in_body(client, db):
    alice = create_user(db, "alice")
    bob = create_user(db, "bob")
    data = dict(NEW_TODO)
    data["owner_id"] = bob.id
    response = client.post("/todos", json=data, headers=auth_headers(alice))
    assert response.json()["owner_id"] == alice.id


def test_create_todo_with_invalid_priority_is_422(client, db):
    alice = create_user(db, "alice")
    data = dict(NEW_TODO)
    data["priority"] = 6
    response = client.post("/todos", json=data, headers=auth_headers(alice))
    assert response.status_code == 422


def test_list_shows_only_my_todos(client, db):
    alice = create_user(db, "alice")
    bob = create_user(db, "bob")
    create_todo(db, alice, title="Alice's todo")
    create_todo(db, bob, title="Bob's todo")

    response = client.get("/todos", headers=auth_headers(alice))
    assert response.status_code == 200
    titles = []
    for todo in response.json():
        titles.append(todo["title"])
    assert titles == ["Alice's todo"]


def test_read_my_todo(client, db):
    alice = create_user(db, "alice")
    todo = create_todo(db, alice)
    response = client.get(f"/todos/{todo.id}", headers=auth_headers(alice))
    assert response.status_code == 200
    assert response.json()["title"] == "Buy milk"


def test_read_someone_elses_todo_is_404(client, db):
    alice = create_user(db, "alice")
    bob = create_user(db, "bob")
    bobs_todo = create_todo(db, bob)
    response = client.get(f"/todos/{bobs_todo.id}", headers=auth_headers(alice))
    assert response.status_code == 404


def test_read_missing_todo_is_404(client, db):
    alice = create_user(db, "alice")
    response = client.get("/todos/999", headers=auth_headers(alice))
    assert response.status_code == 404


def test_update_my_todo(client, db):
    user = create_user(db, "alice")
    todo = create_todo(db, user)
    changes = {"title": "Buy oat milk", "description": "2 litres", "priority": 1, "completed": True}
    response = client.put(f"todos/{todo.id}", json=changes, headers=auth_headers(user))

    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Buy oat milk"
    assert body["completed"] is True


def test_update_someone_elses_todo_is_404(client, db):
    alice = create_user(db, "alice")
    bob = create_user(db, "bob")
    bobs_todo = create_todo(db, bob)
    changes = {"title": "Hacked", "description": "by alice", "priority": 1, "completed": True}
    response = client.put(f"/todos/{bobs_todo.id}", json=changes, headers=auth_headers(alice))
    assert response.status_code == 404
    db.refresh(bobs_todo)
    assert bobs_todo.title == "Buy milk"


def test_delete_my_todo(client, db):
    alice = create_user(db, "alice")
    todo = create_todo(db, alice)
    response = client.delete(f"/todos/{todo.id}", headers=auth_headers(alice))
    assert response.status_code == 204
    assert db.get(Todo, todo.id) is None


def test_delete_someone_elses_todo_is_404(client, db):
    alice = create_user(db, "alice")
    bob = create_user(db, "bob")
    bobs_todo = create_todo(db, bob)
    response = client.delete(f"/todos/{bobs_todo.id}", headers=auth_headers(alice))
    assert response.status_code == 404
    assert db.get(Todo, bobs_todo.id) is not None


def test_list_supports_limit_and_offset(client, db):
    alice = create_user(db, "alice")
    for i in range(1, 6):
        create_todo(db, alice, title=f"Todo {i}")
    params = {"limit": 2, "offset": 1}
    response = client.get("/todos", params=params, headers=auth_headers(alice))
    titles = []
    for todo in response.json():
        titles.append(todo["title"])

    assert titles == ["Todo 2", "Todo 3"]


def test_list_with_too_large_limit_is_422(client, db):
    alice = create_user(db, "alice")
    response = client.get("/todos", params={"limit": 101}, headers=auth_headers(alice))
    assert response.status_code == 422
