"""Make sure the admin account used by the E2E tests exists.

Run as a module from the project root, before the E2E backend starts:
    uv run python -m scripts.e2e_create_admin
(see frontend/playwright.config.ts).
Safe to run many times: it only creates the admin if it's missing.
"""

from sqlalchemy import select

from app.cli import create_admin
from app.database import Base, SessionLocal, engine
from app.models import User

# Keep in sync with E2E_ADMIN in frontend/e2e/helpers.ts.
USERNAME = "e2e-admin"
PASSWORD = "correct-horse-battery"


def main() -> None:
    # The server hasn't started yet, so its lifespan hasn't created the tables.
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        existing = db.scalar(select(User).where(User.username == USERNAME))
        if existing is None:
            create_admin(db, USERNAME, "e2e-admin@example.com", PASSWORD)
            print(f"Created E2E admin '{USERNAME}'.")
        else:
            print(f"E2E admin '{USERNAME}' already exists.")


if __name__ == "__main__":
    main()
