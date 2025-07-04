import pytest
from httpx import AsyncClient
from app.main import app
from app.db import db

@pytest.mark.asyncio
async def test_analytics_endpoints():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/analytics/tags")
        assert response.status_code == 200

        response = await ac.get("/analytics/notes-daily")
        assert response.status_code == 200

        response = await ac.get("/analytics/active-users")
        assert response.status_code == 200
