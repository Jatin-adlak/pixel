import requests

from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.images.services import get_images


@api_view(['POST'])
def find_photos(request, event_id):
    try:
        image = request.FILES.get("image")

        if not image:
            return Response({"error": "No image uploaded"}, status=400)

        # 🔥 CALL FASTAPI
        res = requests.post(
            f"http://127.0.0.1:5001/search",
            files={"file": image},
            data={"event_id": str(event_id)}
        )

        print("Face service status:", res.status_code)
        print("Face service response:", res.text)

        if res.status_code != 200:
            return Response({
                "error": "Face service error",
                "details": res.text
            }, status=500)

        matched_urls = res.json().get("matches", [])

        # 🔥 RETURN DIRECTLY (IMPORTANT CHANGE)
        return Response({
            "matchedImages": matched_urls
        })

    except Exception as e:
        print("❌ FACE SEARCH ERROR:", str(e))
        return Response({"error": str(e)}, status=500)