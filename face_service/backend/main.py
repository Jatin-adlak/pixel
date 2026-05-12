from fastapi import FastAPI, UploadFile, File, Form
import shutil
import os
import threading

from backend.dataset_watcher import start_watcher
from backend.search_engine import search_faces
from utils.config import UPLOAD_DIR

app = FastAPI()

os.makedirs(UPLOAD_DIR, exist_ok=True)


# ✅ KEEP SIMPLE ROUTE + ADD event_id FROM FORM
@app.post("/search")
async def search_face(
    file: UploadFile = File(...),
    event_id: str = Form(...)
):

    try:
        path = os.path.join(UPLOAD_DIR, file.filename)

        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print("🔍 Searching for event:", event_id)

        # ✅ FIX: pass event_id
        matches = search_faces(path, event_id)

        return {"matches": matches}

    except Exception as e:
        print("❌ SEARCH ERROR:", e)
        return {"matches": []}


@app.on_event("startup")
def start_background_tasks():
    threading.Thread(target=start_watcher, daemon=True).start()