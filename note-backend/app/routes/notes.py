from fastapi import APIRouter, Depends, HTTPException
from app.services.notes_service import create_note, get_user_notes, update_note, delete_note
from app.schemas.note import NoteCreate, NoteUpdate
from app.core.security import decode_access_token
from fastapi.security import OAuth2PasswordBearer
from typing import List
from app.schemas.note import SharePermission
from bson import ObjectId
from bson.errors import InvalidId
from app.models.note import get_note_collection
from fastapi.responses import JSONResponse
import socket
from datetime import datetime


router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    user = decode_access_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@router.get("/public/notes/{note_id}")
async def public_note_view(note_id: str):
    try:
        _id = ObjectId(note_id)
        note = await note.find_one({"_id": _id})
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")

        return {
            "title": note.get("title", ""),
            "content": note.get("content", ""),
            "createdAt": note.get("createdAt"),
            "updatedAt": note.get("updatedAt")
        }
    except:
        raise HTTPException(status_code=400, detail="Invalid note ID format")



@router.post("/")
async def create(data: NoteCreate, user: str = Depends(get_current_user)):
    return await create_note(data.dict(), user)

@router.get("/", response_model=List[dict])
async def get_notes(user: str = Depends(get_current_user)):
    return await get_user_notes(user)

# app/routes/notes.py
@router.get("/{note_id}")
async def get_single_note(note_id: str, user: str = Depends(get_current_user)):
    notes = get_note_collection()

    try:
        _id = ObjectId(note_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid note ID format")

    note = await notes.find_one({"_id": _id})
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if note["owner"] != user:
        allowed = any(
            entry["email"] == user for entry in note.get("sharedWith", [])
        )
        if not allowed:
            raise HTTPException(status_code=403, detail="You do not have permission to view this note")

    note["id"] = str(note["_id"])
    del note["_id"]
    return note
    



@router.put("/{note_id}")
async def update(note_id: str, data: NoteUpdate, user: str = Depends(get_current_user)):
    result = await update_note(note_id, data.dict(exclude_unset=True), user)
    if not result:
        raise HTTPException(status_code=404, detail="Note not found or access denied")
    return result


@router.put("/{note_id}/share")
async def update_sharing(note_id: str, sharedWith: List[SharePermission], user: str = Depends(get_current_user)):
    # Call update_note with just sharedWith
    return await update_note(note_id, {"sharedWith": [s.dict() for s in sharedWith]}, user)

@router.delete("/{note_id}")
async def delete(note_id: str, user: str = Depends(get_current_user)):
    result = await delete_note(note_id, user)
    if not result:
        raise HTTPException(status_code=404, detail="Note not found or access denied")
    return {"message": "Note deleted"}
