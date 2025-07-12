import pytest
from httpx import AsyncClient
from app.main import app
from app.db import db


#it is format if i write correct..it show 200 ok
@pytest.mark.asyncio
async def test_register_and_login():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/auth/register", json={
            "email": "test@example.com",
            "password": "test123"
        })
        assert response.status_code == 200

        response = await ac.post("/auth/login", json={
            "email": "test@example.com",
            "password": "test123"
        })
        assert response.status_code == 200
        assert "access_token" in response.json()
