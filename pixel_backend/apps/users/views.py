from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services import create_user, get_users, toggle_saved_image, toggle_saved_post, unfollow_user, update_username as update_username_service, send_follow_request, accept_follow_request, reject_follow_request, remove_follower as remove_follower_service
from config.db import users_collection


# 🔐 ALLOWED DOMAINS
ALLOWED_DOMAINS = ["sait.ac.in", "saip.ac.in"]

# 🔥 ADMIN EMAILS
ADMIN_EMAILS = [
    "kanishkk52@gmail.com",
    "altatrescue@gmail.com",
    "yashadlakpc@gmail.com",
    "biku.patel45@gmail.com"
]


# 🔥 LOGIN / CREATE USER (SECURED)
@api_view(['POST'])
def login_user(request):

    email = request.data.get("email")
    name = request.data.get("name")
    picture = request.data.get("picture")

    # ❌ VALIDATION

    if not email:
        return Response(
            {"error":"Email is required"},
            status=400
        )

    email = email.strip().lower()


    try:

        domain = email.split("@")[1]

    except:

        return Response(
            {"error":"Invalid email format"},
            status=400
        )


    # 🔒 ALLOW ADMIN OR DOMAIN USERS

    admin_emails = [

        x.strip().lower()

        for x in ADMIN_EMAILS

    ]

    if (

        email not in admin_emails

        and

        domain not in ALLOWED_DOMAINS

    ):

        return Response(
            {"error":"Unauthorized domain"},
            status=403
        )


    # 🔥 CREATE USER IF NOT EXISTS

    create_user({

        "email":email,
        "name":name,
        "picture":picture

    })


    # 🔥 ALWAYS FETCH LATEST USER

    user = users_collection.find_one({

        "email":email

    })


    if not user:

        return Response(
            {"error":"User creation failed"},
            status=400
        )


    # 🔥 ADMIN CHECK

    is_admin = (

        email in admin_emails

    )

    print(
        "ADMIN STATUS:",
        email,
        is_admin
    )


    return Response({

        "_id":
            str(user["_id"]),

        "email":
            user.get("email"),

        "name":
            user.get("name"),

        "picture":
            user.get("picture"),

        "isAdmin":
            is_admin,

        "saved_posts":
            user.get(
                "saved_posts",
                []
            ),

        "saved_images":
            user.get(
                "saved_images",
                []
            ),

        "followers":
            user.get(
                "followers",
                []
            ),

        "following":
            user.get(
                "following",
                []
            ),

        "follow_requests":
            user.get(
                "follow_requests",
                []
            )

    })


# 🔥 FETCH ALL USERS
@api_view(['GET'])
def fetch_users(request):
    return Response(get_users())


# 🔥 UPDATE USERNAME (SECURED)
@api_view(['POST'])
def update_username(request):

    email = request.data.get("email")
    username = request.data.get("username")

    # ❌ VALIDATION
    if not email or not username:
        return Response({"error": "Email and username required"}, status=400)

    if len(username.strip()) < 2:
        return Response({"error": "Username too short"}, status=400)

    # 🔒 CHECK USER EXISTS
    users = get_users()
    exists = any(u["email"] == email for u in users)

    if not exists:
        return Response({"error": "User not found"}, status=404)

    # ✅ UPDATE
    user = update_username_service(email, username)

    return Response({
        "_id": str(user.get("_id")),
        "email": user.get("email"),
        "name": user.get("name"),
        "picture": user.get("picture"),
        "isAdmin": email in ADMIN_EMAILS
    })

# 🔥 SAVE / UNSAVE POST
@api_view(['POST'])
def save_post(request):

    email = request.data.get("email")
    post_id = request.data.get("post_id")

    result = toggle_saved_post(
        email,
        post_id
    )

    if not result:
        return Response(
            {"error":"User not found"},
            status=404
        )

    return Response(result)

# 🔥 SAVE / UNSAVE IMAGE
@api_view(['POST'])
def save_image(request):

    email = request.data.get("email")
    image_url = request.data.get("image_url")

    result = toggle_saved_image(
        email,
        image_url
    )

    if not result:
        return Response(
            {"error":"User not found"},
            status=404
        )

    return Response(result)

# 🔥 SEARCH USERS
@api_view(['GET'])
def search_users(request):

    try:

        query = request.GET.get("q", "").strip()

        if not query:
            return Response([])

        users = list(users_collection.find({
            "$or": [

                {
                    "name": {
                        "$regex": query,
                        "$options": "i"
                    }
                },

                {
                    "email": {
                        "$regex": query,
                        "$options": "i"
                    }
                }

            ]
        }))

        result = []

        for user in users:

            result.append({
                "_id": str(user["_id"]),
                "name": user.get("name", ""),
                "email": user.get("email", ""),
                "picture": user.get("picture", "")
            })

        return Response(result)

    except Exception as e:

        print("❌ SEARCH USER ERROR:", str(e))

        return Response(
            {"error": str(e)},
            status=500
        )


