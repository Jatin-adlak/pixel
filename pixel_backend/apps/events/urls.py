from django.urls import path
from .views import add_event, fetch_events, get_cover, delete_event, update_event

urlpatterns = [
    path("add/", add_event),
    path("", fetch_events),
    path('cover/<str:file_id>/', get_cover),
    path('delete/<str:event_id>/', delete_event),
    path("update/<str:event_id>/",update_event),
]