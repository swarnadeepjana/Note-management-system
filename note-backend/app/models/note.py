# app/models/note.py
from app.db import db

def get_note_collection():
    return db.get_collection("notes")

