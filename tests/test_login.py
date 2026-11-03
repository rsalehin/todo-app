from app.routers.auth import authenticate_user
from app.security import decode_access_token
from tests.helpers import create_user, password


def test_authenticate_with_correct_password_returns_user(db):
    alice = create_user(db, "Alice")
    result = authenticate_user(db, "Alice", password)
    assert result is alice


def test_authenticate_with_wrong_password_returns_none(db):
    create_user(db, "alice")
    result = authenticate_user(db, "alice", "a-wrong-password")
    assert result is None


def test_authenticate_unknown_user_returns_none(db):
    create_user(db, "alice")
    result = authenticate_user(db, "malice", password)
    assert result is None


def test_authenticate_inactive_user_returns_none(db):
    alice = create_user(db, "alice")
    alice.is_active = False
    db.commit()
    result = authenticate_user(db, "alice", password)
    assert result is None


def test_login_returns_a_token_for_the_user(client, db):
    alice = create_user(db, "alice")
    form = {"username": "alice", "password": password}
    response = client.post("/auth/token", data=form)

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    payload = decode_access_token(body["access_token"])
    assert payload["sub"] == str(alice.id)


def test_login_with_wrong_password_is_401(client, db):
    create_user(db, "alice")
    form = {"username": "alice", "password": "not-a-real-password"}
    response = client.post("/auth/token", data=form)
    assert response.status_code == 401
    assert response.headers["WWW-Authenticate"] == "Bearer"
