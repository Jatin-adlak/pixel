from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

from .services import (
    get_posts,
    create_post,
    delete_post,
    toggle_like,
    add_comment,
    delete_comment
)


# 🔥 FETCH POSTS
@api_view(['GET'])
def fetch_posts(request):
    try:
        posts = get_posts()
        return Response(posts, status=status.HTTP_200_OK)
    except Exception as e:
        print("❌ Fetch posts error:", e)
        return Response({"error": str(e)}, status=500)


# 🔥 CREATE POST
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def add_post(request):
    try:
        file = request.FILES.get("image")

        print("📥 Creating post...")

        post = create_post(file, request.data)

        if not post:
            return Response(
                {"error": "Post creation failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(post, status=status.HTTP_201_CREATED)

    except Exception as e:
        print("❌ Create post error:", e)
        return Response({"error": str(e)}, status=500)


# 🔥 DELETE POST (NEW)
@api_view(['DELETE'])
def delete_post_view(request, post_id):
    try:
        result = delete_post(post_id)

        if not result:
            return Response({"error": "Post not found"}, status=404)

        return Response({"message": "Post deleted successfully"})

    except Exception as e:
        print("❌ Delete post error:", e)
        return Response({"error": str(e)}, status=500)
    
# 🔥 LIKE POST
@api_view(['POST'])
def like_post(request, post_id):
    try:

        user_email = request.data.get("email")

        result = toggle_like(post_id, user_email)

        if not result:
            return Response(
                {"error": "Post not found"},
                status=404
            )

        return Response(result)

    except Exception as e:
        print("❌ Like post error:", e)

        return Response(
            {"error": str(e)},
            status=500
        )
    
# 🔥 ADD COMMENT
@api_view(['POST'])
def comment_post(request, post_id):
    try:

        user_name = request.data.get("user")
        text = request.data.get("text")

        if not text:
            return Response(
                {"error": "Comment required"},
                status=400
            )

        comments = add_comment(
            post_id,
            user_name,
            text
        )

        if comments is None:
            return Response(
                {"error": "Post not found"},
                status=404
            )

        return Response({
            "comments": comments
        })

    except Exception as e:
        print("❌ Comment post error:", e)

        return Response(
            {"error": str(e)},
            status=500
        )
    
# 🔥 DELETE COMMENT
@api_view(['DELETE'])
def delete_comment_view(request, post_id, comment_index):
    try:

        comments = delete_comment(
            post_id,
            int(comment_index)
        )

        if comments is None:
            return Response(
                {"error": "Comment not found"},
                status=404
            )

        return Response({
            "comments": comments
        })

    except Exception as e:
        print("❌ Delete comment error:", e)

        return Response(
            {"error": str(e)},
            status=500
        )