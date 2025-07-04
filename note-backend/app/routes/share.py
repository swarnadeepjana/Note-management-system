from fastapi import APIRouter, Depends, HTTPException
from app.models.note import get_note_collection
from app.core.security import decode_access_token
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from app.db import db

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="Auth/Login")
notes = get_note_collection()

def get_current_user(token: str = Depends(oauth2_scheme)):
    user = decode_access_token(token)
    if not user:
        raise Exception("Invalid token")
    return user

@router.post("/{note_id}")
async def share_note(note_id: str, payload: dict, user: str = Depends(get_current_user)):
    note = await notes.find_one({"_id": ObjectId(note_id)})
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note["owner"] != user:
        raise HTTPException(status_code=403, detail="Only owner can share")

    new_shared = payload.get("sharedWith", [])
    await notes.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": {"sharedWith": new_shared}}
    )
    return {"msg": "Sharing updated"}
