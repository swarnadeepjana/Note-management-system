# tests/test_auth.py
import pytest
from httpx import AsyncClient
from app.main import app
from app.db import db

@pytest.mark.asyncio
async def test_register_and_login():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Register
        response = await ac.post("/auth/register", json={
            "email": "test@example.com",
            "password": "test123"
        })
        assert response.status_code == 200

        # Login
        response = await ac.post("/auth/login", json={
            "email": "test@example.com",
            "password": "test123"
        })
        assert response.status_code == 200
        assert "access_token" in response.json()
