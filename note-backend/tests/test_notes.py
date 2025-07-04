import pytest
from httpx import AsyncClient
from app.main import app
from app.db import db

@pytest.mark.asyncio
async def test_note_crud():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Login to get token
        login = await ac.post("/auth/login", json={
            "email": "test@example.com",
            "password": "test123"
        })
        token = login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        note = await ac.post("/notes/", json={
            "title": "Test Note",
            "content": "This is a test.",
            "tags": ["test", "note"]
        }, headers=headers)
        assert note.status_code == 200
        note_id = note.json()["id"]

        update = await ac.put(f"/notes/{note_id}", json={
            "title": "Updated Title"
        }, headers=headers)
        assert update.status_code == 200

        delete = await ac.delete(f"/notes/{note_id}", headers=headers)
        assert delete.status_code == 200
