from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services import *


@api_view(["POST"])
def upload_spotlight(request):

    spotlight= create_spotlight({

        "name":
            request.data.get(
                "name"
            ),

        "description":
            request.data.get(
                "description"
            ),

        "date":
            request.data.get(
                "date"
            ),

        "time":
            request.data.get(
                "time"
            ),

        "venue":
            request.data.get(
                "venue"
            ),

        "guests":
            request.data.get(
                "guests"
            ).split(","),

        "form_link":
            request.data.get(
                "form_link"
            ),

        "poster":
            request.data.get(
                "poster"
            )

    })

    return Response(
        spotlight
    )



@api_view(["GET"])
def fetch_spotlights(request):

    return Response(
        get_spotlights()
    )



@api_view(["DELETE"])
def remove_spotlight(
request,
id
):

    delete_spotlight(id)

    return Response({
        "message":"Deleted"
    })



@api_view(["PUT"])
def update_spotlight(
request,
id
):

    updated=edit_spotlight(

        id,

        {

        "name":
        request.data.get(
            "name"
        ),

        "description":
        request.data.get(
            "description"
        ),

        "date":
        request.data.get(
            "date"
        ),

        "time":
        request.data.get(
            "time"
        ),

        "venue":
        request.data.get(
            "venue"
        ),

        "guests":
        request.data.get(
            "guests"
        ).split(","),

        "form_link":
            request.data.get(
                "form_link"
            ),

        "poster":
        request.data.get(
            "poster"
        )

        }

    )

    return Response(
        updated
    )