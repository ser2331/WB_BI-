from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _strip_env_value(value: object) -> object:
    if not isinstance(value, str):
        return value
    cleaned = value.strip()
    if len(cleaned) >= 2 and cleaned[0] == cleaned[-1] and cleaned[0] in ('"', "'"):
        return cleaned[1:-1]
    return cleaned


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    # Разрешает GitHub Pages (Origin: https://username.github.io)
    cors_origin_regex: str = r"https://([a-zA-Z0-9-]+\.)?github\.io"

    jwt_secret: str = "change-me-in-production"
    jwt_expire_minutes: int = 60 * 24 * 7
    admin_username: str = "admin"
    admin_password: str = "admin"
    user_username: str = "user"
    user_password: str = "user"

    @field_validator(
        "jwt_secret",
        "admin_username",
        "admin_password",
        "user_username",
        "user_password",
        mode="before",
    )
    @classmethod
    def normalize_env_string(cls, value: object) -> object:
        return _strip_env_value(value)

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
