from django.urls import path
from .views import upload_image, fetch_images, get_image_file, delete_image

urlpatterns = [
    path("upload/", upload_image),
    path("", fetch_images),
    path("file/<str:file_id>/", get_image_file),
    path("delete/<str:file_id>/", delete_image),   # 🔥 NEW
]