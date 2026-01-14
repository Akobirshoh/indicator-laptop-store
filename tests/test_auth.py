import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestAuthentication:
    """Тесты для аутентификации"""
    
    def test_register_user(self):
        """Тест регистрации пользователя"""
        response = client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "password": "testpass123",
                "full_name": "Test User"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data or data.get("message") == "User created"
    
    def test_login_user(self):
        """Тест входа пользователя"""
        # Сначала регистрируем
        client.post(
            "/auth/register",
            json={
                "email": "login_test@example.com",
                "password": "testpass123",
                "full_name": "Login Test"
            }
        )
        
        # Затем пытаемся войти
        response = client.post(
            "/auth/login",
            data={
                "username": "login_test@example.com",
                "password": "testpass123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
    
    def test_login_invalid_credentials(self):
        """Тест входа с неверными учетными данными"""
        response = client.post(
            "/auth/login",
            data={
                "username": "nonexistent@example.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code in [401, 400]
    
    def test_health_check(self):
        """Тест проверки здоровья приложения"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
