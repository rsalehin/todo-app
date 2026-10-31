from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_unknown_path_returns_404():
    response = client.get("/nope")
    assert response.status_code == 404


def test_wrong_method_returns_405():
    response = client.post("/health")
    assert response.status_code == 405
