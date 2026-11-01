from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import engine, get_db


def test_engine_can_run_a_query():
    with engine.connect() as connection:
        assert connection.execute(text("SELECT 1")).scalar_one() == 1


def test_sqlite_foreign_keys_are_enforced():
    with engine.connect() as connection:
        assert connection.execute(text("PRAGMA foreign_keys")).scalar_one() == 1


def test_get_db_yields_a_session_and_closes_it():
    generator = get_db()
    db = next(generator)
    assert isinstance(db, Session)
    db.execute(text("SELECT 1"))
    assert db.in_transaction()
    generator.close()
    assert not db.in_transaction()
