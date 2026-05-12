import insightface
import cv2
import numpy as np

class FaceEncoder:

    def __init__(self):
        self.app = insightface.app.FaceAnalysis()
        self.app.prepare(ctx_id=0, det_size=(640, 640))

    def get_embedding(self, image_path):

        img = cv2.imread(image_path)

        if img is None:
            return None

        faces = self.app.get(img)

        if len(faces) == 0:
            print("No face detected:", image_path)
            return None

        emb = faces[0].embedding

        # 🔥 NORMALIZE EMBEDDING (VERY IMPORTANT)
        emb = emb / np.linalg.norm(emb)

        return emb