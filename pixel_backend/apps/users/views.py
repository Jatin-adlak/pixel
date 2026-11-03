
import time

import jwt
from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from config.db import users_collection
from .services import (
    create_user,
    get_users,
    toggle_saved_image,
    toggle_saved_post,
    unfollow_user,
    update_username as update_username_service,
    send_follow_request,
    accept_follow_request,
    reject_follow_request,
    remove_follower as remove_follower_service,
)


# ============================================================
# CONFIGURATION
# ============================================================

ALLOWED_DOMAINS = ["sait.ac.in", "saip.ac.in"]

ADMIN_EMAILS = [
    "kanishkk52@gmail.com",
    "altatrescue@gmail.com",
    "yashadlakpc@gmail.com",
    "biku.patel45@gmail.com",
]


def _create_pixel_token(email, token_type, lifetime):
    """Create a signed PIXEL JWT."""
    now = int(time.time())

    return jwt.encode(
        {
            "sub": email,
            "type": token_type,
            "iat": now,
            "exp": now + lifetime,
        },
        settings.SECRET_KEY,
        algorithm="HS256",
    )


def _serialize_user(user):
    """Return the user fields expected by the React frontend."""
    email = (user.get("email") or "").strip().lower()
    admin_emails = {
        item.strip().lower() for item in ADMIN_EMAILS
    }

    return {
        "_id": str(user["_id"]),
        "email": email,
        "name": user.get("name", ""),
        "picture": user.get("picture", ""),
        "domain": user.get("domain", ""),
        "ring": user.get("ring", ""),
        "isAdmin": email in admin_emails,
        "saved_posts": user.get("saved_posts", []),
        "saved_images": user.get("saved_images", []),
        "followers": user.get("followers", []),
        "following": user.get("following", []),
        "follow_requests": user.get("follow_requests", []),
    }


# ============================================================
# LOGIN WITH GOOGLE AND ISSUE PIXEL JWT TOKENS
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    """
    Accept a Google ID credential, verify it on the backend,
    validate the user's email domain, and issue PIXEL JWTs.
    """
    credential = request.data.get("credential")

    if not credential:
        return Response(
            {"error": "Google credential is required."},
            status=400,
        )

    google_client_id = getattr(
        settings, "GOOGLE_CLIENT_ID", ""
    )

    if not google_client_id:
        return Response(
            {"error": "Google login is not configured on the server."},
            status=500,
        )

    try:
        google_user = google_id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            google_client_id,
        )
    except Exception:
        return Response(
            {"error": "Google credential is invalid or expired."},
            status=401,
        )

    if not google_user.get("email_verified"):
        return Response(
            {"error": "Your Google email must be verified."},
            status=403,
        )

    email = (
        google_user.get("email") or ""
    ).strip().lower()

    if "@" not in email:
        return Response(
            {"error": "Invalid Google email."},
            status=401,
        )

    domain = email.rsplit("@", 1)[1]

    admin_emails = {
        item.strip().lower() for item in ADMIN_EMAILS
    }
    allowed_domains = {
        item.strip().lower() for item in ALLOWED_DOMAINS
    }

    is_admin = email in admin_emails

    if not is_admin and domain not in allowed_domains:
        return Response(
            {"error": "Unauthorized domain."},
            status=403,
        )

    name = google_user.get("name") or ""
    picture = google_user.get("picture") or ""

    if is_admin:
        ring = "rainbow"
    elif domain == "sait.ac.in":
        ring = "#b55f22"
    else:
        ring = "blue-600"

    # Create a user if one does not already exist.
    create_user({
        "email": email,
        "name": name,
        "picture": picture,
    })

    existing_user = users_collection.find_one({
        "email": email
    })

    if not existing_user:
        return Response(
            {"error": "User creation failed."},
            status=500,
        )

    # Preserve existing custom usernames and profile information.
    profile_updates = {
        "domain": domain,
        "ring": ring,
    }

    if not existing_user.get("name") and name:
        profile_updates["name"] = name

    if not existing_user.get("picture") and picture:
        profile_updates["picture"] = picture

    users_collection.update_one(
        {"email": email},
        {"$set": profile_updates},
    )

    user = users_collection.find_one({"email": email})

    if not user:
        return Response(
            {"error": "User creation failed."},
            status=500,
        )

    access = _create_pixel_token(
        email,
        "access",
        getattr(
            settings,
            "JWT_ACCESS_TOKEN_LIFETIME_SECONDS",
            900,
        ),
    )

    refresh = _create_pixel_token(
        email,
        "refresh",
        getattr(
            settings,
            "JWT_REFRESH_TOKEN_LIFETIME_SECONDS",
            604800,
        ),
    )

    print("PIXEL LOGIN SUCCESS:", email, is_admin)

    return Response({
        "user": _serialize_user(user),
        "access": access,
        "refresh": refresh,
    })


