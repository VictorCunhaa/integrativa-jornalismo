from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

def _async_url(url: str) -> str:
    if url.startswith("mysql://"):
        return "mysql+asyncmy://" + url[len("mysql://"):]
    return url.replace("mysql+pymysql://", "mysql+asyncmy://").replace("mysql+aiomysql://", "mysql+asyncmy://")

engine = create_async_engine(_async_url(settings.DATABASE_URL), echo=False, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass
