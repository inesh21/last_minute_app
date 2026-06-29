import os
from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


DEFAULT_SQLITE_PATH = Path("C:/tmp/last-minute-lifesaver.db")
DEFAULT_SQLITE_URL = f"sqlite+aiosqlite:///{DEFAULT_SQLITE_PATH.as_posix()}"
BACKEND_ROOT = Path(__file__).resolve().parents[2]


def _read_env_file() -> dict[str, str]:
    values: dict[str, str] = {}

    for env_path in [Path(os.environ.get("BACKEND_ENV_FILE", "")) if os.environ.get("BACKEND_ENV_FILE") else None, BACKEND_ROOT / ".env"]:
        if not env_path or not env_path.exists():
            continue
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip()
        break

    return values


class Settings(BaseSettings):
    app_name: str = "Last Minute Lifesaver"
    app_env: str = "local"
    database_url: str = DEFAULT_SQLITE_URL
    frontend_url: str = "http://127.0.0.1:5173"
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
    google_redirect_uri: str = "http://127.0.0.1:8000/api/auth/google/callback"

    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    scheduler_enabled: bool = Field(default=False)

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def __init__(self, **values):
        super().__init__(**values)
        env_values = _read_env_file()
        for key, value in env_values.items():
            if not value:
                continue
            if key == "GOOGLE_CLIENT_ID" and not self.google_client_id:
                self.google_client_id = value
            elif key == "GOOGLE_CLIENT_SECRET" and not self.google_client_secret:
                self.google_client_secret = value
            elif key == "GEMINI_API_KEY" and not self.gemini_api_key:
                self.gemini_api_key = value
            elif key == "FRONTEND_URL" and not self.frontend_url:
                self.frontend_url = value
            elif key == "GOOGLE_REDIRECT_URI" and not self.google_redirect_uri:
                self.google_redirect_uri = value

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
