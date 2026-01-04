from pydantic import BaseModel, Field
from typing import Optional

class ItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str
    price: float = Field(..., gt=0) # Валидация: цена больше 0 [cite: 53]
    category_id: int

class ItemCreate(ItemBase):
    pass # Используется при создании товара

class ItemResponse(ItemBase):
    id: int

    class Config:
        from_attributes = True # Позволяет Pydantic работать с моделями SQLAlchemy