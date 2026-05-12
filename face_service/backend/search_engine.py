import face_recognition
import numpy as np
import requests
from io import BytesIO

# 🔥 More strict threshold for better accuracy
THRESHOLD = 0.48

# 🔥 Reduced fallback count
TOP_K = 3


def search_faces(query_image_path, event_id):
    try:
        print("🔍 Processing query image:", query_image_path)

        # 🔥 LOAD QUERY IMAGE
        query_img = face_recognition.load_image_file(query_image_path)

        # 🔥 DETECT FACE LOCATIONS
        query_face_locations = face_recognition.face_locations(
            query_img,
            model="hog"
        )

        query_encodings = face_recognition.face_encodings(
            query_img,
            query_face_locations
        )

        if len(query_encodings) == 0:
            print("❌ No face found in query image")
            return []

        # 🔥 MAIN QUERY FACE
        query_encoding = query_encodings[0]

        print("✅ Query face encoded")

        # 🔥 FETCH EVENT IMAGES
        res = requests.get(
            f"http://127.0.0.1:8000/api/images/?event_id={event_id}"
        )

        if res.status_code != 200:
            print("❌ Failed to fetch images")
            return []

        images = res.json()

        if not images:
            print("❌ No images found")
            return []

        matched_results = []

        # 🔥 PROCESS EACH IMAGE
        for img in images:
            try:
                image_url = img.get("url")

                img_res = requests.get(image_url)

                if img_res.status_code != 200:
                    continue

                loaded_img = face_recognition.load_image_file(
                    BytesIO(img_res.content)
                )

                # 🔥 DETECT ALL FACES IN IMAGE
                face_locations = face_recognition.face_locations(
                    loaded_img,
                    model="hog"
                )

                encodings = face_recognition.face_encodings(
                    loaded_img,
                    face_locations
                )

                if not encodings:
                    continue

                best_distance = 1.0
                found_match = False

                # 🔥 COMPARE ONLY FACES
                for enc in encodings:

                    distance = face_recognition.face_distance(
                        [query_encoding],
                        enc
                    )[0]

                    matches = face_recognition.compare_faces(
                        [query_encoding],
                        enc,
                        tolerance=THRESHOLD
                    )

                    if distance < best_distance:
                        best_distance = distance

                    if matches[0]:
                        found_match = True

                # 🔥 ONLY SAVE GOOD MATCHES
                if found_match:
                    matched_results.append({
                        "url": image_url,
                        "distance": best_distance
                    })

            except Exception as e:
                print("Error:", e)
                continue

        # 🔥 SORT BEST MATCHES
        matched_results.sort(key=lambda x: x["distance"])

        final_urls = []

        # 🔥 STRICT MATCHES ONLY
        for item in matched_results:
            if item["distance"] <= THRESHOLD:
                final_urls.append(item["url"])

        # 🔥 SAFE FALLBACK
        if len(final_urls) == 0:
            print("⚠️ Using fallback top matches")

            for item in matched_results[:TOP_K]:

                # 🔥 Avoid weak matches
                if item["distance"] <= 0.60:

                    if item["url"] not in final_urls:
                        final_urls.append(item["url"])

        # 🔥 REMOVE DUPLICATES
        final_urls = list(dict.fromkeys(final_urls))

        print("🎯 Final Matches:", final_urls)

        return final_urls

    except Exception as e:
        print("❌ Error:", e)
        return []