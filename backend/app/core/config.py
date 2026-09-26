from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ROOT = Path(__file__).resolve().parents[2]
_ENV_FILES = tuple(
    str(path)
    for path in (_ROOT / ".env.example", _ROOT / ".env")
    if path.is_file()
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILES or None,
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )

    app_name: str = "marketch.uz"
    app_env: str = "local"
    debug: bool = True

    database_url: str = "sqlite:///./bozor_analitika.db"

    cors_origins: str = "http://localhost:5173"

    clerk_publishable_key: str = ""

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-5"
    chat_rate_limit_per_minute: int = 10

    rec_price_weight: float = 0.5
    rec_location_weight: float = 0.3
    rec_volume_weight: float = 0.2

    openrouter_api_key: str = ""
    openrouter_model: str = "deepseek/deepseek-v4-flash"


@lru_cache
def get_settings() -> Settings:
    return Settings()
