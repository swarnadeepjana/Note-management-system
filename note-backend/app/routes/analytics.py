from fastapi import APIRouter, Depends, HTTPException, Request
from app.services.analytics_service import (
    most_used_tags, 
    notes_per_day, 
    most_active_users,
    get_user_login_logout_activity,
    get_user_study_activity,
    get_daily_activity_summary,
    get_most_active_user_chart
)
from app.core.security import decode_access_token
from fastapi.security import OAuth2PasswordBearer
from app.db import db
from datetime import datetime
from collections import defaultdict

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    user = decode_access_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@router.get("/")
async def get_analytics(user: str = Depends(get_current_user)):
    """Get all analytics data for dashboard"""
    try:
        top_tags = await most_used_tags()
        notes_daily = await notes_per_day()
        active_users = await most_active_users()
        
        # Add new analytics for admin
        if user == "swarnadeep321@gmail.com":
            login_logout_activity = await get_user_login_logout_activity()
            study_activity = await get_user_study_activity()
            daily_activity = await get_daily_activity_summary()
            most_active_chart = await get_most_active_user_chart()
            
            return {
                "top_tags": top_tags,
                "notes_per_day": notes_daily,
                "top_users": active_users,
                "login_logout_activity": login_logout_activity,
                "study_activity": study_activity,
                "daily_activity": daily_activity,
                "most_active_chart": most_active_chart
            }
        else:
            return {
                "top_tags": top_tags,
                "notes_per_day": notes_daily,
                "top_users": active_users
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")

@router.get("/tags")
async def tags(user: str = Depends(get_current_user)):
    return await most_used_tags()

@router.get("/notes-daily")
async def notes_by_day(user: str = Depends(get_current_user)):
    return await notes_per_day()

@router.get("/active-users")
async def active_users(user: str = Depends(get_current_user)):
    return await most_active_users()

@router.post("/track")
async def track_analytics(data: dict):
    analytics = db.get_collection("analytics")
    await analytics.insert_one({
        "email": data.get("email"),
        "timeSpent": data.get("timeSpent"),
        "page": data.get("page"),
        "timestamp": datetime.utcnow()
    })
    return {"msg": "Tracked"}

@router.post("/track-login")
async def track_login(data: dict):
    analytics = db.get_collection("analytics")
    await analytics.insert_one({
        "email": data.get("email"),
        "event": "login",
        "timestamp": datetime.utcnow()
    })
    return {"msg": "Login tracked"}

@router.post("/track-logout")
async def track_logout(data: dict):
    analytics = db.get_collection("analytics")
    await analytics.insert_one({
        "email": data.get("email"),
        "event": "logout",
        "timestamp": datetime.utcnow()
    })
    return {"msg": "Logout tracked"}

@router.get("/user-activity")
async def get_user_activity(user: str = Depends(get_current_user)):
    if user != "swarnadeep321@gmail.com":
        raise HTTPException(status_code=403, detail="Only admin can view analytics")
    analytics = db.get_collection("analytics")
    data = await analytics.find().sort("timestamp", -1).to_list(200)
    for entry in data:
        entry["id"] = str(entry["_id"])
        del entry["_id"]
    return data

@router.get("/my-activity")
async def get_my_activity(user: str = Depends(get_current_user)):
    if user == "swarnadeep321@gmail.com":
        return []
    analytics = db.get_collection("analytics")
    data = await analytics.find({"email": user}).sort("timestamp", -1).to_list(100)
    for entry in data:
        entry["id"] = str(entry["_id"])
        del entry["_id"]
    return data

@router.get("/user-login-logout-activity")
async def user_login_logout_activity(user: str = Depends(get_current_user)):
    """Get detailed login/logout activity for tracked users (admin only)"""
    if user != "swarnadeep321@gmail.com":
        raise HTTPException(status_code=403, detail="Only admin can view user activity")
    return await get_user_login_logout_activity()

@router.get("/user-study-activity")
async def user_study_activity(user: str = Depends(get_current_user)):
    """Get study activity for tracked users (admin only)"""
    if user != "swarnadeep321@gmail.com":
        raise HTTPException(status_code=403, detail="Only admin can view study activity")
    return await get_user_study_activity()

@router.get("/daily-activity-summary")
async def daily_activity_summary(user: str = Depends(get_current_user)):
    """Get daily activity summary for tracked users (admin only)"""
    if user != "swarnadeep321@gmail.com":
        raise HTTPException(status_code=403, detail="Only admin can view daily activity")
    return await get_daily_activity_summary()

@router.get("/most-active-user-chart")
async def most_active_user_chart(user: str = Depends(get_current_user)):
    """Get most active user chart data (admin only)"""
    if user != "swarnadeep321@gmail.com":
        raise HTTPException(status_code=403, detail="Only admin can view most active user data")
    return await get_most_active_user_chart()

@router.get("/session-durations")
async def session_durations(user: str = Depends(get_current_user)):
    if user != "swarnadeep321@gmail.com":
        raise HTTPException(status_code=403, detail="Only admin can view session durations")
    analytics = db.get_collection("analytics")
    data = await analytics.find({"event": {"$in": ["login", "logout"]}}).sort("timestamp", 1).to_list(1000)
    sessions = defaultdict(list)
    for entry in data:
        sessions[entry["email"]].append(entry)
    user_durations = {}
    for email, events in sessions.items():
        total = 0
        login_time = None
        for event in events:
            if event["event"] == "login":
                login_time = event["timestamp"]
            elif event["event"] == "logout" and login_time:
                total += (event["timestamp"] - login_time).total_seconds()
                login_time = None
        user_durations[email] = total
    return user_durations

@router.get("/debug-analytics")
async def debug_analytics(user: str = Depends(get_current_user)):
    """Debug endpoint to check analytics data (admin only)"""
    if user != "swarnadeep321@gmail.com":
        raise HTTPException(status_code=403, detail="Only admin can view debug data")
    
    analytics = db.get_collection("analytics")
    
    all_data = await analytics.find().sort("timestamp", -1).to_list(50)
    
    tracked_users = ["swarnadeep896@gmail.com", "jimmycarter@gmail.com", "willphilips364@yahoo.com"]
    login_logout_data = await analytics.find({
        "event": {"$in": ["login", "logout"]},
        "email": {"$in": tracked_users}
    }).sort("timestamp", -1).to_list(50)
    
    study_data = await analytics.find({
        "timeSpent": {"$exists": True, "$ne": None},
        "email": {"$in": tracked_users}
    }).sort("timestamp", -1).to_list(50)
    
    return {
        "total_records": len(all_data),
        "login_logout_records": len(login_logout_data),
        "study_records": len(study_data),
        "recent_login_logout": login_logout_data,
        "recent_study": study_data,
        "tracked_users": tracked_users
    }

@router.post("/create-test-data")
async def create_test_data(user: str = Depends(get_current_user)):
    """Create test analytics data for tracked users (admin only)"""
    if user != "swarnadeep321@gmail.com":
        raise HTTPException(status_code=403, detail="Only admin can create test data")
    
    analytics = db.get_collection("analytics")
    
    from datetime import timedelta
    import random
    
    test_data = []
    tracked_users = ["swarnadeep896@gmail.com", "jimmycarter@gmail.com", "willphilips364@yahoo.com"]
    
    for i in range(7):
        date = datetime.utcnow() - timedelta(days=i)
        
        for user_email in tracked_users:
            login_time = date.replace(hour=9 + random.randint(0, 2), minute=random.randint(0, 59))
            test_data.append({
                "email": user_email,
                "event": "login",
                "timestamp": login_time
            })
            
            logout_time = login_time + timedelta(hours=2 + random.randint(0, 2), minutes=random.randint(0, 59))
            test_data.append({
                "email": user_email,
                "event": "logout",
                "timestamp": logout_time
            })
            
            study_time = random.randint(300, 1800)  # 5-30 minutes
            test_data.append({
                "email": user_email,
                "timeSpent": study_time,
                "page": f"page_{random.randint(1, 5)}",
                "timestamp": login_time + timedelta(minutes=random.randint(10, 60))
            })
    
    if test_data:
        await analytics.insert_many(test_data)
    
    return {
        "message": f"Created {len(test_data)} test records",
        "records_created": len(test_data)
    }
