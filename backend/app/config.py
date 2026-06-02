from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Local dev uses SQLite; production (Render/Railway) sets this to PostgreSQL URL
    DATABASE_URL: str = "sqlite:////tmp/inventory.db"
    SECRET_KEY: str = "changeme-secret-key"

    class Config:
        env_file = ".env"

    @property
    def database_url_fixed(self) -> str:
        """
        Render/Railway provide URLs starting with 'postgres://' but SQLAlchemy
        requires 'postgresql://'. This fixes that automatically.
        """
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url


settings = Settings()
