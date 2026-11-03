
import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from config.db import users_collection


class MongoJWTUser:
    """Lightweight authenticated-user object for MongoDB users."""

    def __init__(self, document):
        self.document = document
        self.email = document.get("email")
        self.is_authenticated = True
        self.is_anonymous = False
        self.is_staff = False
        self.is_superuser = False

    def __getattr__(self, name):
        return self.document.get(name)


class MongoJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = request.headers.get("Authorization", "")

        if not header:
            return None

        parts = header.split()

        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise AuthenticationFailed("Invalid authorization header.")

        token = parts[1]

        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=["HS256"],
                options={"require": ["exp", "iat", "sub", "type"]},
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Access token expired.")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid access token.")

        if payload.get("type") != "access":
            raise AuthenticationFailed("Access token required.")

        email = payload.get("sub")
        user = users_collection.find_one({"email": email})

        if not user:
            raise AuthenticationFailed("User no longer exists.")

        return MongoJWTUser(user), payload
