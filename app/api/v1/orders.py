from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.models.order import Order, OrderItem, CartItem
from app.models.item import Item
from app.models.user import User

router = APIRouter()

# ===== PYDANTIC SCHEMAS =====

class OrderItemCreate(BaseModel):
    item_id: int
    quantity: int
    price: float

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    total_price: float
    delivery_address: str
    delivery_phone: str
    status: Optional[str] = "pending"

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_price: float
    delivery_address: str
    delivery_phone: str
    status: str
    
    class Config:
        from_attributes = True

# ===== ORDER ENDPOINTS =====

@router.post("/")
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Создать новый заказ"""
    
    if not order_data.items:
        raise HTTPException(status_code=400, detail="Заказ должен содержать товары")
    
    if not order_data.delivery_address or not order_data.delivery_phone:
        raise HTTPException(status_code=400, detail="Требуется адрес доставки и телефон")
    
    try:
        # Создаем заказ
        new_order = Order(
            user_id=user.id,
            total_price=order_data.total_price,
            delivery_address=order_data.delivery_address,
            delivery_phone=order_data.delivery_phone,
            status=order_data.status or "pending"
        )
        db.add(new_order)
        await db.flush()  # Получить ID заказа
        
        # Добавляем товары в заказ
        for item_data in order_data.items:
            order_item = OrderItem(
                order_id=new_order.id,
                item_id=item_data.item_id,
                quantity=item_data.quantity,
                price=item_data.price
            )
            db.add(order_item)
        
        # Очищаем корзину пользователя
        await db.execute(delete(CartItem).where(CartItem.user_id == user.id))
        
        await db.commit()
        
        return {
            "message": "Заказ успешно создан",
            "order_id": new_order.id,
            "status": "success"
        }
    
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка создания заказа: {str(e)}")

@router.get("/")
async def get_user_orders(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Получить все заказы пользователя"""
    
    result = await db.execute(
        select(Order).where(Order.user_id == user.id)
    )
    orders = result.scalars().all()
    
    return [
        {
            "id": order.id,
            "user_id": order.user_id,
            "total_price": order.total_price,
            "delivery_address": order.delivery_address,
            "delivery_phone": order.delivery_phone,
            "status": order.status
        }
        for order in orders
    ]

@router.get("/{order_id}")
async def get_order_detail(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Получить детали конкретного заказа"""
    
    order = await db.get(Order, order_id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    if order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    
    # Получаем товары из заказа
    result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order_id)
    )
    items = result.scalars().all()
    
    return {
        "id": order.id,
        "user_id": order.user_id,
        "total_price": order.total_price,
        "delivery_address": order.delivery_address,
        "delivery_phone": order.delivery_phone,
        "status": order.status,
        "items": [
            {
                "item_id": item.item_id,
                "quantity": item.quantity,
                "price": item.price
            }
            for item in items
        ]
    }

@router.get("/history/all")
async def get_order_history(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Получить историю заказов пользователя"""
    
    result = await db.execute(
        select(Order).where(Order.user_id == user.id).order_by(Order.id.desc())
    )
    orders = result.scalars().all()
    
    return {
        "total": len(orders),
        "orders": [
            {
                "id": order.id,
                "total_price": order.total_price,
                "status": order.status,
                "address": order.delivery_address
            }
            for order in orders
        ]
    }