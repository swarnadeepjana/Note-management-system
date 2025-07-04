from fastapi import HTTPException
from app.models.note import get_note_collection
from datetime import datetime
from zoneinfo import ZoneInfo  
from pytz import timezone
from bson import ObjectId
from app.db import db

notes = get_note_collection()

IST = ZoneInfo("Asia/Kolkata")

def note_response(note):
    note["id"] = str(note["_id"])
    del note["_id"]
    return note

async def create_note(data: dict, owner_email: str):
    IST = timezone("Asia/Kolkata")
    now = datetime.now(IST)

    note = {
        **data,
        "owner": owner_email,
        "sharedWith": [],
        "isArchived": False,
        "createdAt": now,
        "updatedAt": now
    }
    
    result = await notes.insert_one(note)
    note["_id"] = result.inserted_id
    return note_response(note)

async def get_user_notes(owner_email: str):
    cursor = notes.find({
        "$or": [
            {"owner": owner_email},
            {"sharedWith": owner_email}
        ]
    })
    result = []
    async for note in cursor:
        result.append(note_response(note))
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

    allowed_fields = {"title", "content", "tags", "sharedWith"}
    filtered_data = {k: v for k, v in data.items() if k in allowed_fields}
    filtered_data["updatedAt"] = datetime.now(IST)

    await notes.update_one({"_id": obj_id}, {"$set": filtered_data})
    updated = await notes.find_one({"_id": obj_id})
    return note_response(updated)



async def delete_note(note_id: str, user: str):
    note = await notes.find_one({"_id": ObjectId(note_id)})
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note["owner"] != user:
        raise HTTPException(status_code=403, detail="Only owner can delete")
    await notes.delete_one({"_id": ObjectId(note_id)})
    return {"msg": "Note deleted"}
