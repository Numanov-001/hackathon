from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "marketch.uz"
    app_env: str = "local"
    debug: bool = True

    database_url: str = "sqlite:///./bozor_analitika.db"

    cors_origins: str = "http://localhost:5173"

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-5"
    chat_rate_limit_per_minute: int = 10

    rec_price_weight: float = 0.5
    rec_location_weight: float = 0.3
    rec_volume_weight: float = 0.2


@lru_cache
def get_settings() -> Settings:
    return Settings()
