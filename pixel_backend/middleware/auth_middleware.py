from django.http import JsonResponse
import jwt
import os

SECRET = os.getenv("JWT_SECRET")

def auth_middleware(get_response):
    def middleware(request):
        auth_header = request.headers.get('Authorization')

        if auth_header:
            try:
                token = auth_header.split(" ")[1]
                decoded = jwt.decode(token, SECRET, algorithms=["HS256"])
                request.user_id = decoded["user_id"]
            except:
                return JsonResponse({"error": "Invalid token"}, status=401)

        return get_response(request)

    return middleware