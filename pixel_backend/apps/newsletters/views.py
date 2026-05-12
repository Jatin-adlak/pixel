from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services import create, fetch

@api_view(['POST'])
def create_data(request):
    data = create(request.data)
    data["_id"] = str(data["_id"])
    return Response(data)


@api_view(['GET'])
def fetch_data(request):
    return Response(fetch())