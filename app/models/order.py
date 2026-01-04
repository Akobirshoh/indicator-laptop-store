from sqlalchemy import Column, Integer, ForeignKey, Float, String, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum
from app.core.db import Base

class OrderStatus(enum.Enum): # Занятие 16 [cite: 87]
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class CartItem(Base): # Занятие 15 [cite: 75]
    __tablename__ = "cart_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"))
    quantity: Mapped[int] = mapped_column(default=1)

class Order(Base): # Занятие 16 [cite: 85]
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    total_price: Mapped[float] = mapped_column(Float)
    status: Mapped[OrderStatus] = mapped_column(default=OrderStatus.PENDING)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    
    items: Mapped[list["OrderItem"]] = relationship("OrderItem")

class OrderItem(Base): # Занятие 16 [cite: 86]
    __tablename__ = "order_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"))
    quantity: Mapped[int] = mapped_column()
    price_at_purchase: Mapped[float] = mapped_column() # Фиксируем цену на момент покупки