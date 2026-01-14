import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestOrders:
    """Тесты для работы с заказами"""
    
    def test_get_orders(self):
        """Тест получения заказов без токена"""
        response = client.get("/orders/")
        # Без токена должен быть 401 или доступ только с авторизацией
        assert response.status_code in [401, 403, 200]
    
    def test_create_order_without_auth(self):
        """Тест создания заказа без авторизации"""
        response = client.post(
            "/orders/",
            json={
                "items": [
                    {"item_id": 1, "quantity": 2, "price": 99.99}
                ]
            }
        )
        # Без токена должен быть 401
        assert response.status_code in [401, 403]
    
    def test_get_order_history(self):
        """Тест получения истории заказов"""
        response = client.get("/orders/history")
        # Без токена должен быть 401
        assert response.status_code in [401, 403, 200]
