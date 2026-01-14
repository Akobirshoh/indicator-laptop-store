import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestItems:
    """Тесты для работы с товарами"""
    
    def test_get_items(self):
        """Тест получения списка товаров"""
        response = client.get("/items/?skip=0&limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_items_pagination(self):
        """Тест пагинации товаров"""
        response = client.get("/items/?skip=0&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5
    
    def test_search_items(self):
        """Тест поиска товаров"""
        response = client.get("/items/?search=laptop")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_filter_by_category(self):
        """Тест фильтрации по категориям"""
        response = client.get("/items/?category_id=1")
        assert response.status_code in [200, 400, 404]  # Категория может не существовать
    
    def test_get_categories(self):
        """Тест получения категорий"""
        response = client.get("/categories/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
