import face_recognition
import numpy as np
import requests
from io import BytesIO

# 🔥 Balanced threshold
THRESHOLD = 0.55

# 🔥 Always return at least top matches
TOP_K = 5


def search_faces(query_image_path, event_id):
    try:
        print("🔍 Processing query image:", query_image_path)

        query_img = face_recognition.load_image_file(query_image_path)
        query_encodings = face_recognition.face_encodings(query_img)

        if len(query_encodings) == 0:
            print("❌ No face found in query image")
            return []

        query_encoding = query_encodings[0]
        print("✅ Query face encoded")

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

        for img in images:
            try:
                image_url = img.get("url")

                img_res = requests.get(image_url)
                if img_res.status_code != 200:
                    continue

                loaded_img = face_recognition.load_image_file(
                    BytesIO(img_res.content)
                )

                encodings = face_recognition.face_encodings(loaded_img)

                if not encodings:
                    continue

                best_distance = 1.0

                for enc in encodings:
                    distance = face_recognition.face_distance(
                        [query_encoding], enc
                    )[0]

                    if distance < best_distance:
                        best_distance = distance

                matched_results.append({
                    "url": image_url,
                    "distance": best_distance
                })

            except Exception as e:
                print("Error:", e)
                continue

        # 🔥 SORT ALL RESULTS
        matched_results.sort(key=lambda x: x["distance"])

        final_urls = []

        # 🔥 1. STRICT MATCHES
        for item in matched_results:
            if item["distance"] <= THRESHOLD:
                final_urls.append(item["url"])

        # 🔥 2. FALLBACK (IMPORTANT)
        if len(final_urls) < 3:
            print("⚠️ Using fallback top matches")

            for item in matched_results[:TOP_K]:
                if item["url"] not in final_urls:
                    final_urls.append(item["url"])

        # 🔥 REMOVE DUPLICATES
        final_urls = list(dict.fromkeys(final_urls))

        print("🎯 Final Matches:", final_urls)

        return final_urls

    except Exception as e:
        print("❌ Error:", e)
        return []