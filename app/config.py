from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    app_name: str = "Todo API"
    database_url: str = "sqlite:///./todosapp.db"
    secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expires_minutes: int = 20


settings = Settings()
