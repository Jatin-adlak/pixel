# ===== OLD LOCAL FACE RECOGNITION =====
# import face_recognition
# from io import BytesIO

import requests
from config.db import images_collection, fs
from datetime import datetime
import os
import uuid

BACKEND_URL = os.getenv(
    "BACKEND_URL",
    "http://127.0.0.1:8000"
    )

DATASET_DIR = "dataset"

# 🔥 Face service URL
FACE_SERVICE_URL = os.getenv(
    "FACE_SERVICE_URL",
    "http://127.0.0.1:5000"
)


def generate_embedding(file_bytes, filename=None):

    try:

        # =====================================================
        # OLD LOCAL METHOD (kept for future use)
        # =====================================================

        # img = face_recognition.load_image_file(
        #     BytesIO(file_bytes)
        # )
        #
        # encodings = face_recognition.face_encodings(
        #     img
        # )
        #
        # if len(encodings) == 0:
        #     return None
        #
        # return encodings[0].tolist()


        # =====================================================
        # NEW EXTERNAL FACE SERVICE METHOD
        # =====================================================

        files = {

            "image": (
                filename,
                file_bytes
            )

        }

        response = requests.post(

            f"{FACE_SERVICE_URL}/generate_embedding",

            files=files,

            timeout=30

        )

        if response.status_code != 200:

            print(
                "Face service error:",
                response.text
            )

            return None

        data = response.json()

        return data.get(
            "embedding"
        )

    except Exception as e:

        print(
            "Embedding error:",
            e
        )

        return None


def add_image(file, data):

    try:

        file_bytes = file.read()

        if not file_bytes:
            return None

        # ===== GRIDFS SAVE =====

        file_id = fs.put(

            file_bytes,

            filename=file.name,

            content_type=file.content_type

        )


        os.makedirs(
            DATASET_DIR,
            exist_ok=True
        )


        unique_name = f"{uuid.uuid4()}_{file.name}"

        file_path = os.path.join(
            DATASET_DIR,
            unique_name
        )


        with open(

            file_path,

            "wb"

        ) as f:

            f.write(
                file_bytes
            )


        print(
            "📁 Saved:",
            file_path
        )


        # ===== GENERATE FACE EMBEDDING =====

        embedding = generate_embedding(

            file_bytes,

            file.name

        )


        image = {

            "event_id":
            data.get(
                "event_id"
            ),

            "file_id":
            str(
                file_id
            ),

            "uploaded_by":
            data.get(
                "uploaded_by"
            ),

            "embedding":
            embedding,

            "filename":
            file.name,

            "dataset_path":
            file_path,

            "uploaded_at":
            datetime.utcnow()

        }


        result = images_collection.insert_one(
            image
        )


        image["_id"] = str(
            result.inserted_id
        )


        return image


    except Exception as e:

        print(
            "Error adding image:",
            e
        )

        return None


def get_images(event_id):

    try:

        images = list(

            images_collection.find(

                {
                    "event_id":
                    event_id
                }

            )

        )


        result = []


        for img in images:

            result.append({

                "_id":
                str(
                    img["_id"]
                ),

                "event_id":
                img.get(
                    "event_id"
                ),

                "file_id":
                str(
                    img.get(
                        "file_id"
                    )
                ),

                "url":
                f"{BACKEND_URL}/api/images/file/{img.get('file_id')}/",

                "has_face":
                img.get(
                    "embedding"
                ) is not None

            })


        return result


    except Exception as e:

        print(
            "Error fetching images:",
            e
        )

        return []