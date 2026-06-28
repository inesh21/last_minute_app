from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


DEFAULT_SQLITE_PATH = Path("C:/tmp/last-minute-lifesaver.db")
DEFAULT_SQLITE_URL = f"sqlite+aiosqlite:///{DEFAULT_SQLITE_PATH.as_posix()}"


class Settings(BaseSettings):
    app_name: str = "Last Minute Lifesaver"
    app_env: str = "local"
    database_url: str = DEFAULT_SQLITE_URL
    frontend_url: str = "http://localhost:3000"
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ]
    )

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    scheduler_enabled: bool = Field(default=False)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def google_oauth_configured(self) -> bool:
        return bool(self.google_client_id and self.google_client_secret)

    @property
    def gemini_configured(self) -> bool:
        return bool(self.gemini_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
