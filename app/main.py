from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import asyncio

# Импорты моделей (ОБЯЗАТЕЛЬНО для создания таблиц)
from app.models.item import Item
from app.models.user import User
from app.models.order import Order

# Импорты проекта
from app.api.v1 import auth, items, categories, cart, orders
from app.core.config import settings
from app.core.db import Base, engine 

app = FastAPI(title=settings.PROJECT_NAME)

# Автоматическое создание таблиц
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("startup")
async def startup_event():
    # Пропускаем создание таблиц - используем SQLite
    pass
    # await create_tables()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры (убрали лишние префиксы для совместимости с твоим фронтом)
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(items.router, prefix="/items", tags=["Items"])
app.include_router(cart.router, prefix="/cart", tags=["Cart"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Раздача фронтенда (важно: папка frontend/public)
app.mount("/", StaticFiles(directory="frontend/public", html=True), name="frontend")