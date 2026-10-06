from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))

try:
    client.admin.command("ping")
    print("MongoDB connected successfully!")

    db = client["pixel_db"]

    print("Database:", db.name)
    print("Collections:", db.list_collection_names())

except Exception as e:
    print("MongoDB connection failed:")
    print(e)