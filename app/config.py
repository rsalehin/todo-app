from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    app_name: str = "Todo API"
    database_url: str = "sqlite:///./todosapp.db"
    secret_key: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_expires_minutes: int = Field(default=20, gt=0)
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"


settings = Settings()
