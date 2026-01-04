from sqlalchemy import String, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db import Base

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Связь "Один ко многим": одна категория — много ноутбуков [cite: 58]
    items: Mapped[list["Item"]] = relationship("Item", back_populates="category")

class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100), index=True) # Модель ноутбука
    description: Mapped[str] = mapped_column(Text)
    price: Mapped[float] = mapped_column(Float) # Цена должна быть > 0 [cite: 53]
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0) # Остаток на складе
    
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    category: Mapped["Category"] = relationship("Category", back_populates="items")