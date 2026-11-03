from datetime import datetime

from bson import ObjectId
from django.utils.text import slugify

from config.db import events_collection


def _unique_mongo_slug(title, exclude_id=None):
    base = slugify(title or "") or "event"
    slug = base
    suffix = 2

    while True:
        query = {"slug": slug}
        if exclude_id is not None:
            query["_id"] = {"$ne": exclude_id}
        if events_collection.find_one(query) is None:
            return slug
        slug = f"{base}-{suffix}"
        suffix += 1


def serialize_mongo_event(event):
    cover = event.get("cover")
    date = event.get("date")
    if hasattr(date, "isoformat"):
        date = date.isoformat()

    return {
        "_id": str(event["_id"]),
        "name": event.get("name") or event.get("title"),
        "title": event.get("title") or event.get("name"),
        "cover": cover,
        "description": event.get("description"),
        "date": date,
        "slug": event.get("slug") or slugify(event.get("name") or event.get("title") or "") or str(event["_id"]),
        "drive_folder_id": event.get("drive_folder_id") or "",
        "source": "mongo",
    }


def create_event(data):
    name = data.get("name") or data.get("title")
    event = {
        "name": name,
        "title": name,
        "cover": data.get("cover"),
        "description": data.get("description"),
        "date": data.get("date") or None,
        "drive_folder_id": (data.get("drive_folder_id") or "").strip(),
        "created_at": datetime.utcnow(),
    }
    event["slug"] = _unique_mongo_slug(name)

    result = events_collection.insert_one(event)
    event["_id"] = result.inserted_id
    return serialize_mongo_event(event)


def get_events():
    events = list(events_collection.find().sort("created_at", -1))
    return [serialize_mongo_event(event) for event in events]


def find_mongo_event(event_slug):
    event = events_collection.find_one({"slug": event_slug})
    if event:
        return event

    if ObjectId.is_valid(event_slug):
        return events_collection.find_one({"_id": ObjectId(event_slug)})

    return None
