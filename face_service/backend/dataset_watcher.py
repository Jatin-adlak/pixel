import time
import os
import numpy as np
import faiss
import pickle
import cv2
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from backend.face_encoder import FaceEncoder
from utils.config import DATASET_DIR, EMBEDDING_PATH, PATH_MAP

encoder = FaceEncoder()

VALID_EXTENSIONS = (".jpg", ".jpeg", ".png")

# 🔥 Load index safely
if os.path.exists(EMBEDDING_PATH):
    index = faiss.read_index(EMBEDDING_PATH)
else:
    index = faiss.IndexFlatIP(512)

# 🔥 Load path map safely
if os.path.exists(PATH_MAP):
    with open(PATH_MAP, "rb") as f:
        paths = pickle.load(f)
else:
    paths = []


class DatasetHandler(FileSystemEventHandler):

    def on_created(self, event):

        if event.is_directory:
            return

        file_path = event.src_path

        if not file_path.lower().endswith(VALID_EXTENSIONS):
            return

        print(f"📸 New image detected: {file_path}")

        try:
            time.sleep(1)

            image = cv2.imread(file_path)

            if image is None:
                print("❌ Failed to read image:", file_path)
                return

            faces = encoder.app.get(image)

            if not faces:
                print("❌ No face found in:", file_path)
                return

            new_embeddings = []

            for face in faces:
                emb = face.embedding
                emb = emb / np.linalg.norm(emb)
                new_embeddings.append(emb)

            if not new_embeddings:
                return

            new_embeddings = np.array(new_embeddings).astype("float32")

            # 🔥 ADD TO FAISS
            index.add(new_embeddings)

            # 🔥 STORE PATHS
            for _ in new_embeddings:
                paths.append(file_path)

            # 🔥 SAVE FILES
            faiss.write_index(index, EMBEDDING_PATH)

            with open(PATH_MAP, "wb") as f:
                pickle.dump(paths, f)

            print(f"✅ Added {len(new_embeddings)} face(s) from {file_path}")

        except Exception as e:
            print("❌ Error processing file:", file_path, e)


def start_watcher():

    os.makedirs(DATASET_DIR, exist_ok=True)   # ✅ ENSURE FOLDER EXISTS

    event_handler = DatasetHandler()
    observer = Observer()

    observer.schedule(event_handler, DATASET_DIR, recursive=False)
    observer.start()

    print("👀 Watching dataset folder:", DATASET_DIR)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()


if __name__ == "__main__":
    start_watcher()