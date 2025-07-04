from fastapi import HTTPException
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import get_user_collection
from app.db import db

users = get_user_collection()

async def register_user(email: str, password: str):
    existing = await users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed = hash_password(password)
    await users.insert_one({"email": email, "password": hashed})
    return {"msg": "Registered successfully"}

async def login_user(email: str, password: str):
    user = await users.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": email})
    return {"access_token": token, "token_type": "bearer"}
