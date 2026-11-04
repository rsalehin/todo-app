from tests.helpers import auth_headers, create_user

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
