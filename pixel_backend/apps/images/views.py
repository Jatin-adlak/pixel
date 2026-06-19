from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

from django.http import HttpResponse
from bson import ObjectId

from .services import add_image, get_images
from config.db import fs, images_collection

import os


# 🔥 MULTIPLE IMAGE UPLOAD (FULL ORIGINAL + FIXES)
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_image(request):

    try:
        # ✅ SUPPORT BOTH KEYS
        files = request.FILES.getlist("image") or request.FILES.getlist("images")

        print("📥 Files received:", len(files))
        print("📦 FILES OBJECT:", request.FILES)

        if not files:
            return Response(
                {"error": "No images received"},
                status=status.HTTP_400_BAD_REQUEST
            )

        event_id = request.data.get("event_id")
        uploaded_by = request.data.get("uploaded_by")

        event_id = str(event_id) if event_id else None

        print("📌 Event ID:", event_id)
        print("👤 Uploaded by:", uploaded_by)

        if not event_id or not uploaded_by:
            return Response(
                {"error": "event_id and uploaded_by required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        uploaded_images = []
        failed_images = []

        for file in files:
            try:
                print("➡️ Processing:", file.name)

                image = add_image(file, {
                    "event_id": event_id,
                    "uploaded_by": uploaded_by
                })

                if image:
                    file_id = str(image.get("file_id"))

                    uploaded_images.append({
                        "file_id": file_id,
                        "url": f"http://127.0.0.1:8000/api/images/file/{file_id}/"
                    })

                    print("✅ Saved:", file_id)

                else:
                    print("❌ Failed (service returned None):", file.name)
                    failed_images.append(file.name)

            except Exception as inner_error:
                print("❌ Error in file:", file.name, inner_error)
                failed_images.append(file.name)

        return Response(
            {
                "success": True,
                "count": len(uploaded_images),
                "failed": len(failed_images),
                "images": uploaded_images,
                "failed_files": failed_images
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        print("❌ Upload error:", e)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# 🔥 FETCH IMAGES (FULL ORIGINAL + FIXED URL)
@api_view(['GET'])
def fetch_images(request):
    try:
        event_id = request.GET.get("event_id")

        if not event_id:
            return Response(
                {"error": "event_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        event_id = str(event_id)

        print("📌 Fetching images for event:", event_id)

        images = get_images(event_id)

        print("📸 Images fetched:", len(images))

        result = [
            {
                "file_id": str(img.get("file_id")),
                "url": f"http://127.0.0.1:8000/api/images/file/{img.get('file_id')}/"
            }
            for img in images
            if img.get("file_id")
        ]

        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        print("❌ Fetch error:", e)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# 🔥 SERVE IMAGE (FULL ORIGINAL SAFE)
@api_view(['GET'])
def get_image_file(request, file_id):
    try:
        file = fs.get(ObjectId(file_id))

        content_type = getattr(file, "content_type", None)

        if not content_type:
            filename = file.filename.lower()

            if filename.endswith(".png"):
                content_type = "image/png"
            elif filename.endswith(".webp"):
                content_type = "image/webp"
            elif filename.endswith(".jpg") or filename.endswith(".jpeg"):
                content_type = "image/jpeg"
            else:
                content_type = "application/octet-stream"

        return HttpResponse(
            file.read(),
            content_type=content_type
        )

    except Exception as e:
        print("❌ File fetch error:", e)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# 🔥 DELETE IMAGE (NEW FEATURE - FULL SAFE)
@api_view(['DELETE'])
def delete_image(request, file_id):
    try:
        print("🗑 Delete request for:", file_id)

        image = images_collection.find_one({"file_id": str(file_id)})

        if not image:
            return Response({"error": "Image not found"}, status=404)

        # 🔥 DELETE FROM GRIDFS
        try:
            fs.delete(ObjectId(file_id))
            print("🧹 Deleted from GridFS")
        except Exception as e:
            print("GridFS delete error:", e)

        # 🔥 DELETE FROM DATASET (face service)
        dataset_path = image.get("dataset_path")

        if dataset_path and os.path.exists(dataset_path):
            try:
                os.remove(dataset_path)
                print("📁 Deleted from dataset:", dataset_path)
            except Exception as e:
                print("Dataset delete error:", e)

        # 🔥 DELETE FROM DB
        images_collection.delete_one({"file_id": str(file_id)})

        print("✅ Image fully deleted")

        return Response({"message": "Image deleted successfully"}, status=200)

    except Exception as e:
        print("❌ DELETE IMAGE ERROR:", e)
        return Response({"error": str(e)}, status=500)