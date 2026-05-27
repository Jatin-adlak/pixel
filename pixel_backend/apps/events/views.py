from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

from bson import ObjectId
from django.http import HttpResponse

from config.db import fs, events_collection, images_collection
from .services import create_event, get_events

import os

BACKEND_URL = os.getenv(
    "BACKEND_URL",
    "http://127.0.0.1:8000"
    )


# 🔥 CREATE EVENT (WITH COVER IMAGE)
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def add_event(request):
    try:
        name = request.data.get("name")
        description = request.data.get("description")
        cover_file = request.FILES.get("cover")

        print("📥 EVENT CREATE REQUEST:", name)

        cover_id = None

        # 🔥 STORE COVER IN GRIDFS
        if cover_file:
            file_bytes = cover_file.read()

            cover_id = fs.put(
                file_bytes,
                filename=cover_file.name,
                content_type=cover_file.content_type
            )

        data = {
            "name": name,
            "description": description,
            "cover": str(cover_id) if cover_id else None
        }

        event = create_event(data)

        # 🔥 ADD COVER URL IN RESPONSE
        if event.get("cover"):
            event["cover_url"] = f"{BACKEND_URL}/api/events/cover/{event['cover']}/"
            event["cover"] = event["cover_url"]   # ✅ IMPORTANT FIX

        return Response(event, status=status.HTTP_201_CREATED)

    except Exception as e:
        print("❌ EVENT CREATE ERROR:", str(e))
        return Response({"error": str(e)}, status=500)


# 🔥 FETCH EVENTS (WITH COVER URL)
@api_view(['GET'])
def fetch_events(request):
    try:
        events = get_events()

        for event in events:

            if event.get("cover"):
                url = f"{BACKEND_URL}/api/events/cover/{event['cover']}/"
                event["cover_url"] = url
                event["cover"] = url   # ✅ KEY FIX FOR FRONTEND
            else:
                event["cover_url"] = None
                event["cover"] = None

        return Response(events, status=200)

    except Exception as e:
        print("❌ FETCH EVENTS ERROR:", str(e))
        return Response({"error": str(e)}, status=500)


# 🔥 SERVE COVER IMAGE
@api_view(['GET'])
def get_cover(request, file_id):
    try:
        file = fs.get(ObjectId(file_id))

        content_type = getattr(file, "content_type", "image/jpeg")

        return HttpResponse(file.read(), content_type=content_type)

    except Exception as e:
        print("❌ COVER FETCH ERROR:", str(e))
        return Response({"error": str(e)}, status=500)


# 🔥 DELETE EVENT + ALL RELATED DATA
@api_view(['DELETE'])
def delete_event(request, event_id):
    try:
        event_id = str(event_id)

        event = events_collection.find_one({"_id": ObjectId(event_id)})

        if not event:
            return Response({"error": "Event not found"}, status=404)

        # 🔥 DELETE COVER
        if event.get("cover"):
            try:
                fs.delete(ObjectId(event["cover"]))
            except:
                pass

        # 🔥 DELETE ALL IMAGES
        images = list(images_collection.find({"event_id": event_id}))

        for img in images:
            try:
                fs.delete(ObjectId(img["file_id"]))
            except:
                pass

        images_collection.delete_many({"event_id": event_id})

        # 🔥 DELETE EVENT
        events_collection.delete_one({"_id": ObjectId(event_id)})

        return Response({"message": "Event deleted successfully"}, status=200)

    except Exception as e:
        print("❌ DELETE EVENT ERROR:", str(e))
        return Response({"error": str(e)}, status=500)
    
# 🔥 UPDATE EVENT
@api_view(['PUT'])
@parser_classes([MultiPartParser, FormParser])
def update_event(request, event_id):
    try:

        event = events_collection.find_one({
            "_id": ObjectId(event_id)
        })

        if not event:
            return Response(
                {"error": "Event not found"},
                status=404
            )

        update_data = {
            "name": request.data.get(
                "name",
                event.get("name")
            ),

            "description": request.data.get(
                "description",
                event.get("description")
            )
        }

        # 🔥 NEW COVER IMAGE
        cover_file = request.FILES.get("cover")

        if cover_file:

            # 🔥 DELETE OLD COVER
            if event.get("cover"):
                try:
                    fs.delete(ObjectId(event["cover"]))
                except:
                    pass

            file_bytes = cover_file.read()

            cover_id = fs.put(
                file_bytes,
                filename=cover_file.name,
                content_type=cover_file.content_type
            )

            update_data["cover"] = str(cover_id)

        # 🔥 UPDATE DB
        events_collection.update_one(
            {"_id": ObjectId(event_id)},
            {"$set": update_data}
        )

        updated_event = events_collection.find_one({
            "_id": ObjectId(event_id)
        })

        updated_event["_id"] = str(updated_event["_id"])

        # 🔥 RETURN COVER URL
        if updated_event.get("cover"):
            updated_event["cover_url"] = (
                f"{BACKEND_URL}/api/events/cover/{updated_event['cover']}/"
            )

            updated_event["cover"] = (
                updated_event["cover_url"]
            )

        return Response(updated_event, status=200)

    except Exception as e:
        print("❌ UPDATE EVENT ERROR:", str(e))

        return Response(
            {"error": str(e)},
            status=500
        )