import pytest
from pydantic import ValidationError

from app.config import Settings

KEY = "k" * 32


def test_reads_secret_key_from_environment(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", KEY)
    settings = Settings(_env_file=None)
    assert settings.secret_key == KEY


def test_missing_secret_key_is_rejected(monkeypatch):
    monkeypatch.delenv("SECRET_KEY", raising=False)
    with pytest.raises(ValidationError):
        Settings(_env_file=None)


def test_defaults_apply_when_not_set(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", KEY)
    monkeypatch.delenv("DATABASE_URL", raising=False)
    settings = Settings(_env_file=None)
    assert settings.app_name == "Todo API"
    assert settings.database_url == "sqlite:///./todosapp.db"
    assert settings.jwt_algorithm == "HS256"
    assert settings.access_token_expires_minutes == 20
    assert settings.log_level == "INFO"


def test_string_from_environment_is_converted_to_int(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", KEY)
    monkeypatch.setenv("ACCESS_TOKEN_EXPIRES_MINUTES", "45")
    settings = Settings(_env_file=None)
    assert settings.access_token_expires_minutes == 45


def test_non_numeric_minutes_are_rejected(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", KEY)
    monkeypatch.setenv("ACCESS_TOKEN_EXPIRES_MINUTES", "twenty")
    with pytest.raises(ValidationError):
        Settings(_env_file=None)


def test_env_file_is_read(tmp_path, monkeypatch):
    monkeypatch.delenv("SECRET_KEY", raising=False)
    env_file = tmp_path / ".env"
    env_file.write_text(f"SECRET_KEY={KEY}\nAPP_NAME=From File\n", encoding="utf-8")
    settings = Settings(_env_file=env_file)
    assert settings.secret_key == KEY
    assert settings.app_name == "From File"


def test_env_variable_beats_env_file(tmp_path, monkeypatch):
    monkeypatch.setenv("SECRET_KEY", KEY)
    env_file = tmp_path / ".env"
    env_file.write_text("SECRET_KEY=from-file\n", encoding="utf-8")
    settings = Settings(_env_file=env_file)
    assert settings.secret_key == KEY


@pytest.mark.parametrize("bad_value", ["twenty", "0", "-5"])
def test_invalid_minutes_are_rejected(monkeypatch, bad_value):
    monkeypatch.setenv("SECRET_KEY", KEY)
    monkeypatch.setenv("ACCESS_TOKEN_EXPIRES_MINUTES", bad_value)
    with pytest.raises(ValidationError):
        Settings(_env_file=None)


def test_unknown_log_level_is_rejected(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", KEY)
    monkeypatch.setenv("LOG_LEVEL", "LOUD")
    with pytest.raises(ValidationError):
        Settings(_env_files=None)
