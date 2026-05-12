from django.urls import path
from .views import create_data, fetch_data

urlpatterns = [
    path("create/", create_data),
    path("", fetch_data),
]