from app.db import db

def get_user_collection():
    return db.get_collection("users")
