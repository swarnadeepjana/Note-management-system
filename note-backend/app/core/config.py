from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    FRONTEND_ORIGIN: str  

    class Config:
        env_file = ".env"

settings = Settings()
