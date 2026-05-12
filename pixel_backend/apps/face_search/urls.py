from django.urls import path
from .views import find_photos

urlpatterns = [
    path('find/<str:event_id>/', find_photos),
]