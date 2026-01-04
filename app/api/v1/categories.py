from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api.deps import get_db
from app.models.item import Category
from pydantic import BaseModel

router = APIRouter()

class CategoryCreate(BaseModel):
    name: str

@router.post("/")
async def create_category(cat_in: CategoryCreate, db: AsyncSession = Depends(get_db)):
    new_cat = Category(name=cat_in.name)
    db.add(new_cat)
    await db.commit()
    return new_cat

@router.get("/")
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    return result.scalars().all()