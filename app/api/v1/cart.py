from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.api.deps import get_db, get_current_user
from app.models.order import CartItem
from app.models.item import Item

router = APIRouter()

@router.post("/add/{item_id}") # Добавить в корзину 
async def add_to_cart(
    item_id: int, 
    db: AsyncSession = Depends(get_db), 
    user=Depends(get_current_user)
):
    # Проверка: существует ли такой ноутбук [cite: 81]
    item = await db.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Ноутбук не найден")
    
    cart_item = CartItem(user_id=user.id, item_id=item_id)
    db.add(cart_item)
    await db.commit()
    return {"message": "Товар в корзине"}

@router.get("/") # Просмотр корзины [cite: 78]
async def view_cart(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(CartItem).where(CartItem.user_id == user.id))
    return result.scalars().all()