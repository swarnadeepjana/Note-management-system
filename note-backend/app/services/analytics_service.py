from app.models.note import get_note_collection
from datetime import datetime, timedelta
from collections import Counter, defaultdict
from app.db import db
from app.utils.shared import get_current_time

notes = get_note_collection()

# Define the specific users to track
TRACKED_USERS = ["swarnadeep896@gmail.com", "jimmycarter@gmail.com", "willphilips364@yahoo.com"]

async def most_used_tags():
    tag_counter = Counter()
    async for note in notes.find({}):
        tag_counter.update(note.get("tags", []))
    
    # Return top 5 tags with count
    top_tags = tag_counter.most_common(5)
    return [{"tag": tag, "count": count} for tag, count in top_tags]

async def notes_per_day():
    today = get_current_time()
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
    
    # Format the result to match frontend expectations
    formatted_result = []
    for item in result:
        formatted_result.append({
            "date": item["_id"],
            "count": item["count"]
        })
    
    return formatted_result

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
    
    formatted_result = []
    for item in result:
        formatted_result.append({
            "email": item["_id"],
            "note_count": item["count"]
        })
    
    return formatted_result

async def get_user_login_logout_activity():
    """Get detailed login/logout activity for tracked users"""
    analytics = db.get_collection("analytics")
    
    # Get all login/logout events from the last 30 days for tracked users only
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    pipeline = [
        {
            "$match": {
                "event": {"$in": ["login", "logout"]},
                "email": {"$in": TRACKED_USERS},
                "timestamp": {"$gte": thirty_days_ago}
            }
        },
        {
            "$sort": {"timestamp": 1}
        }
    ]
    
    events = await analytics.aggregate(pipeline).to_list(length=1000)
    
    # If no events found, return empty data for tracked users
    if not events:
        return {
            email: {
                "total_sessions": 0,
                "total_time_seconds": 0,
                "total_time_formatted": "0s",
                "login_count": 0,
                "logout_count": 0,
                "avg_session_duration": 0,
                "last_activity": None
            } for email in TRACKED_USERS
        }
    
    # Group events by user
    user_sessions = defaultdict(list)
    for event in events:
        user_sessions[event["email"]].append({
            "event": event["event"],
            "timestamp": event["timestamp"]
        })
    
    # Calculate session durations and activity metrics
    user_activity = {}
    for email in TRACKED_USERS:
        events = user_sessions.get(email, [])
        total_sessions = 0
        total_time = 0
        login_count = 0
        logout_count = 0
        last_login = None
        
        for event in events:
            if event["event"] == "login":
                login_count += 1
                last_login = event["timestamp"]
            elif event["event"] == "logout" and last_login:
                logout_count += 1
                total_sessions += 1
                session_duration = (event["timestamp"] - last_login).total_seconds()
                total_time += session_duration
                last_login = None
        
        # Handle case where user is still logged in
        if last_login:
            login_count += 1
            total_sessions += 1
            current_session_duration = (datetime.utcnow() - last_login).total_seconds()
            total_time += current_session_duration
        
        user_activity[email] = {
            "total_sessions": total_sessions,
            "total_time_seconds": total_time,
            "total_time_formatted": format_time(total_time),
            "login_count": login_count,
            "logout_count": logout_count,
            "avg_session_duration": total_time / total_sessions if total_sessions > 0 else 0,
            "last_activity": events[-1]["timestamp"] if events else None
        }
    
    return user_activity

