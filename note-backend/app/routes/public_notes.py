from fastapi import APIRouter, HTTPException, Request
from bson import ObjectId
from app.db import db  
from app.utils.shared import note_response, get_current_time

router = APIRouter()

@router.get("/public/notes/{note_id}")
async def view_public_note(note_id: str, request: Request):
    try:
        obj_id = ObjectId(note_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    note = await db.notes.find_one({"_id": obj_id})
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    await db.note_views.insert_one({
        "noteId": str(note["_id"]),
        "ip": request.client.host if request.client else "unknown",
        "userAgent": request.headers.get("user-agent"),
        "timestamp": get_current_time()
    })

    note["id"] = str(note["_id"])
    del note["_id"]
    return note