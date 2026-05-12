import os
import numpy as np
import pickle
import faiss
import cv2
from tqdm import tqdm
from backend.face_encoder import FaceEncoder
from utils.config import DATASET_DIR, EMBEDDING_PATH, PATH_MAP

encoder = FaceEncoder()

vectors = []
paths = []

images = os.listdir(DATASET_DIR)

print("Encoding dataset (multi-face support enabled)...")

for img in tqdm(images):

    path = os.path.join(DATASET_DIR, img)

    image = cv2.imread(path)

    if image is None:
        print("❌ Cannot read image:", path)
        continue

    # 🔥 DETECT ALL FACES IN IMAGE
    faces = encoder.app.get(image)

    if not faces:
        print("❌ No face detected in:", path)
        continue

    # 🔥 LOOP THROUGH ALL FACES
    for face in faces:

        emb = face.embedding

        # 🔥 NORMALIZE EMBEDDING (CRITICAL)
        emb = emb / np.linalg.norm(emb)

        vectors.append(emb)
        paths.append(path)

# Convert to numpy
vectors = np.array(vectors).astype("float32")

print(f"✅ Total face embeddings created: {len(vectors)}")
print(f"📸 Total images processed: {len(images)}")

# 🔥 USE COSINE SIMILARITY INDEX
index = faiss.IndexFlatIP(512)

# Add vectors
index.add(vectors)

# Save index
faiss.write_index(index, EMBEDDING_PATH)

# Save mapping
with open(PATH_MAP, "wb") as f:
    pickle.dump(paths, f)

print("🚀 Dataset indexing completed successfully!")