from django.urls import path

from .views import (
    add_event,
    delete_event,
    fetch_events,
    get_cover,
    get_drive_thumbnail,
    get_drive_original,
    get_event_gallery,
    list_event_catalog,
    update_event,
)

urlpatterns = [
    path("add/", add_event),
    path("catalog/", list_event_catalog),
    path("cover/<str:file_id>/", get_cover),
    path("delete/<str:event_id>/", delete_event),
    path("update/<str:event_id>/", update_event),
    path("<slug:event_slug>/", get_event_gallery),
    path("", fetch_events),
    path("thumbnail/<str:file_id>/", get_drive_thumbnail),
     path("original/<str:file_id>/", get_drive_original),
]
