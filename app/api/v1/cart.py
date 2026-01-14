from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.api.deps import get_db, get_current_user
from app.models.order import CartItem
from app.models.item import Item

router = APIRouter()

@router.post("/") # Добавить в корзину 
async def add_to_cart(
    item_id: int = Query(...),
    db: AsyncSession = Depends(get_db), 
    user=Depends(get_current_user)
):
    """Добавить товар в корзину"""
    # Проверка: существует ли товар
    item = await db.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Товар не найден")
    
    cart_item = CartItem(user_id=user.id, item_id=item_id)
    db.add(cart_item)
    await db.commit()
    return {"message": "Товар добавлен в корзину", "item_id": item_id}

@router.get("/") # Просмотр корзины
async def view_cart(
    db: AsyncSession = Depends(get_db), 
    user=Depends(get_current_user)
):
    """Получить содержимое корзины"""
    result = await db.execute(select(CartItem).where(CartItem.user_id == user.id))
    cart_items = result.scalars().all()
    
    return {
        "total": len(cart_items),
        "items": [
            {
                "id": item.id,
                "item_id": item.item_id,
                "user_id": item.user_id
            }
            for item in cart_items
        ]
    }

@router.delete("/{item_id}") # Удалить товар из корзины
async def remove_from_cart(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    """Удалить товар из корзины"""
    result = await db.execute(
        select(CartItem).where(
            CartItem.user_id == user.id,
            CartItem.item_id == item_id
        )
    )
    cart_item = result.scalar_one_or_none()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Товар не найден в корзине")
    
    await db.delete(cart_item)
    await db.commit()
    
    return {"message": "Товар удален из корзины"}

@router.delete("/") # Очистить корзину
async def clear_cart(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    """Очистить всю корзину"""
    await db.execute(delete(CartItem).where(CartItem.user_id == user.id))
    await db.commit()
    return {"message": "Корзина очищена"}