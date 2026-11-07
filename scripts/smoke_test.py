"""Smoke test: prove the main flow works against a RUNNING server.

Usage:  uv run python scripts/smoke_test.py [base_url]
"""

import sys
import time
import uuid

import httpx


def wait_until_healthy(client: httpx.Client) -> None:
    # A freshly started server needs a moment. Try /health for up to 30 seconds.
    for _attempt in range(30):
        try:
            response = client.get("/health")
            if response.status_code == 200:
                return
        except httpx.TransportError:
            pass  # not accepting connections yet
        time.sleep(1)
    raise SystemExit("Server did not become healthy within 30 seconds.")


def check(response: httpx.Response, expected_status: int, step: str) -> None:
    if response.status_code != expected_status:
        raise SystemExit(f"{step}: expected {expected_status}, got {response.status_code}")
    print(f"ok  {step}")


def main() -> None:
    base_url = "http://127.0.0.1:8000"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]

    # A new username every run, so running the script twice doesn't hit a 409.
    username = "smoke-" + uuid.uuid4().hex[:8]
    password = "correct-horse-battery"

    with httpx.Client(base_url=base_url, timeout=10) as client:
        wait_until_healthy(client)
        print(f"ok  health ({base_url})")

        new_user = {
            "username": username,
            "email": f"{username}@example.com",
            "first_name": "Smoke",
            "last_name": "Test",
            "password": password,
        }
        response = client.post("/auth/register", json=new_user)
        check(response, 201, "register")

        response = client.post("/auth/token", data={"username": username, "password": password})
        check(response, 200, "login")
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        todo = {"title": "Buy milk", "description": "2 litres, oat", "priority": 3}
        response = client.post("/todos", json=todo, headers=headers)
        check(response, 201, "create todo")

        response = client.get("/todos", headers=headers)
        check(response, 200, "list todos")

    print("Smoke test passed.")


if __name__ == "__main__":
    main()
