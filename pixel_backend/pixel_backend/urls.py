from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
import os   # ✅ ADD THIS

def home(request):
    return JsonResponse({"message": "Pixel Backend Running 🚀"})

urlpatterns = [
    path('', home),

    path('api/users/', include('apps.users.urls')),
    path('api/posts/', include('apps.posts.urls')),
    path('api/events/', include('apps.events.urls')),
    path('api/images/', include('apps.images.urls')),
    path('api/newsletters/', include('apps.newsletters.urls')),
    path('api/face/', include('apps.face_search.urls')),
]

# 🔥 IMPORTANT: SERVE STATIC FILES (PDF + IMAGES)
urlpatterns += static(
    settings.STATIC_URL,
    document_root=os.path.join(settings.BASE_DIR, 'static')
)