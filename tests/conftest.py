import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.db import Base

# Используем тестовую БД
TEST_DATABASE_URL = "sqlite:///test.db"

@pytest.fixture(scope="session")
def database():
    """Создает тестовую БД и таблицы"""
    engine = create_engine(
        TEST_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    # Удаляем файл БД после тестов
    if os.path.exists("test.db"):
        os.remove("test.db")

@pytest.fixture
def db_session(database):
    """Предоставляет сессию БД для каждого теста"""
    engine = create_engine(
        TEST_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    yield session
    session.close()

@pytest.fixture
def client():
    """Предоставляет TestClient для FastAPI"""
    from fastapi.testclient import TestClient
    from app.main import app
    
    return TestClient(app)
