from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENV: str = "dev"
    DATABASE_URL: str
    CORS_ORIGINS: str = "http://localhost:5173,https://kgrubic.github.io"
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_EXPIRES_MINUTES: int = 60

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

settings = Settings()
