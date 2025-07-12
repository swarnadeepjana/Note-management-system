from fastapi import HTTPException
from app.models.note import get_note_collection
from datetime import datetime
from pytz import timezone
from bson import ObjectId
from app.db import db
from app.utils.shared import get_current_time
import re

notes = get_note_collection()
ADMIN_EMAIL = "swarnadeep321@gmail.com"

def note_response(note):
    note["id"] = str(note["_id"])
    del note["_id"]
    return note

async def create_note(data: dict, owner_email: str):
    now = get_current_time()

    note = {
        **data,
        "owner": owner_email,
        "sharedWith": data.get("sharedWith", []),
        "isArchived": False,
        "createdAt": now,
        "updatedAt": now
    }
    
    result = await notes.insert_one(note)
    note["_id"] = result.inserted_id
    return note_response(note)

async def get_user_notes(owner_email: str, search: str | None = None, page: int = 1, limit: int = 10):
    notes = get_note_collection()
    query = {}
    if owner_email == ADMIN_EMAIL:
        query["owner"] = owner_email
    else:
        query["owner"] = ADMIN_EMAIL
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}},
        ]
    cursor = notes.find(query).skip((page - 1) * limit).limit(limit)
    result = []
    async for note in cursor:
        note["id"] = str(note["_id"])
        del note["_id"]
        result.append(note)
    return result

async def update_note(note_id: str, data: dict, user: str):
    try:
        obj_id = ObjectId(note_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid note ID format")

    note = await notes.find_one({"_id": obj_id})
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if note["owner"] != user:
        allowed = False
        for entry in note.get("sharedWith", []):
            if entry["email"] == user and entry["permission"] == "write":
                allowed = True
                break
        if not allowed:
            raise HTTPException(status_code=403, detail="No write permission")

    allowed_fields = {"title", "content", "tags", "sharedWith", "isArchived"}
    filtered_data = {k: v for k, v in data.items() if k in allowed_fields}
    filtered_data["updatedAt"] = get_current_time()

    await notes.update_one({"_id": obj_id}, {"$set": filtered_data})
    updated = await notes.find_one({"_id": obj_id})
    return note_response(updated)

async def update_note_sharing(note_id: str, shared_with: list, user: str):
    try:
        obj_id = ObjectId(note_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid note ID format")

    note = await notes.find_one({"_id": obj_id})
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if note["owner"] != user:
        raise HTTPException(status_code=403, detail="Only owner can manage sharing")

    await notes.update_one(
        {"_id": obj_id}, 
        {"$set": {"sharedWith": shared_with, "updatedAt": get_current_time()}}
    )
    updated = await notes.find_one({"_id": obj_id})
    return note_response(updated)

async def delete_note(note_id: str, user: str):
    note = await notes.find_one({"_id": ObjectId(note_id)})
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note["owner"] != user and user != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Only owner or admin can delete")
    await notes.delete_one({"_id": ObjectId(note_id)})
    return {"msg": "Note deleted"}