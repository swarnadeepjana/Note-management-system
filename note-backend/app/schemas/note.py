from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.db import db
from typing import List, Literal, Optional


class NoteBase(BaseModel):
    title: str
    content: str
    tags: List[str] = []

class SharePermission(BaseModel):
    email: str
    permission: Literal["read", "write"] = "read"


class NoteCreate(NoteBase):
    sharedWith: Optional[List[SharePermission]] = []


class NoteUpdate(BaseModel):
    title: Optional[str]=None
    content: Optional[str]=None
    tags: Optional[List[str]] =None
    isArchived: Optional[bool] =None
    sharedWith: Optional[List[SharePermission]]=None


class NoteOut(NoteBase):
    id: str
    owner: str
    isArchived: bool
    sharedWith: List[str]
    createdAt: datetime
    updatedAt: datetime
