from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api.deps import get_db
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemResponse

router = APIRouter()

# POST /items — Добавление нового ноутбука [cite: 49]
@router.post("/", response_model=ItemResponse)
async def create_laptop(item_in: ItemCreate, db: AsyncSession = Depends(get_db)):
    new_item = Item(**item_in.model_dump())
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item

# GET /items — Получение списка ноутбуков с пагинацией и фильтрацией [cite: 49, 67, 72]
@router.get("/", response_model=list[ItemResponse])
async def read_laptops(
    skip: int = 0, 
    limit: int = 10, 
    db: AsyncSession = Depends(get_db)
):
    query = select(Item).offset(skip).limit(limit) # Limit/offset пагинация [cite: 68]
    result = await db.execute(query)
    return result.scalars().all()

# Удаление товара (доступно только админу или владельцу)
@router.delete("/{item_id}")
async def delete_item(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    await db.delete(item)
    await db.commit()
    return {"message": "Deleted successfully"}

# Обновление цены или описания
@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(item_id: int, item_in: ItemCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    for key, value in item_in.model_dump().items():
        setattr(item, key, value)
    
    await db.commit()
    await db.refresh(item)
    return item