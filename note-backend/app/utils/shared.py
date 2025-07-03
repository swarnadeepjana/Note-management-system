# app/utils/shared.py
from fastapi import HTTPException
from app.db import db

def check_permission(note: dict, user_email: str, write: bool = False):
    if note["owner"] == user_email:
        return
    if not write and user_email in note.get("sharedWith", []):
        return
    raise HTTPException(status_code=403, detail="Permission denied")

def note_response(note):
    note["id"] = str(note["_id"])
    del note["_id"]
    return note
