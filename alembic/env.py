# 1. Добавьте импорты в начало файла
from app.core.db import Base
from app.models.item import Item, Category
from app.models.user import User

# 2. Найдите строку target_metadata и замените её
target_metadata = Base.metadata