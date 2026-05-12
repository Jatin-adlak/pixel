from config.db import users_collection


# 🔥 CREATE / LOGIN USER
def create_user(data):

    email = data.get("email")

    # ❌ BLOCK INVALID REQUEST
    if not email:
        return {"error": "Email required"}

    existing = users_collection.find_one({"email": email})

    if existing:
        existing["_id"] = str(existing["_id"])
        return existing

    user = {
        "name": "",
        "email": email,
        "picture": data.get("picture"),
        "domain": data.get("domain"),
        "ring": data.get("ring", ""),

        # 🔥 SAVED CONTENT
        "saved_posts": [],
        "saved_images": [],

        # 🔥 SOCIAL SYSTEM
        "followers": [],
        "following": [],
        "follow_requests": [],

        # 🔥 PRIVATE PROFILE
        "private_profile": True
    }

    result = users_collection.insert_one(user)

    user["_id"] = str(result.inserted_id)

    return user

# 🔥 GET ALL USERS
def get_users():
    users = list(users_collection.find())

    for user in users:
        user["_id"] = str(user["_id"])

    return users


# 🔥 UPDATE USERNAME (NEW)
def update_username(email, username):

    users_collection.update_one(
        {"email": email},
        {"$set": {"name": username}}
    )

    user = users_collection.find_one({"email": email})

    if user:
        user["_id"] = str(user["_id"])

    return user

# 🔥 TOGGLE SAVED POST
def toggle_saved_post(email, post_id):

    user = users_collection.find_one({
        "email": email
    })

    if not user:
        return None

    saved_posts = user.get("saved_posts", [])

    if post_id in saved_posts:
        saved_posts.remove(post_id)
        saved = False
    else:
        saved_posts.append(post_id)
        saved = True

    users_collection.update_one(
        {"email": email},
        {"$set": {"saved_posts": saved_posts}}
    )

    return {
        "saved": saved,
        "saved_posts": saved_posts
    }

# 🔥 TOGGLE SAVED IMAGE
def toggle_saved_image(email, image_url):

    user = users_collection.find_one({
        "email": email
    })

    if not user:
        return None

    saved_images = user.get(
        "saved_images",
        []
    )

    if image_url in saved_images:
        saved_images.remove(image_url)
        saved = False
    else:
        saved_images.append(image_url)
        saved = True

    users_collection.update_one(
        {"email": email},
        {"$set": {
            "saved_images": saved_images
        }}
    )

    return {
        "saved": saved,
        "saved_images": saved_images
    }

# 🔥 SEND FOLLOW REQUEST
def send_follow_request(sender_email, target_email):

    try:

        if not sender_email or not target_email:
            return False

        if sender_email == target_email:
            return False

        target = users_collection.find_one({
            "email": target_email
        })

        if not target:
            print("❌ TARGET USER NOT FOUND")
            return False

        # 🔥 ALREADY FOLLOWING
        if sender_email in target.get("followers", []):
            return True

        # 🔥 ALREADY REQUESTED
        if sender_email in target.get("follow_requests", []):
            return True

        result = users_collection.update_one(
            {
                "email": target_email
            },
            {
                "$push": {
                    "follow_requests": sender_email
                }
            }
        )

        print("✅ MODIFIED:", result.modified_count)

        return result.modified_count > 0

    except Exception as e:

        print("❌ SEND REQUEST ERROR:", str(e))

        return False


# 🔥 ACCEPT FOLLOW REQUEST
def accept_follow_request(user_email, follower_email):

    try:

        user = users_collection.find_one({
            "email": user_email
        })

        follower = users_collection.find_one({
            "email": follower_email
        })

        if not user or not follower:
            return False

        # 🔥 REMOVE REQUEST
        users_collection.update_one(
            {
                "email": user_email
            },
            {
                "$pull": {
                    "follow_requests": follower_email
                }
            }
        )

        # 🔥 ADD FOLLOWER
        users_collection.update_one(
            {
                "email": user_email
            },
            {
                "$addToSet": {
                    "followers": follower_email
                }
            }
        )

        # 🔥 ADD FOLLOWING
        users_collection.update_one(
            {
                "email": follower_email
            },
            {
                "$addToSet": {
                    "following": user_email
                }
            }
        )

        return True

    except Exception as e:

        print(
            "❌ ACCEPT REQUEST ERROR:",
            str(e)
        )

        return False


# 🔥 REJECT FOLLOW REQUEST
def reject_follow_request(user_email, follower_email):

    try:

        users_collection.update_one(
            {
                "email": user_email
            },
            {
                "$pull": {
                    "follow_requests": follower_email
                }
            }
        )

        return True

    except Exception as e:

        print(
            "❌ REJECT REQUEST ERROR:",
            str(e)
        )

        return False


# 🔥 UNFOLLOW USER
def unfollow_user(user_email, target_email):

    try:

        # 🔥 REMOVE FROM CURRENT USER FOLLOWING
        users_collection.update_one(
            {
                "email": user_email
            },
            {
                "$pull": {
                    "following": target_email
                }
            }
        )

        # 🔥 REMOVE FROM TARGET USER FOLLOWERS
        users_collection.update_one(
            {
                "email": target_email
            },
            {
                "$pull": {
                    "followers": user_email
                }
            }
        )

        return True

    except Exception as e:

        print(
            "❌ UNFOLLOW ERROR:",
            str(e)
        )

        return False
    
# 🔥 REMOVE FOLLOWER
def remove_follower(
user_email,
follower_email
):

    try:

        users_collection.update_one(
            {
                "email": user_email
            },
            {
                "$pull": {
                    "followers": follower_email
                }
            }
        )

        users_collection.update_one(
            {
                "email": follower_email
            },
            {
                "$pull": {
                    "following": user_email
                }
            }
        )

        return True

    except Exception as e:

        print(
            "REMOVE FOLLOWER ERROR:",
            str(e)
        )

        return False