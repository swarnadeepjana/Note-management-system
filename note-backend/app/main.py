from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, notes, share, analytics
from app.db import db
from app.routes import public_notes
from app.services.auth_service import ensure_admin_user
import asyncio

app = FastAPI()

#main connection between frontend and backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# route cretaion----name registration
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(notes.router, prefix="/notes", tags=["Notes"])
app.include_router(share.router, prefix="/share", tags=["Share"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(public_notes.router, prefix="/public_notes", tags=["Public_notes"])

@app.on_event("startup")
async def startup_event():
    await ensure_admin_user()

@app.get("/")
def root():
    return {"message": "Note API is running 🚀"}
