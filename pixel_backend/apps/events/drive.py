
"""
Google Drive client with separate local thumbnail and original caches.

Install:
    pip install google-api-python-client google-auth-httplib2 requests Pillow
"""

import os
import re
import tempfile
import threading
from pathlib import Path

import requests
from django.conf import settings
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly"

CACHE_ROOT = Path(settings.BASE_DIR) / ".cache" / "drive"
THUMBNAIL_DIR = CACHE_ROOT / "thumbnails"
ORIGINAL_DIR = CACHE_ROOT / "originals"

# Prevent simultaneous duplicate downloads of the same file in this process.
_locks = {}
_locks_guard = threading.Lock()


def _validate_file_id(file_id):
    if not file_id or not re.fullmatch(r"[A-Za-z0-9_-]+", file_id):
        raise ValueError("Invalid Google Drive file ID")


def _get_lock(key):
    with _locks_guard:
        if key not in _locks:
            _locks[key] = threading.Lock()
        return _locks[key]


def get_drive_service():
    """Build an authenticated Google Drive API client."""

    credentials_path = getattr(
        settings,
        "GOOGLE_SERVICE_ACCOUNT_FILE",
        os.path.join(
            settings.BASE_DIR,
            "credentials",
            "google-service-account.json",
        ),
    )

    if not os.path.isabs(credentials_path):
        credentials_path = os.path.join(settings.BASE_DIR, credentials_path)

    if not os.path.isfile(credentials_path):
        raise FileNotFoundError(
            f"Google service account file not found: {credentials_path}"
        )

    credentials = service_account.Credentials.from_service_account_file(
        credentials_path,
        scopes=[DRIVE_READONLY_SCOPE],
    )

    return build(
        "drive",
        "v3",
        credentials=credentials,
        cache_discovery=False,
    )


def get_drive_file_metadata(file_id):
    _validate_file_id(file_id)

    return get_drive_service().files().get(
        fileId=file_id,
        fields="id,name,mimeType,size,thumbnailLink",
        supportsAllDrives=True,
    ).execute()


def _download_thumbnail(thumbnail_url, destination):
    """
    Download only Google's preview thumbnail, never the original image.
    Google thumbnail URLs can expire, so metadata is fetched when needed.
    """

    response = requests.get(
        thumbnail_url,
        timeout=(5, 20),
    )
    response.raise_for_status()

    content_type = response.headers.get("Content-Type", "")
    if not content_type.startswith("image/"):
        raise ValueError("Google Drive returned a non-image thumbnail.")

    with tempfile.NamedTemporaryFile(
        dir=destination.parent,
        suffix=".tmp",
        delete=False,
    ) as temp_file:
        temp_file.write(response.content)
        temporary_path = Path(temp_file.name)

    try:
        os.replace(temporary_path, destination)
    finally:
        if temporary_path.exists():
            temporary_path.unlink()


def get_cached_thumbnail(file_id):
    """
    Return a cached small thumbnail.

    Does not download the full-size original. If Google does not provide a
    thumbnail URL, raise an error rather than downloading a huge original.
    """

    _validate_file_id(file_id)
    THUMBNAIL_DIR.mkdir(parents=True, exist_ok=True)

    thumbnail_path = THUMBNAIL_DIR / f"{file_id}.img"

    if thumbnail_path.is_file() and thumbnail_path.stat().st_size > 0:
        return thumbnail_path

    with _get_lock(f"thumbnail:{file_id}"):
        if thumbnail_path.is_file() and thumbnail_path.stat().st_size > 0:
            return thumbnail_path

        metadata = get_drive_file_metadata(file_id)
        thumbnail_url = metadata.get("thumbnailLink")

        if not thumbnail_url:
            raise FileNotFoundError(
                "Google Drive did not provide a thumbnail for this image."
            )

        _download_thumbnail(thumbnail_url, thumbnail_path)

    return thumbnail_path


def get_cached_original(file_id):
    """
    Fetch the original using the authenticated Drive API and cache it.
    The original bytes are preserved without resizing or recompression.
    """

    _validate_file_id(file_id)
    ORIGINAL_DIR.mkdir(parents=True, exist_ok=True)

    with _get_lock(f"original:{file_id}"):
        service = get_drive_service()

        metadata = service.files().get(
            fileId=file_id,
            fields="id,name,mimeType,size",
            supportsAllDrives=True,
        ).execute()

        if not metadata.get("mimeType", "").startswith("image/"):
            raise ValueError("The requested Drive file is not an image.")

        original_name = Path(metadata.get("name") or "photo").name
        suffix = Path(original_name).suffix[:16] or ".bin"
        original_path = ORIGINAL_DIR / f"{file_id}{suffix}"

        if original_path.is_file() and original_path.stat().st_size > 0:
            return original_path, metadata

        fd, temporary_name = tempfile.mkstemp(
            dir=ORIGINAL_DIR,
            suffix=".download",
        )
        os.close(fd)
        temporary_path = Path(temporary_name)

        try:
            request = service.files().get_media(
                fileId=file_id,
                supportsAllDrives=True,
            )

            with open(temporary_path, "wb") as output:
                downloader = MediaIoBaseDownload(
                    output,
                    request,
                    chunksize=1024 * 1024,
                )

                done = False
                while not done:
                    _, done = downloader.next_chunk()

            if temporary_path.stat().st_size == 0:
                raise IOError("Downloaded original is empty.")

            # If Drive supplies a file size, verify the complete download.
            expected_size = metadata.get("size")
            if (
                expected_size is not None
                and temporary_path.stat().st_size != int(expected_size)
            ):
                raise IOError("Downloaded file size does not match Drive metadata.")

            os.replace(temporary_path, original_path)

        finally:
            if temporary_path.exists():
                temporary_path.unlink()

        return original_path, metadata


def list_folder_images(folder_id):
    """List event images with local preview and original endpoints."""

    if not folder_id:
        return []

    service = get_drive_service()

    query = (
        f"'{folder_id}' in parents and trashed = false "
        "and mimeType contains 'image/'"
    )

    photos = []
    page_token = None

    while True:
        params = {
            "q": query,
            "fields": "nextPageToken,files(id,name,mimeType)",
            "pageSize": 1000,
            "supportsAllDrives": True,
            "includeItemsFromAllDrives": True,
            "orderBy": "name",
        }

        if page_token:
            params["pageToken"] = page_token

        response = service.files().list(**params).execute()

        for file in response.get("files", []):
            file_id = file.get("id")
            if not file_id:
                continue

            photos.append({
                "id": file_id,
                "name": file.get("name") or "photo",
                "thumbnail": (
                    f"/api/events/thumbnail/{file_id}/"
                ),
                "full_size": (
                    f"/api/events/original/{file_id}/"
                ),
            })

        page_token = response.get("nextPageToken")
        if not page_token:
            break

    return photos
