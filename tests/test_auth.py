NEW_USER = {
    "username": "Carol",
    "email": "carol@example.com",
    "first_name": "Carol",
    "last_name": "Jones",
    "password": "correct-horse-battery",
}


def test_register_creates_new_user(client):
    response = client.post("/auth/register", json=NEW_USER)
    assert response.status_code == 201
    body = response.json()
    assert body["username"] == "Carol"
    assert body["role"] == "user"
    assert "password" not in body
    assert "hashed_password" not in body


def test_register_ignores_role_in_body(client):
    response = client.post("/auth/register", json={**NEW_USER, "role": "admin"})
    assert response.status_code == 201
    assert response.json()["role"] == "user"