# 🔥 PUBLIC PROFILE
@api_view(['GET'])
def public_profile(request, email):

    try:

        user = users_collection.find_one({
            "email": email
        })

        if not user:
            return Response(
                {"error": "User not found"},
                status=404
            )

        return Response({

            "_id": str(user["_id"]),

            "name": user.get("name", ""),
            "email": user.get("email"),

            "picture": user.get("picture"),

            "domain": user.get("domain"),
            "ring": user.get("ring"),

            # 🔥 FIX
            "isAdmin":
                user.get("email")
                in ADMIN_EMAILS,

            # 🔥 SAVED
            "saved_posts":
                user.get("saved_posts", []),

            "saved_images":
                user.get("saved_images", []),

            # 🔥 FOLLOW SYSTEM
            "followers":
                user.get("followers", []),

            "following":
                user.get("following", []),

            "follow_requests":
                user.get("follow_requests", []),

            # 🔥 PRIVATE PROFILE
            "private_profile":
                user.get(
                    "private_profile",
                    True
                )

        })

    except Exception as e:

        print(
            "❌ PUBLIC PROFILE ERROR:",
            str(e)
        )

        return Response(
            {"error": str(e)},
            status=500
        )

# 🔥 FOLLOW REQUEST
@api_view(['POST'])
def follow_request(request):

    try:

        print("📥 FOLLOW REQUEST BODY:", request.data)

        sender = request.data.get("sender")
        target = request.data.get("target")

        print("👤 Sender:", sender)
        print("🎯 Target:", target)

        result = send_follow_request(
            sender,
            target
        )

        print("✅ RESULT:", result)

        if not result:
            return Response(
                {"error":"Request failed"},
                status=400
            )

        return Response({
            "message":"Request sent"
        })

    except Exception as e:

        print("❌ FOLLOW REQUEST ERROR:", str(e))

        return Response(
            {"error": str(e)},
            status=500
        )


# 🔥 ACCEPT REQUEST
@api_view(['POST'])
def accept_request(request):

    try:

        user_email = request.data.get("user_email")
        follower_email = request.data.get("follower_email")

        print("ACCEPT:", user_email, follower_email)

        result = accept_follow_request(
            user_email,
            follower_email
        )

        if not result:
            return Response(
                {"error":"Accept failed"},
                status=400
            )

        return Response({
            "message":"Accepted"
        })

    except Exception as e:

        print("❌ ACCEPT ERROR:", str(e))

        return Response(
            {"error": str(e)},
            status=500
        )


# 🔥 REJECT REQUEST
@api_view(['POST'])
def reject_request(request):

    try:

        user_email = request.data.get("user_email")
        follower_email = request.data.get("follower_email")

        print("REJECT:", user_email, follower_email)

        result = reject_follow_request(
            user_email,
            follower_email
        )

        if not result:
            return Response(
                {"error":"Reject failed"},
                status=400
            )

        return Response({
            "message":"Rejected"
        })

    except Exception as e:

        print("❌ REJECT ERROR:", str(e))

        return Response(
            {"error": str(e)},
            status=500
        )


# 🔥 UNFOLLOW
@api_view(['POST'])
def unfollow(request):

    try:

        user_email = request.data.get(
            "user_email"
        )

        target_email = request.data.get(
            "target_email"
        )

        result = unfollow_user(
            user_email,
            target_email
        )

        if not result:
            return Response(
                {"error":"Unfollow failed"},
                status=400
            )

        return Response({
            "message":"Unfollowed"
        })

    except Exception as e:

        print(
            "❌ UNFOLLOW VIEW ERROR:",
            str(e)
        )

        return Response(
            {"error": str(e)},
            status=500
        )
    
# 🔥 REMOVE FOLLOWER
@api_view(['POST'])
def remove_follower(request):

    user_email = request.data.get(
        "user_email"
    )

    follower_email = request.data.get(
        "follower_email"
    )

    result = remove_follower_service(
        user_email,
        follower_email
    )

    if not result:

        return Response(
            {"error":"Failed"},
            status=400
        )

    return Response({
        "message":"Removed"
    })

@api_view(['POST'])
def update_profile(request):

    try:

        email = request.data.get("email")

        existing = users_collection.find_one(
            {"email":email}
        )

        if not existing:

            return Response(
                {"error":"User not found"},
                status=404
            )

        name=(

            request.data.get("name")

            or existing.get(
                "name",
                ""
            )

        )

        picture=(

            request.data.get("picture")

            or existing.get(
                "picture",
                ""
            )

        )

        update_data={}

        if name != existing.get("name"):

            update_data["name"]=name

        if picture != existing.get("picture"):

            update_data["picture"]=picture


        if update_data:

            users_collection.update_one(

                {"email":email},

                {
                    "$set":update_data
                }

            )


        return Response({

            "_id":
                str(
                    existing["_id"]
                ),

            "email":
                email,

            "name":
                name,

            "picture":
                picture,

            # 🔥 FIX
            "isAdmin":
                email
                in ADMIN_EMAILS,

            "saved_posts":
                existing.get(
                    "saved_posts",
                    []
                ),

            "saved_images":
                existing.get(
                    "saved_images",
                    []
                ),

            "followers":
                existing.get(
                    "followers",
                    []
                ),

            "following":
                existing.get(
                    "following",
                    []
                ),

            "follow_requests":
                existing.get(
                    "follow_requests",
                    []
                )

        })

    except Exception as e:

        print(

            "PROFILE UPDATE ERROR:",

            str(e)

        )

        return Response(

            {"error":str(e)},

            status=500

        )