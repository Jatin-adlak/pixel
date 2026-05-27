from django.urls import path
from .views import *

urlpatterns=[

path(
"upload/",
upload_spotlight
),

path(
"",
fetch_spotlights
),

path(
"delete/<str:id>/",
remove_spotlight
),

path(
"edit/<str:id>/",
update_spotlight
)

]