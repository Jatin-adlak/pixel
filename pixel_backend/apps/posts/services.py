from config.db import posts_collection, fs
from bson import ObjectId
from datetime import datetime

import os

BACKEND_URL = os.getenv(
    "BACKEND_URL",
    "http://127.0.0.1:8000"
    )

# 🔥 GET POSTS
def get_posts():
    posts = list(posts_collection.find())

    result = []

    for post in posts:
        file_id = post.get("file_id")

        result.append({
            "_id": str(post["_id"]),
            "title": post.get("title"),
            "text": post.get("text"),

            # 🔥 FIXED URL
            "image_url": f"{BACKEND_URL}/api/images/file/{file_id}/" if file_id else None,

            # 🔥 SIMPLE COUNT
            "likes": post.get("likes", 0),
            "liked_by": post.get("liked_by", []),

            "comments": post.get("comments", []),
            "created_at": post.get("created_at")
        })

    return result


# 🔥 CREATE POST
def create_post(file, data):
    try:
        file_id = None

        if file:
            file_bytes = file.read()

            file_id = fs.put(
                file_bytes,
                filename=file.name,
                content_type=file.content_type
            )

        post = {
            "title": data.get("title"),
            "text": data.get("caption"),   # keep your mapping
            "file_id": str(file_id) if file_id else None,

            # 🔥 SIMPLE INTEGER COUNT
            "likes": 0,
            "liked_by": [],

            "comments": [],
            "created_at": datetime.utcnow()
        }

        result = posts_collection.insert_one(post)

        post["_id"] = str(result.inserted_id)

        return post

    except Exception as e:
        print("❌ Create post error:", e)
        return None


# 🔥 TOGGLE LIKE COUNT
def toggle_like(post_id, user_email):
    try:

        post = posts_collection.find_one({
            "_id": ObjectId(post_id)
        })

        if not post:
            return None

        likes = post.get("likes", 0)
        liked_by = post.get("liked_by", [])

        if user_email in liked_by:

            liked_by.remove(user_email)

            likes = max(likes - 1, 0)

            liked = False

        else:

            liked_by.append(user_email)

            likes += 1

            liked = True

        posts_collection.update_one(
            {"_id": ObjectId(post_id)},
            {
                "$set": {
                    "likes": likes,
                    "liked_by": liked_by
                }
            }
        )

        return {
            "liked": liked,
            "likes": likes
        }

    except Exception as e:
        print("❌ Like error:", e)
        return None
    
# 🔥 ADD COMMENT
def add_comment(post_id, user_name, text):
    try:

        post = posts_collection.find_one({
            "_id": ObjectId(post_id)
        })

        if not post:
            return None

        comments = post.get("comments", [])

        comments.append({
            "user": user_name,
            "text": text,
            "created_at": datetime.utcnow()
        })

        posts_collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": {"comments": comments}}
        )

        return comments

    except Exception as e:
        print("❌ Comment error:", e)
        return None

# 🔥 DELETE COMMENT
def delete_comment(post_id, comment_index):
    try:

        post = posts_collection.find_one({
            "_id": ObjectId(post_id)
        })

        if not post:
            return None

        comments = post.get("comments", [])

        if (
            comment_index < 0 or
            comment_index >= len(comments)
        ):
            return None

        comments.pop(comment_index)

        posts_collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": {"comments": comments}}
        )

        return comments

    except Exception as e:
        print("❌ Delete comment error:", e)
        return None

# 🔥 DELETE POST (NEW)
def delete_post(post_id):
    try:
        post = posts_collection.find_one({"_id": ObjectId(post_id)})

        if not post:
            return False

        # 🔥 DELETE IMAGE FROM GRIDFS
        if post.get("file_id"):
            try:
                fs.delete(ObjectId(post["file_id"]))
            except Exception as e:
                print("GridFS delete error:", e)

        # 🔥 DELETE FROM DB
        posts_collection.delete_one({"_id": ObjectId(post_id)})

        return True

    except Exception as e:
        print("❌ Delete post error:", e)
        return False
    
