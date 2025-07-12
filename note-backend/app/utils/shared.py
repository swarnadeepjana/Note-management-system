from fastapi import HTTPException
from datetime import datetime
from pytz import timezone

# Use consistent timezone for Asia/Kolkata
IST = timezone("Asia/Kolkata")

def get_current_time():
    """Get current time in Asia/Kolkata timezone"""
    return datetime.now(IST)

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