async def get_user_study_activity():
    """Get study time activity for tracked users"""
    analytics = db.get_collection("analytics")
    
    # Get all study time events from the last 30 days for tracked users only
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    pipeline = [
        {
            "$match": {
                "timeSpent": {"$exists": True, "$ne": None},
                "email": {"$in": TRACKED_USERS},
                "timestamp": {"$gte": thirty_days_ago}
            }
        },
        {
            "$group": {
                "_id": "$email",
                "total_study_time": {"$sum": "$timeSpent"},
                "study_sessions": {"$sum": 1},
                "pages_visited": {"$addToSet": "$page"}
            }
        }
    ]
    
    result = await analytics.aggregate(pipeline).to_list(length=100)
    
    study_activity = {}
    for email in TRACKED_USERS:
        # Find data for this user
        user_data = next((item for item in result if item["_id"] == email), None)
        
        if user_data:
            study_activity[email] = {
                "total_study_time": user_data["total_study_time"],
                "total_study_time_formatted": format_time(user_data["total_study_time"]),
                "study_sessions": user_data["study_sessions"],
                "pages_visited": len(user_data["pages_visited"]),
                "avg_session_time": user_data["total_study_time"] / user_data["study_sessions"] if user_data["study_sessions"] > 0 else 0
            }
        else:
            study_activity[email] = {
                "total_study_time": 0,
                "total_study_time_formatted": "0s",
                "study_sessions": 0,
                "pages_visited": 0,
                "avg_session_time": 0
            }
    
    return study_activity

async def get_daily_activity_summary():
    """Get daily activity summary for tracked users in the last 7 days"""
    analytics = db.get_collection("analytics")
    
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    pipeline = [
        {
            "$match": {
                "email": {"$in": TRACKED_USERS},
                "timestamp": {"$gte": seven_days_ago}
            }
        },
        {
            "$group": {
                "_id": {
                    "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                    "event": {"$ifNull": ["$event", "study"]}
                },
                "count": {"$sum": 1}
            }
        },
        {
            "$sort": {"_id.date": 1}
        }
    ]
    
    result = await analytics.aggregate(pipeline).to_list(length=100)
    
    # Organize by date
    daily_activity = defaultdict(lambda: {"logins": 0, "logouts": 0, "study_sessions": 0})
    
    for item in result:
        date = item["_id"]["date"]
        event = item["_id"]["event"]
        count = item["count"]
        
        if event == "login":
            daily_activity[date]["logins"] = count
        elif event == "logout":
            daily_activity[date]["logouts"] = count
        else:
            daily_activity[date]["study_sessions"] += count
    
    return dict(daily_activity)

async def get_most_active_user_chart():
    """Get data for most active user bar chart based on total session time"""
    analytics = db.get_collection("analytics")
    
    # Get all login/logout events for tracked users from the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    pipeline = [
        {
            "$match": {
                "event": {"$in": ["login", "logout"]},
                "email": {"$in": TRACKED_USERS},
                "timestamp": {"$gte": thirty_days_ago}
            }
        },
        {
            "$sort": {"timestamp": 1}
        }
    ]
    
    events = await analytics.aggregate(pipeline).to_list(length=1000)
    
    # Calculate total session time for each user
    user_total_time = defaultdict(float)
    user_sessions = defaultdict(list)
    
    for event in events:
        user_sessions[event["email"]].append({
            "event": event["event"],
            "timestamp": event["timestamp"]
        })
    
    for email in TRACKED_USERS:
        events = user_sessions.get(email, [])
        total_time = 0
        last_login = None
        
        for event in events:
            if event["event"] == "login":
                last_login = event["timestamp"]
            elif event["event"] == "logout" and last_login:
                session_duration = (event["timestamp"] - last_login).total_seconds()
                total_time += session_duration
                last_login = None
        
        # Handle case where user is still logged in
        if last_login:
            current_session_duration = (datetime.utcnow() - last_login).total_seconds()
            total_time += current_session_duration
        
        user_total_time[email] = total_time
    
    # Format for chart
    chart_data = {
        "labels": list(user_total_time.keys()),
        "data": list(user_total_time.values()),
        "formatted_data": [format_time(time) for time in user_total_time.values()]
    }
    
    return chart_data

def format_time(seconds):
    """Format seconds into human readable time"""
    if seconds < 60:
        return f"{int(seconds)}s"
    elif seconds < 3600:
        minutes = int(seconds // 60)
        remaining_seconds = int(seconds % 60)
        return f"{minutes}m {remaining_seconds}s"
    else:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        return f"{hours}h {minutes}m"
