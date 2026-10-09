"""Application settings, loaded from environment variables (and `.env` files locally)."""

from enum import StrEnum
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Self

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict
from sqlalchemy.engine import URL, make_url

API_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = API_ROOT.parent.parent


class Environment(StrEnum):
    DEVELOPMENT = "development"
    TEST = "test"
    PRODUCTION = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Later files take precedence; missing files are ignored. In Docker,
        # values come from the container environment instead.
        env_file=(REPO_ROOT / ".env", API_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: Environment = Environment.DEVELOPMENT
    project_name: str = "Dekorfix API"
    api_v1_prefix: str = "/api/v1"

    # Either DATABASE_URL, or the individual POSTGRES_* parts.
    database_url: str | None = None
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "dekorfix"
    postgres_user: str = "dekorfix"
    postgres_password: str = ""
    database_echo: bool = False

    # Uploaded files (product images), served at /media. A volume in Docker.
    media_root: Path = API_ROOT / "media"

    # Comma-separated in the environment, e.g. "http://localhost:3000,https://dekorfix.net".
    cors_origins: Annotated[list[str], NoDecode] = []

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip().rstrip("/") for origin in value.split(",") if origin.strip()]
        return value

    @model_validator(mode="after")
    def _check_production_safety(self) -> Self:
        if self.environment is Environment.PRODUCTION:
            if "*" in self.cors_origins:
                raise ValueError("CORS_ORIGINS must list explicit origins in production.")
            if not self.database_url and not self.postgres_password:
                raise ValueError("Database credentials must be configured in production.")
        return self

    @property
    def is_production(self) -> bool:
        return self.environment is Environment.PRODUCTION

    @property
    def sqlalchemy_database_url(self) -> URL:
        if self.database_url:
            url = make_url(self.database_url)
            # Hosting providers often hand out plain `postgres://` / `postgresql://` URLs.
            if url.drivername in {"postgres", "postgresql"}:
                url = url.set(drivername="postgresql+psycopg")
            return url
        return URL.create(
            drivername="postgresql+psycopg",
            username=self.postgres_user,
            password=self.postgres_password,
            host=self.postgres_host,
            port=self.postgres_port,
            database=self.postgres_db,
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
