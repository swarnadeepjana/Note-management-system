from app.models.note import get_note_collection
from datetime import datetime, timedelta
from collections import Counter
from app.db import db

notes = get_note_collection()

async def most_used_tags():
    tag_counter = Counter()
    async for note in notes.find({}):
        tag_counter.update(note.get("tags", []))
    return tag_counter.most_common(5)

async def notes_per_day():
    today = datetime.utcnow()
    start = today - timedelta(days=6)
    pipeline = [
        {
            "$match": {
                "createdAt": {"$gte": start}
            }
        },
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    result = await notes.aggregate(pipeline).to_list(length=100)
    return result

async def most_active_users():
    pipeline = [
        {
            "$group": {
                "_id": "$owner",
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    result = await notes.aggregate(pipeline).to_list(length=5)
    return result
