import cv2
import numpy as np


def align_face(image, landmarks, desired_size=112):

    """
    Align face based on eye positions
    """

    left_eye = landmarks[0]
    right_eye = landmarks[1]

    # Calculate center of eyes
    eye_center = (
        (left_eye[0] + right_eye[0]) // 2,
        (left_eye[1] + right_eye[1]) // 2
    )

    # Calculate angle between eyes
    dy = right_eye[1] - left_eye[1]
    dx = right_eye[0] - left_eye[0]

    angle = np.degrees(np.arctan2(dy, dx))

    # Distance between eyes
    dist = np.sqrt((dx ** 2) + (dy ** 2))

    desired_dist = desired_size * 0.35

    scale = desired_dist / dist

    # Rotation matrix
    M = cv2.getRotationMatrix2D(eye_center, angle, scale)

    tX = desired_size * 0.5
    tY = desired_size * 0.4

    M[0, 2] += (tX - eye_center[0])
    M[1, 2] += (tY - eye_center[1])

    aligned_face = cv2.warpAffine(
        image,
        M,
        (desired_size, desired_size),
        flags=cv2.INTER_CUBIC
    )

    return aligned_face