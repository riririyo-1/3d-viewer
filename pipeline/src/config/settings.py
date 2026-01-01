
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8000
    MINIO_ENDPOINT: str = "localhost"
    MINIO_PORT: int = 9000
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "studio-view-assets"
    MINIO_SECURE: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
