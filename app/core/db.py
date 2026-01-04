from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Создаем движок (Занятие 3)
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# Настраиваем фабрику сессий (Занятие 3)
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Базовый класс для моделей (Занятие 4)
class Base(DeclarativeBase):
    pass