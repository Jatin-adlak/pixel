from django.urls import path
from .views import accept_request, login_user, fetch_users, reject_request, remove_follower, save_post, unfollow , update_username, save_image, search_users, public_profile, follow_request

urlpatterns = [
    path("login/", login_user),
    path("", fetch_users),
    path("update-username/", update_username),
    path("save-post/", save_post),
    path("save-image/", save_image),
    path("search/", search_users),
    path("public/<str:email>/", public_profile),
    path("follow-request/", follow_request),
    path("accept-request/", accept_request),
    path("reject-request/", reject_request),
    path("unfollow/", unfollow),
    path("remove-follower/",remove_follower),
]