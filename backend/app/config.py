from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+asyncmy://app:apppass@localhost:3306/redacao_escola"
    DATABASE_URL_SYNC: str = "mysql+pymysql://app:apppass@localhost:3306/redacao_escola"
    JWT_SECRET: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    STORAGE_PATH: str = "./storage/uploads"
    CORS_ORIGINS: str = "http://localhost:5173"
    MAX_IMAGE_SIZE_MB: int = 10
    MAX_VIDEO_SIZE_MB: int = 200
    MAX_AUDIO_SIZE_MB: int = 100

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    model_config = {"env_file": ".env"}


settings = Settings()
