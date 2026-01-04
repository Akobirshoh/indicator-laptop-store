from fastapi import FastAPI
from app.api.v1 import auth, items, categories
from app.core.config import settings
from app.core.logging import setup_logging

# 1. Логи
setup_logging()

# 2. Сначала СОЗДАЕМ app
app = FastAPI(title=settings.PROJECT_NAME)

# 3. Теперь ПОДКЛЮЧАЕМ роутеры к созданному app
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(items.router, prefix="/items", tags=["Laptops"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "INDICATOR"}