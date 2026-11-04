from datetime import timedelta

from app.security import create_access_token
from tests.helpers import auth_headers, create_user, password


def test_me_without_token_is_401(client):
    response = client.get("/users/me")
    assert response.status_code == 401


def test_me_returns_the_logged_in_user(client, db):
    alice = create_user(db, "alice")
    response = client.get("/users/me", headers=auth_headers(alice))
    assert response.status_code == 200
    body = response.json()
    assert body["username"] == "alice"
    assert "hashed_password" not in body


def test_me_with_garbage_token_is_401(client):
    response = client.get("/users/me", headers={"Authorization": "Bearer not.a.jwt"})
    assert response.status_code == 401


def test_me_with_expired_token_is_401(db, client):
    user = create_user(db, "alice")
    token = create_access_token(subject=str(user.id), expires_delta=timedelta(seconds=-1))
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/users/me", headers=headers)
    assert response.status_code == 401


def test_me_for_deleted_user_is_401(db, client):
    user = create_user(db, "alice")
    headers = auth_headers(user)
    db.delete(user)
    db.commit()
    response = client.get("/users/me", headers=headers)
    assert response.status_code == 401


def test_me_for_non_numeric_subject_is_401(client):
    token = create_access_token(subject="alice")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/users/me", headers=headers)
    assert response.status_code == 401


def test_change_password_with_wrong_current_password_is_400(client, db):
    user = create_user(db, "alice")
    body = {"current_password": "wrong-password", "new_password": "brand-new-password"}
    response = client.put("/users/me/password", json=body, headers=auth_headers(user))
    assert response.status_code == 400


def test_change_password_then_only_new_password_works(client, db):
    user = create_user(db, "alice")
    body = {"current_password": password, "new_password": "brand-new-password"}
    response = client.put("/users/me/password", json=body, headers=auth_headers(user))
    assert response.status_code == 204
    old_login = client.post("/auth/token", data={"username": "alice", "password": password})
    new_login = client.post(
        "/auth/token", data={"username": "alice", "password": "brand-new-password"}
    )
    assert old_login.status_code == 401
    assert new_login.status_code == 200