# ============================================================
# REFRESH ACCESS TOKEN
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token(request):
    """Issue a new access token from a valid refresh token."""
    token = request.data.get("refresh")

    if not token:
        return Response(
            {"error": "Refresh token is required."},
            status=400,
        )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"],
            options={
                "require": ["exp", "iat", "sub", "type"]
            },
        )
    except jwt.ExpiredSignatureError:
        return Response(
            {"error": "Refresh token expired. Please log in again."},
            status=401,
        )
    except jwt.InvalidTokenError:
        return Response(
            {"error": "Invalid refresh token."},
            status=401,
        )

    if payload.get("type") != "refresh":
        return Response(
            {"error": "Refresh token required."},
            status=401,
        )

    email = payload.get("sub")

    if not email or not users_collection.find_one({
        "email": email
    }):
        return Response(
            {"error": "User no longer exists."},
            status=401,
        )

    access = _create_pixel_token(
        email,
        "access",
        getattr(
            settings,
            "JWT_ACCESS_TOKEN_LIFETIME_SECONDS",
            900,
        ),
    )

    return Response({"access": access})


# ============================================================
# FETCH USERS
# ============================================================

@api_view(["GET"])
def fetch_users(request):
    return Response(get_users())


# ============================================================
# UPDATE USERNAME
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_username(request):
    email = request.user.email
    username = request.data.get("username")

    if not username:
        return Response(
            {"error": "Username required"},
            status=400,
        )

    username = username.strip()

    if len(username) < 2:
        return Response(
            {"error": "Username too short"},
            status=400,
        )

    users = get_users()
    exists = any(
        (user.get("email") or "").lower() == email.lower()
        for user in users
    )

    if not exists:
        return Response(
            {"error": "User not found"},
            status=404,
        )

    user = update_username_service(email, username)

    if not user:
        return Response(
            {"error": "Username update failed"},
            status=400,
        )

    return Response({
        "_id": str(user.get("_id")),
        "email": user.get("email"),
        "name": user.get("name"),
        "picture": user.get("picture"),
        "isAdmin": email.lower() in {
            item.lower() for item in ADMIN_EMAILS
        },
    })


# ============================================================
# SAVE / UNSAVE POST
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_post(request):
    email = request.user.email
    post_id = request.data.get("post_id")

    if not post_id:
        return Response(
            {"error": "post_id is required"},
            status=400,
        )

    result = toggle_saved_post(email, post_id)

    if not result:
        return Response(
            {"error": "User not found"},
            status=404,
        )

    return Response(result)


# ============================================================
# SAVE / UNSAVE IMAGE
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_image(request):
    email = request.user.email
    image_url = request.data.get("image_url")

    if not image_url:
        return Response(
            {"error": "image_url is required"},
            status=400,
        )

    result = toggle_saved_image(email, image_url)

    if not result:
        return Response(
            {"error": "User not found"},
            status=404,
        )

    return Response(result)


# ============================================================
# SEARCH USERS
# ============================================================

@api_view(["GET"])
def search_users(request):
    try:
        query = request.GET.get("q", "").strip()

        if not query:
            return Response([])

        # Escape regex input to avoid interpreting user input
        # as an arbitrary regular expression.
        import re

        safe_query = re.escape(query)

        users = list(
            users_collection.find({
                "$or": [
                    {
                        "name": {
                            "$regex": safe_query,
                            "$options": "i",
                        }
                    },
                    {
                        "email": {
                            "$regex": safe_query,
                            "$options": "i",
                        }
                    },
                ]
            })
        )

        result = []

        for user in users:
            result.append({
                "_id": str(user["_id"]),
                "name": user.get("name", ""),
                "email": user.get("email", ""),
                "picture": user.get("picture", ""),
            })

        return Response(result)

    except Exception as e:
        print("SEARCH USER ERROR:", str(e))

        return Response(
            {"error": "Unable to search users."},
            status=500,
        )


# ============================================================
# PUBLIC PROFILE
# ============================================================

