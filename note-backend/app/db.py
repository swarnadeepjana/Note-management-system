import motor.motor_asyncio
from decouple import config
from app.core.config import settings


MONGO_URL = config("MONGO_URL") 
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.get_database()  # This connects to the 'note_app' DB
