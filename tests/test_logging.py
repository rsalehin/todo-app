import logging


def test_requests_are_logged(client, caplog):
    with caplog.at_level(logging.INFO, logger="app.requests"):
        client.get("/health")
    assert "GET /health -> 200" in caplog.text


def test_every_response_has_request_id(client):
    response = client.get("/health")
    assert len(response.headers["X-Request-ID"]) == 32


def test_incoming_request_id_is_reused(client):
    response = client.get("/health", headers={"X-Request-ID": "abc-123"})
    assert response.headers["X-Request-ID"] == "abc-123"


def test_unsafe_incoming_request_id_is_replaced(client):
    response = client.get("/health", headers={"X-Request-ID": "Not Valid!"})
    assert response.headers["X-Request-ID"] != "Not valid!"
    assert len(response.headers["X-Request-ID"]) == 32
