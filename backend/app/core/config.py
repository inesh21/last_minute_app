import os
from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# 1. Fixed BACKEND_ROOT to resolve dynamically and safely across platforms
BACKEND_ROOT = Path(__file__).resolve().parents[2]

# 2. Cross-platform local fallback path (works on Windows, Linux, Mac)
DEFAULT_SQLITE_PATH = BACKEND_ROOT / "backend" / "last-minute-lifesaver.db"
DEFAULT_SQLITE_URL = f"sqlite+aiosqlite:///{DEFAULT_SQLITE_PATH.as_posix()}"

DEFAULT_DEV_JWT_SECRET = "dev-only-9db70016a7c84e2ba2e26af02137116d8c1f1f0fb6c34d28"


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

    jwt_secret: str = DEFAULT_DEV_JWT_SECRET
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
        
        # 3. Read extra values from local file overrides if present
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
            elif key == "DATABASE_URL" and self.database_url == DEFAULT_SQLITE_URL:
                self.database_url = value

        # 4. Check if Vercel Postgres is provisioned and override
        vercel_postgres = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL")
        if vercel_postgres and not vercel_postgres.startswith("sqlite"):
            # Swaps out standard postgres:// with async driver prefix expected by SQLAlchemy
            if vercel_postgres.startswith("postgres://"):
                vercel_postgres = vercel_postgres.replace("postgres://", "postgresql+asyncpg://", 1)
            self.database_url = vercel_postgres
            self.app_env = "production"

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
