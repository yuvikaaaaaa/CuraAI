from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@db:5432/medicine_db"
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"
    SECRET_KEY: str = "changeme-secret-key-at-least-32-characters-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    FRONTEND_URL: str = "http://localhost:3000"
    ADMIN_EMAILS: str = "admin@example.com"
    APP_ENV: str = "development"

    class Config:
        env_file = ".env"

    @property
    def admin_email_list(self):
        return [e.strip() for e in self.ADMIN_EMAILS.split(",")]


settings = Settings()