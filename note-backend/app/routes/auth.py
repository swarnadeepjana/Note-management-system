from fastapi import APIRouter, Depends, HTTPException
from app.schemas.user import UserCreate, UserLogin, Token
from app.services.auth_service import register_user, login_user
from app.db import db
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_access_token

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

ADMIN_EMAIL = "swarnadeep321@gmail.com"
ADMIN_PASSWORD = "123"

def get_current_user(token: str = Depends(oauth2_scheme)):
    user = decode_access_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@router.post("/register")
async def register(data: UserCreate):
    return await register_user(data.email, data.password)

@router.post("/login", response_model=Token)
async def login(data: UserLogin):
    return await login_user(data.email, data.password)
