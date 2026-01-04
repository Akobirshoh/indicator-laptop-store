from fastapi import BackgroundTasks

def send_order_email(email: str, order_id: int):
    # Имитация отправки email 
    print(f"Письмо отправлено на {email} по заказу №{order_id}")

@router.post("/checkout")
async def checkout(background_tasks: BackgroundTasks, user=Depends(get_current_user)):
    # ... логика создания заказа ...
    background_tasks.add_task(send_order_email, user.email, new_order.id) [cite: 185]
    return {"msg": "Заказ принят, уведомление отправлено"}

@router.post("/checkout") # Создание заказа [cite: 88]
async def checkout(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    # 1. Получаем все товары из корзины [cite: 91]
    cart_items_query = await db.execute(select(CartItem).where(CartItem.user_id == user.id))
    cart_items = cart_items_query.scalars().all()
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Корзина пуста")
    
    total = 0
    # Здесь должна быть логика расчета цены каждого товара...
    
    # 2. Создаем заказ [cite: 85]
    new_order = Order(user_id=user.id, total_price=total)
    db.add(new_order)
    
    # 3. Очищаем корзину после покупки [cite: 91]
    await db.execute(delete(CartItem).where(CartItem.user_id == user.id))
    await db.commit()
    
    return {"message": "Заказ оформлен", "order_id": new_order.id}