import pytest
from pydantic import ValidationError

from app.config import Settings


def test_reads_secret_key_from_environment(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "abc123")
    settings = Settings(_env_file=None)
    assert settings.secret_key == "abc123"


def test_missing_secret_key_is_rejected(monkeypatch):
    monkeypatch.delenv("SECRET_KEY", raising=False)
    with pytest.raises(ValidationError):
        Settings(_env_file=None)


def test_defaults_apply_when_not_set(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "abc123")
    settings = Settings(_env_file=None)
    assert settings.app_name == "Todo API"
    assert settings.database_url == "sqlite:///./todosapp.db"
    assert settings.jwt_algorithm == "HS256"
    assert settings.access_token_expires_minutes == 20


def test_string_from_environment_is_converted_to_int(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "abc123")
    monkeypatch.setenv("ACCESS_TOKEN_EXPIRES_MINUTES", "45")
    settings = Settings(_env_file=None)
    assert settings.access_token_expires_minutes == 45


def test_non_numeric_minutes_are_rejected(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "abc123")
    monkeypatch.setenv("ACCESS_TOKEN_EXPIRES_MINUTES", "twenty")
    with pytest.raises(ValidationError):
        Settings(_env_file=None)


def test_env_file_is_read(tmp_path, monkeypatch):
    monkeypatch.delenv("SECRET_KEY", raising=False)
    env_file = tmp_path / ".env"
    env_file.write_text("SECRET_KEY=from-file\nAPP_NAME=From File\n", encoding="utf-8")
    settings = Settings(_env_file=env_file)
    assert settings.secret_key == "from-file"
    assert settings.app_name == "From File"


def test_env_variable_beats_env_file(tmp_path, monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "from-env")
    env_file = tmp_path / ".env"
    env_file.write_text("SECRET_KEY=from-file\n", encoding="utf-8")
    settings = Settings(_env_file=env_file)
    assert settings.secret_key == "from-env"
