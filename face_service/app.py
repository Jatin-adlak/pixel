from flask import Flask, request, jsonify
import os
from backend.search_engine import search_faces

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.path.join(BASE_DIR, "temp")

os.makedirs(TEMP_DIR, exist_ok=True)

@app.route("/match-faces", methods=["POST"])
def match_faces():
    try:
        file = request.files.get("image")
        data = request.get_json()

        if not file or not data:
            return jsonify({"error": "Missing data"}), 400

        images = data.get("images", [])

        query_path = os.path.join(TEMP_DIR, "query.jpg")
        file.save(query_path)

        # 🔥 NO DOWNLOAD, DIRECT EMBEDDING SEARCH
        matched_ids = search_faces(query_path, images)

        return jsonify({"matches": matched_ids})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=True)