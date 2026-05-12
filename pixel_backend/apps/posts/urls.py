from django.urls import path
from .views import comment_post, delete_comment_view, fetch_posts, add_post, delete_post_view, like_post

urlpatterns = [
    path('', fetch_posts),
    path('create/', add_post),
    path('delete/<str:post_id>/', delete_post_view),   # 🔥 NEW
    path("like/<str:post_id>/",like_post),
    path("comment/<str:post_id>/",comment_post),
    path("comment/delete/<str:post_id>/<int:comment_index>/",delete_comment_view),
]