@api_view(["GET"])
def public_profile(request, email):
    try:
        email = email.strip().lower()

        user = users_collection.find_one({
            "email": email
        })

        if not user:
            return Response(
                {"error": "User not found"},
                status=404,
            )

        admin_emails = {
            item.strip().lower() for item in ADMIN_EMAILS
        }

        return Response({
            "_id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email"),
            "picture": user.get("picture"),
            "domain": user.get("domain"),
            "ring": user.get("ring"),
            "isAdmin": email in admin_emails,
            "saved_posts": user.get("saved_posts", []),
            "saved_images": user.get("saved_images", []),
            "followers": user.get("followers", []),
            "following": user.get("following", []),
            "follow_requests": user.get("follow_requests", []),
            "private_profile": user.get("private_profile", True),
        })

    except Exception as e:
        print("PUBLIC PROFILE ERROR:", str(e))

        return Response(
            {"error": "Unable to fetch profile."},
            status=500,
        )


# ============================================================
# SEND FOLLOW REQUEST
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def follow_request(request):
    try:
        sender = request.user.email
        target = request.data.get("target")

        if not target:
            return Response(
                {"error": "Target user is required."},
                status=400,
            )

        print("FOLLOW REQUEST:", sender, target)

        result = send_follow_request(sender, target)

        if not result:
            return Response(
                {"error": "Request failed"},
                status=400,
            )

        return Response({"message": "Request sent"})

    except Exception as e:
        print("FOLLOW REQUEST ERROR:", str(e))

        return Response(
            {"error": "Unable to send follow request."},
            status=500,
        )


# ============================================================
# ACCEPT FOLLOW REQUEST
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_request(request):
    try:
        user_email = request.user.email
        follower_email = request.data.get("follower_email")

        if not follower_email:
            return Response(
                {"error": "Follower email is required."},
                status=400,
            )

        result = accept_follow_request(
            user_email,
            follower_email,
        )

        if not result:
            return Response(
                {"error": "Accept failed"},
                status=400,
            )

        return Response({"message": "Accepted"})

    except Exception as e:
        print("ACCEPT ERROR:", str(e))

        return Response(
            {"error": "Unable to accept follow request."},
            status=500,
        )


# ============================================================
# REJECT FOLLOW REQUEST
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_request(request):
    try:
        user_email = request.user.email
        follower_email = request.data.get("follower_email")

        if not follower_email:
            return Response(
                {"error": "Follower email is required."},
                status=400,
            )

        result = reject_follow_request(
            user_email,
            follower_email,
        )

        if not result:
            return Response(
                {"error": "Reject failed"},
                status=400,
            )

        return Response({"message": "Rejected"})

    except Exception as e:
        print("REJECT ERROR:", str(e))

        return Response(
            {"error": "Unable to reject follow request."},
            status=500,
        )


# ============================================================
# UNFOLLOW USER
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unfollow(request):
    try:
        user_email = request.user.email
        target_email = request.data.get("target_email")

        if not target_email:
            return Response(
                {"error": "Target email is required."},
                status=400,
            )

        result = unfollow_user(
            user_email,
            target_email,
        )

        if not result:
            return Response(
                {"error": "Unfollow failed"},
                status=400,
            )

        return Response({"message": "Unfollowed"})

    except Exception as e:
        print("UNFOLLOW VIEW ERROR:", str(e))

        return Response(
            {"error": "Unable to unfollow user."},
            status=500,
        )


# ============================================================
# REMOVE FOLLOWER
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def remove_follower(request):
    user_email = request.user.email
    follower_email = request.data.get("follower_email")

    if not follower_email:
        return Response(
            {"error": "Follower email is required."},
            status=400,
        )

    result = remove_follower_service(
        user_email,
        follower_email,
    )

    if not result:
        return Response(
            {"error": "Failed to remove follower."},
            status=400,
        )

    return Response({"message": "Removed"})


# ============================================================
# UPDATE PROFILE
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    try:
        # Always use the authenticated identity, never the
        # email supplied in the request body.
        email = request.user.email

        existing = users_collection.find_one({
            "email": email
        })

        if not existing:
            return Response(
                {"error": "User not found"},
                status=404,
            )

        name = request.data.get("name")
        picture = request.data.get("picture")

        update_data = {}

        if name is not None:
            name = name.strip()

            if len(name) < 2:
                return Response(
                    {"error": "Name must contain at least 2 characters."},
                    status=400,
                )

            if name != existing.get("name"):
                update_data["name"] = name

        if picture is not None and picture != existing.get("picture"):
            update_data["picture"] = picture

        if update_data:
            users_collection.update_one(
                {"email": email},
                {"$set": update_data},
            )

        updated_user = users_collection.find_one({
            "email": email
        })

        if not updated_user:
            return Response(
                {"error": "User not found"},
                status=404,
            )

        return Response(_serialize_user(updated_user))

    except Exception as e:
        print("PROFILE UPDATE ERROR:", str(e))

        return Response(
            {"error": "Unable to update profile."},
            status=500,
        )
