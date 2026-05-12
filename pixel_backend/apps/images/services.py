import face_recognition
from config.db import images_collection, fs
from io import BytesIO
from datetime import datetime
import os
import uuid   # 🔥 NEW

DATASET_DIR = "C:/pixal/face_service/dataset"


def generate_embedding(file_bytes):
    try:
        img = face_recognition.load_image_file(BytesIO(file_bytes))
        encodings = face_recognition.face_encodings(img)

        if len(encodings) == 0:
            return None

        return encodings[0].tolist()

    except Exception as e:
        print("Embedding error:", e)
        return None


def add_image(file, data):
    try:
        file_bytes = file.read()

        if not file_bytes:
            return None

        # 🔥 GRIDFS SAVE
        file_id = fs.put(
            file_bytes,
            filename=file.name,
            content_type=file.content_type
        )

        # 🔥 UNIQUE NAME FIX (IMPORTANT)
        os.makedirs(DATASET_DIR, exist_ok=True)

        unique_name = f"{uuid.uuid4()}_{file.name}"
        file_path = os.path.join(DATASET_DIR, unique_name)

        with open(file_path, "wb") as f:
            f.write(file_bytes)

        print("📁 Saved:", file_path)

        embedding = generate_embedding(file_bytes)

        image = {
            "event_id": data.get("event_id"),
            "file_id": str(file_id),
            "uploaded_by": data.get("uploaded_by"),
            "embedding": embedding,
            "filename": file.name,
            "dataset_path": file_path,
            "uploaded_at": datetime.utcnow()
        }

        result = images_collection.insert_one(image)
        image["_id"] = str(result.inserted_id)

        return image

    except Exception as e:
        print("Error adding image:", e)
        return None


def get_images(event_id):
    try:
        images = list(images_collection.find({"event_id": event_id})

)

        result = []

        for img in images:
            result.append({
                "_id": str(img["_id"]),
                "event_id": img.get("event_id"),
                "file_id": str(img.get("file_id")),
                "url": f"http://127.0.0.1:8000/api/images/file/{img.get('file_id')}/",
                "has_face": img.get("embedding") is not None
            })

        return result

    except Exception as e:
        print("Error fetching images:", e)
        return []