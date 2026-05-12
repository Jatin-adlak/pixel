from config.db import events_collection
from datetime import datetime


def create_event(data):
    event = {
        "name": data.get("name"),
        "cover": data.get("cover"),
        "description": data.get("description"),
        "created_at": datetime.utcnow()
    }

    result = events_collection.insert_one(event)

    event["_id"] = str(result.inserted_id)

    return event


def get_events():
    events = list(events_collection.find())

    result = []

    for event in events:
        result.append({
            "_id": str(event["_id"]),
            "name": event.get("name"),
            "cover": event.get("cover"),
            "description": event.get("description")
        })

    return result