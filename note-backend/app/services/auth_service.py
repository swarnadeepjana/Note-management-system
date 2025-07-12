from fastapi import HTTPException
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import get_user_collection
from app.db import db

users = get_user_collection()

USER_EMAILS = [
    "swarnadeep896@gmail.com",
    "jimmycarter@gmail.com",
]

async def register_user(email: str, password: str, role: str = "user"):
    if email == "swarnadeep321@gmail.com":
        role = "admin"
    elif email in USER_EMAILS:
        role = "user"
    else:
        role = "user"
    existing = await users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed = hash_password(password)
    await users.insert_one({"email": email, "password": hashed, "role": role})
    return {"msg": "Registered successfully"}

async def login_user(email: str, password: str):
    user = await users.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if email == "swarnadeep321@gmail.com":
        user["role"] = "admin"
    elif email in USER_EMAILS:
        user["role"] = "user"
    else:
        user["role"] = user.get("role", "user")
    token = create_access_token({"sub": email, "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}

async def ensure_admin_user():
    admin_email = "swarnadeep321@gmail.com"
    admin_password = "123"
    admin_role = "admin"
    existing = await users.find_one({"email": admin_email})
    if not existing:
        hashed = hash_password(admin_password)
        await users.insert_one({"email": admin_email, "password": hashed, "role": admin_role})
