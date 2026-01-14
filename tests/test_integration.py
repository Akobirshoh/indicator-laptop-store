"""
Интеграционные тесты для полного flow приложения
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestIntegration:
    """Интеграционные тесты"""
    
    def test_full_user_flow(self):
        """Тест полного flow пользователя: регистрация → вход → просмотр товаров"""
        
        # 1. Регистрация
        register_response = client.post(
            "/auth/register",
            json={
                "email": "integration@test.com",
                "password": "test123456",
                "full_name": "Integration Test User"
            }
        )
        assert register_response.status_code == 200
        
        # 2. Вход
        login_response = client.post(
            "/auth/login",
            data={
                "username": "integration@test.com",
                "password": "test123456"
            }
        )
        assert login_response.status_code == 200
        token = login_response.json().get("access_token")
        assert token is not None
        
        # 3. Просмотр товаров
        items_response = client.get(
            "/items/?skip=0&limit=10",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert items_response.status_code == 200
        
        # 4. Просмотр категорий
        categories_response = client.get(
            "/categories/",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert categories_response.status_code == 200
    
    def test_api_endpoints_available(self):
        """Тест доступности всех основных эндпоинтов"""
        endpoints = [
            ("/health", "GET"),
            ("/items/", "GET"),
            ("/categories/", "GET"),
        ]
        
        for endpoint, method in endpoints:
            if method == "GET":
                response = client.get(endpoint)
                assert response.status_code in [200, 401, 404]
    
    def test_error_handling(self):
        """Тест обработки ошибок"""
        
        # Несуществующий товар
        response = client.get("/items/99999")
        assert response.status_code in [404, 400]
        
        # Неверный формат запроса
        response = client.post(
            "/auth/login",
            data={
                "username": "test",
                # пароль отсутствует
            }
        )
        assert response.status_code in [422, 400, 401]
