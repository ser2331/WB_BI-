from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    database_url: str = "sqlite+aiosqlite:///./wb_bi.db"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    # Разрешает GitHub Pages (Origin: https://username.github.io)
    cors_origin_regex: str = r"https://([a-zA-Z0-9-]+\.)?github\.io"
    mock_wb: bool = False
    auto_seed_mock: bool = False

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
