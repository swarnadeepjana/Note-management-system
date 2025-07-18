from fastapi import APIRouter, Depends, HTTPException, Query
from app.services.notes_service import create_note, get_user_notes, update_note, delete_note, update_note_sharing
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

ADMIN_EMAIL = "swarnadeep321@gmail.com"

def is_admin(user_email: str):
    return user_email == ADMIN_EMAIL

@router.get("/public/notes/{note_id}")
async def public_note_view(note_id: str):
    try:
        _id = ObjectId(note_id)
        notes = get_note_collection()
        note = await notes.find_one({"_id": _id})
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
    if not is_admin(user):
        raise HTTPException(status_code=403, detail="Only admin can create notes")
    return await create_note(data.dict(), user)

@router.get("/")
async def get_notes(
    user: str = Depends(get_current_user),
    search: str | None = Query(None, description="Search in title, content, or tags"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page")
):
    return await get_user_notes(user, search, page, limit)

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
    if not is_admin(user):
        raise HTTPException(status_code=403, detail="Only admin can edit notes")
    result = await update_note(note_id, data.dict(exclude_unset=True), user)
    if not result:
        raise HTTPException(status_code=404, detail="Note not found or access denied")
    return result

@router.put("/{note_id}/share")
async def update_sharing(note_id: str, sharedWith: List[SharePermission], user: str = Depends(get_current_user)):
    shared_data = [s.dict() for s in sharedWith]
    result = await update_note_sharing(note_id, shared_data, user)
    if not result:
        raise HTTPException(status_code=404, detail="Note not found or access denied")
    return result

@router.get("/{note_id}/share")
async def get_sharing(note_id: str, user: str = Depends(get_current_user)):
    notes = get_note_collection()
    try:
        _id = ObjectId(note_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid note ID format")

    note = await notes.find_one({"_id": _id})
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if note["owner"] != user:
        raise HTTPException(status_code=403, detail="Only owner can view sharing settings")

    return {"sharedWith": note.get("sharedWith", [])}

@router.delete("/{note_id}")
async def delete(note_id: str, user: str = Depends(get_current_user)):
    result = await delete_note(note_id, user)
    if not result:
        raise HTTPException(status_code=404, detail="Note not found or access denied")
    return {"message": "Note deleted"}