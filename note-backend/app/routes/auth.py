from fastapi import APIRouter
from app.schemas.user import UserCreate, UserLogin, Token
from app.services.auth_service import register_user, login_user
from app.db import db

router = APIRouter()

@router.post("/register")
async def register(data: UserCreate):
    return await register_user(data.email, data.password)

@router.post("/login", response_model=Token)
async def login(data: UserLogin):
    return await login_user(data.email, data.password)
