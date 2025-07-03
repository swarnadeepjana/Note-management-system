# app/routes/analytics.py
from fastapi import APIRouter
from app.services.analytics_service import most_used_tags, notes_per_day, most_active_users
from app.db import db

router = APIRouter()

@router.get("/tags")
async def tags():
    return await most_used_tags()

@router.get("/notes-daily")
async def notes_by_day():
    return await notes_per_day()

@router.get("/active-users")
async def active_users():
    return await most_active_users()
