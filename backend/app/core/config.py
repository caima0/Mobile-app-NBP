from functools import lru_cache
from pathlib import Path

from pydantic import Field, SecretStr
from sqlalchemy import URL
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        env_prefix="NBP_",
        extra="ignore",
    )

    app_name: str = Field(default="NBP Exchange API", min_length=1)
    app_version: str = "0.1.0"
    debug: bool = False

    db_host: str = "127.0.0.1"
    db_port: int = Field(
        default=5433,
        validation_alias="POSTGRES_PORT",
        ge=1,
        le=65535,
    )
    db_name: str = Field(validation_alias="POSTGRES_DB", min_length=1)
    db_user: str = Field(validation_alias="POSTGRES_USER", min_length=1)
    db_password: SecretStr = Field(validation_alias="POSTGRES_PASSWORD")

    @property
    def database_url(self) -> URL:
        return URL.create(
            drivername="postgresql+psycopg",
            username=self.db_user,
            password=self.db_password.get_secret_value(),
            host=self.db_host,
            port=self.db_port,
            database=self.db_name,
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
