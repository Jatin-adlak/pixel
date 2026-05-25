from rest_framework.decorators import api_view
from rest_framework.response import Response
from bson import ObjectId

from django.core.files.storage import default_storage
from django.conf import settings

from pymongo import MongoClient

client = MongoClient(
"mongodb://localhost:27017/"
)

db = client["pixel"]

newsletters_collection = db["newsletters"]


# GET NEWSLETTERS

@api_view(['GET'])
def get_newsletters(request):

    newsletters=list(
        newsletters_collection.find()
    )

    for n in newsletters:

        n["_id"]=str(
            n["_id"]
        )

    return Response(
        newsletters
    )


# UPLOAD

@api_view(['POST'])
def upload_newsletter(request):

    title=request.data.get(
        "title"
    )

    cover=request.FILES.get(
        "cover"
    )

    pdf=request.FILES.get(
        "pdf"
    )

    if not title:

        return Response(
            {"error":"Title required"},
            status=400
        )

    if not cover or not pdf:

        return Response(
            {
            "error":
            "Cover and PDF required"
            },
            status=400
        )

    cover_path=default_storage.save(
        f"newsletters/{cover.name}",
        cover
    )

    pdf_path=default_storage.save(
        f"newsletters/{pdf.name}",
        pdf
    )

    newsletter={

        "title":title,

        "cover":
        settings.MEDIA_URL +
        cover_path,

        "pdf":
        settings.MEDIA_URL +
        pdf_path

    }

    result=newsletters_collection.insert_one(
        newsletter
    )

    newsletter["_id"]=str(
        result.inserted_id
    )

    return Response(
        newsletter
    )


# EDIT

@api_view(['PUT'])
def edit_newsletter(
request,
id
):

    update_data={}

    title=request.data.get(
        "title"
    )

    if title:

        update_data["title"]=title


    cover=request.FILES.get(
        "cover"
    )

    if cover:

        cover_path=default_storage.save(
            f"newsletters/{cover.name}",
            cover
        )

        update_data["cover"]=(
            settings.MEDIA_URL +
            cover_path
        )


    pdf=request.FILES.get(
        "pdf"
    )

    if pdf:

        pdf_path=default_storage.save(
            f"newsletters/{pdf.name}",
            pdf
        )

        update_data["pdf"]=(
            settings.MEDIA_URL +
            pdf_path
        )


    newsletters_collection.update_one(

        {
            "_id":
            ObjectId(id)
        },

        {
            "$set":
            update_data
        }

    )

    return Response({

        "message":"Updated"

    })


# DELETE

@api_view(['DELETE'])
def delete_newsletter(
request,
id
):

    newsletters_collection.delete_one(

        {
            "_id":
            ObjectId(id)
        }

    )

    return Response({

        "message":"Deleted"

    })