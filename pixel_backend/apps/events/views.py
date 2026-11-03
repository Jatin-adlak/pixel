
import mimetypes
import os

from bson import ObjectId

from django.conf import settings
from django.http import FileResponse, HttpResponse, JsonResponse
from django.views.decorators.cache import cache_control

from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

from config.db import fs, events_collection, images_collection

from .drive import (
    list_folder_images,
    get_cached_thumbnail,
    get_cached_original,
)
from .models import Event
from .services import (
    create_event,
    find_mongo_event,
    get_events,
    serialize_mongo_event,
)


# ============================================================
# GOOGLE DRIVE IMAGE DELIVERY
# ============================================================

def _get_thumbnail_content_type(file_path):
    """Determine the thumbnail's actual MIME type."""
    try:
        from PIL import Image

        with Image.open(file_path) as image:
            image_format = (image.format or "").upper()

        formats = {
            "JPEG": "image/jpeg",
            "PNG": "image/png",
            "WEBP": "image/webp",
            "GIF": "image/gif",
            "BMP": "image/bmp",
            "TIFF": "image/tiff",
            "AVIF": "image/avif",
        }

        return formats.get(image_format, "application/octet-stream")

    except Exception:
        return mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"


@api_view(["GET"])
@cache_control(private=True, max_age=86400)
def get_drive_thumbnail(request, file_id):
    """
    Serve a cached thumbnail.

    This endpoint must not download the full-size original just to
    generate a gallery preview.
    """
    try:
        thumbnail_path = get_cached_thumbnail(file_id)

        response = FileResponse(
            open(thumbnail_path, "rb"),
            content_type=_get_thumbnail_content_type(thumbnail_path),
        )
        response["Cache-Control"] = "private, max-age=86400"
        response["X-Content-Type-Options"] = "nosniff"

        return response

    except ValueError as exc:
        return Response(
            {"error": str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    except FileNotFoundError as exc:
        print("DRIVE THUMBNAIL NOT FOUND:", str(exc))
        return Response(
            {"error": "Preview is not available"},
            status=status.HTTP_404_NOT_FOUND,
        )

    except Exception as exc:
        print("DRIVE THUMBNAIL ERROR:", repr(exc))
        return Response(
            {"error": "Unable to load image preview"},
            status=status.HTTP_502_BAD_GATEWAY,
        )


@api_view(["GET"])
def get_drive_original(request, file_id):
    """
    Serve the original image from the local cache.

    If the original isn't cached yet, get_cached_original() retrieves
    it through the authenticated Google Drive API.

    Add ?download=1 to force an attachment download.
    """
    try:
        original_path, metadata = get_cached_original(file_id)

        filename = os.path.basename(metadata.get("name") or "photo")
        content_type = (
            metadata.get("mimeType")
            or mimetypes.guess_type(filename)[0]
            or "application/octet-stream"
        )

        download = request.query_params.get("download") == "1"

        response = FileResponse(
            open(original_path, "rb"),
            content_type=content_type,
            as_attachment=download,
            filename=filename if download else None,
        )

        response["Cache-Control"] = "private, no-cache"
        response["X-Content-Type-Options"] = "nosniff"

        return response

    except ValueError as exc:
        return Response(
            {"error": str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    except FileNotFoundError as exc:
        print("DRIVE ORIGINAL NOT FOUND:", str(exc))
        return Response(
            {"error": "Original image is not available"},
            status=status.HTTP_404_NOT_FOUND,
        )

    except Exception as exc:
        print("DRIVE ORIGINAL ERROR:", repr(exc))
        return Response(
            {"error": "Unable to load original image"},
            status=status.HTTP_502_BAD_GATEWAY,
        )


# ============================================================
# CREATE EVENT
# ============================================================

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def add_event(request):
    try:
        name = request.data.get("name")
        description = request.data.get("description")
        cover_file = request.FILES.get("cover")

        print("EVENT CREATE REQUEST:", name)

        cover_id = None

        # Store the event cover in GridFS.
        if cover_file:
            file_bytes = cover_file.read()

            cover_id = fs.put(
                file_bytes,
                filename=cover_file.name,
                content_type=cover_file.content_type,
            )

        data = {
            "name": name,
            "description": description,
            "date": request.data.get("date") or None,
            "drive_folder_id": (
                request.data.get("drive_folder_id") or ""
            ),
            "cover": str(cover_id) if cover_id else None,
        }

        event = create_event(data)

        if event.get("cover"):
            cover_url = (
                f"http://127.0.0.1:8000/api/events/cover/"
                f"{event['cover']}/"
            )
            event["cover_url"] = cover_url
            event["cover"] = cover_url

        return Response(event, status=status.HTTP_201_CREATED)

    except Exception as exc:
        print("EVENT CREATE ERROR:", repr(exc))
        return Response(
            {"error": str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ============================================================
# FETCH MONGO EVENTS
# ============================================================

@api_view(["GET"])
def fetch_events(request):
    try:
        events = get_events()

        for event in events:
            if event.get("cover"):
                cover_url = (
                    f"http://127.0.0.1:8000/api/events/cover/"
                    f"{event['cover']}/"
                )
                event["cover_url"] = cover_url
                event["cover"] = cover_url
            else:
                event["cover_url"] = None
                event["cover"] = None

        return Response(events, status=status.HTTP_200_OK)

    except Exception as exc:
        print("FETCH EVENTS ERROR:", repr(exc))
        return Response(
            {"error": str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ============================================================
# SERVE GRIDFS COVER IMAGE
# ============================================================

@api_view(["GET"])
def get_cover(request, file_id):
    try:
        file = fs.get(ObjectId(file_id))

        content_type = getattr(
            file,
            "content_type",
            "image/jpeg",
        )

        return HttpResponse(
            file.read(),
            content_type=content_type,
        )

    except Exception as exc:
        print("COVER FETCH ERROR:", repr(exc))
        return Response(
            {"error": "Cover image not found"},
            status=status.HTTP_404_NOT_FOUND,
        )


# ============================================================
# DELETE EVENT AND RELATED GRIDFS DATA
# ============================================================

@api_view(["DELETE"])
def delete_event(request, event_id):
    try:
        event_id = str(event_id)

        if not ObjectId.is_valid(event_id):
            return Response(
                {"error": "Invalid event ID"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        event = events_collection.find_one(
            {"_id": ObjectId(event_id)}
        )

        if not event:
            return Response(
                {"error": "Event not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Delete the cover from GridFS.
        if event.get("cover"):
            try:
                fs.delete(ObjectId(event["cover"]))
            except Exception as exc:
                print("COVER DELETE WARNING:", str(exc))

        # Delete all related image files from GridFS.
        images = list(
            images_collection.find({"event_id": event_id})
        )

        for image in images:
            file_id = image.get("file_id")

            if file_id:
                try:
                    fs.delete(ObjectId(file_id))
                except Exception as exc:
                    print("IMAGE DELETE WARNING:", str(exc))

        images_collection.delete_many({"event_id": event_id})

        events_collection.delete_one(
            {"_id": ObjectId(event_id)}
        )

        return Response(
            {"message": "Event deleted successfully"},
            status=status.HTTP_200_OK,
        )

    except Exception as exc:
        print("DELETE EVENT ERROR:", repr(exc))
        return Response(
            {"error": str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ============================================================
# UPDATE EVENT
# ============================================================

@api_view(["PUT"])
@parser_classes([MultiPartParser, FormParser])
def update_event(request, event_id):
    try:
        if not ObjectId.is_valid(str(event_id)):
            return Response(
                {"error": "Invalid event ID"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        object_id = ObjectId(event_id)

        event = events_collection.find_one({"_id": object_id})

        if not event:
            return Response(
                {"error": "Event not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        update_data = {
            "name": request.data.get(
                "name",
                event.get("name"),
            ),
            "description": request.data.get(
                "description",
                event.get("description"),
            ),
            "date": request.data.get(
                "date",
                event.get("date"),
            ),
            "drive_folder_id": request.data.get(
                "drive_folder_id",
                event.get("drive_folder_id") or "",
            ),
        }

        update_data["title"] = update_data["name"]

        # Replace the existing cover when a new cover is uploaded.
        cover_file = request.FILES.get("cover")

        if cover_file:
            if event.get("cover"):
                try:
                    fs.delete(ObjectId(event["cover"]))
                except Exception as exc:
                    print("OLD COVER DELETE WARNING:", str(exc))

            cover_id = fs.put(
                cover_file.read(),
                filename=cover_file.name,
                content_type=cover_file.content_type,
            )

            update_data["cover"] = str(cover_id)

        events_collection.update_one(
            {"_id": object_id},
            {"$set": update_data},
        )

        updated_event = events_collection.find_one(
            {"_id": object_id}
        )

        updated_event = serialize_mongo_event(updated_event)

        if updated_event.get("cover"):
            cover_url = (
                f"http://127.0.0.1:8000/api/events/cover/"
                f"{updated_event['cover']}/"
            )
            updated_event["cover_url"] = cover_url
            updated_event["cover"] = cover_url

        return Response(
            updated_event,
            status=status.HTTP_200_OK,
        )

    except Exception as exc:
        print("UPDATE EVENT ERROR:", repr(exc))
        return Response(
            {"error": str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ============================================================
# EVENT GALLERY HELPERS
# ============================================================

def _event_payload(title, description, date, slug, photos):
    if hasattr(date, "isoformat"):
        date = date.isoformat()

    return {
        "title": title,
        "description": description or "",
        "date": date,
        "slug": slug,
        "photos": photos,
    }


def _gridfs_photos(event_id):
    """
    Return legacy MongoDB/GridFS images.

    These remain separate from the Google Drive thumbnail endpoints.
    """
    images = list(
        images_collection.find({"event_id": str(event_id)})
    )

    photos = []

    for image in images:
        file_id = str(image.get("file_id") or "")

        if not file_id:
            continue

        url = (
            f"http://127.0.0.1:8000/api/images/file/"
            f"{file_id}/"
        )

        photos.append({
            "id": file_id,
            "name": image.get("filename") or "photo",
            "thumbnail": url,
            "full_size": url,
        })

    return photos


# ============================================================
# PUBLIC EVENT CATALOG
# ============================================================

@api_view(["GET"])
def list_event_catalog(request):
    """Return Django ORM events plus existing MongoDB events."""

    catalog = []

    try:
        for event in Event.objects.all():
            catalog.append({
                "_id": event.slug,
                "name": event.title,
                "title": event.title,
                "description": event.description,
                "date": (
                    event.date.isoformat()
                    if event.date
                    else None
                ),
                "slug": event.slug,
                "drive_folder_id": event.drive_folder_id,
                "cover": None,
                "cover_url": None,
                "source": "drive",
            })

    except Exception as exc:
        print("ORM EVENT CATALOG ERROR:", repr(exc))

    try:
        catalog.extend(get_events())

    except Exception as exc:
        print("MONGO EVENT CATALOG ERROR:", repr(exc))

    return Response(catalog, status=status.HTTP_200_OK)


# ============================================================
# EVENT GALLERY
# ============================================================

@api_view(["GET"])
def get_event_gallery(request, event_slug):
    """
    Resolve an event by slug and return its Google Drive photos.
    Legacy MongoDB events without a Drive folder use GridFS.
    """

    title = None
    description = ""
    date = None
    slug = event_slug
    folder_id = ""
    mongo_event = None

    try:
        event = Event.objects.filter(slug=event_slug).first()
    except Exception as exc:
        print("ORM EVENT LOOKUP ERROR:", repr(exc))
        event = None

    if event:
        title = event.title
        description = event.description
        date = event.date
        slug = event.slug
        folder_id = event.drive_folder_id or ""

    else:
        mongo_event = find_mongo_event(event_slug)

        if not mongo_event:
            return JsonResponse(
                {"error": "Event not found"},
                status=404,
            )

        serialized = serialize_mongo_event(mongo_event)

        title = serialized.get("title")
        description = serialized.get("description") or ""
        date = serialized.get("date")
        slug = serialized.get("slug") or event_slug
        folder_id = serialized.get("drive_folder_id") or ""

    photos = []

    if folder_id:
        try:
            photos = list_folder_images(folder_id)

        except FileNotFoundError as exc:
            print("DRIVE CONFIGURATION ERROR:", repr(exc))
            return JsonResponse(
                {
                    **_event_payload(
                        title,
                        description,
                        date,
                        slug,
                        [],
                    ),
                    "error": str(exc),
                },
                status=503,
            )

        except Exception as exc:
            print("DRIVE GALLERY ERROR:", repr(exc))
            return JsonResponse(
                {
                    **_event_payload(
                        title,
                        description,
                        date,
                        slug,
                        [],
                    ),
                    "error": "Unable to load photos from Google Drive",
                },
                status=502,
            )

    elif mongo_event is not None:
        photos = _gridfs_photos(mongo_event["_id"])

    return JsonResponse(
        _event_payload(
            title,
            description,
            date,
            slug,
            photos,
        )
    )
