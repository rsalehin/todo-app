import argparse
import getpass

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Role, User
from app.security import hash_password


def create_admin(db: Session, username: str, email: str, password: str) -> User:
    admin = User(
        username=username,
        email=email,
        first_name="Admin",
        last_name="User",
        hashed_password=hash_password(password),
        role=Role.ADMIN,
    )

    db.add(admin)
    try:
        db.commit()
    except IntegrityError:
        raise SystemExit(
            f"A user named '{username}' or with email '{email}' already exists."
        ) from None

    return admin


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    parser.add_argument("command", choices=["create-admin"])
    parser.add_argument("--username", required=True)
    parser.add_argument("--email", required=True)

    args = parser.parse_args(argv)
    password = getpass.getpass("Password (8-128 characters)")
    if len(password) < 8 or len(password) > 128:
        raise SystemExit("Password must be 8-128 characters.")

    with SessionLocal() as db:
        create_admin(db, args.username, args.email, password)
    print(f"Admin '{args.username}' created.")


if __name__ == "__main__":
    main()
