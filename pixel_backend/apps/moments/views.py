from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.core.files.storage import default_storage
from django.conf import settings

from datetime import datetime
from bson import ObjectId

from .services import *


@api_view(['GET'])
def get_moments(request):

    return Response(
        get_all_moments()
    )


@api_view(['POST'])
def create_moment(request):

    title=request.data.get(
        "title"
    )

    caption=request.data.get(
        "caption"
    )

    created_by=request.data.get(
        "created_by"
    )

    video=request.FILES.get(
        "video"
    )

    cover=request.FILES.get(
        "cover"
    )

    if not video:

        return Response(
            {
                "error":
                "Video required"
            },
            status=400
        )


    video_path=default_storage.save(

        f"moments/{video.name}",
        video

    )

    cover_path=""

    if cover:

        cover_path=default_storage.save(

            f"moments/{cover.name}",
            cover

        )


    moment={

        "title":title,

        "caption":caption,

        "video_url":
        settings.MEDIA_URL+
        video_path,

        "cover_url":
        settings.MEDIA_URL+
        cover_path,

        "likes":[],

        "comments":[],

        "shares":0,

        "views":0,

        "created_by":
        created_by,

        "created_at":
        str(
        datetime.now()
        )

    }


    moment=create_moment_db(
        moment
    )

    return Response(
        moment
    )


@api_view(['DELETE'])
def delete_moment(
request,
id
):

    delete_moment_db(id)

    return Response({

        "message":
        "Deleted"

    })

@api_view(['POST'])
def like_moment(request):

    moment_id=request.data.get(
        "moment_id"
    )

    email=request.data.get(
        "email"
    )

    moment= moments_collection.find_one({

        "_id":
        ObjectId(moment_id)

    })


    likes=moment.get(
        "likes",
        []
    )


    if email in likes:

        moments_collection.update_one(

        {
        "_id":
        ObjectId(moment_id)
        },

        {
        "$pull":{
        "likes":email
        }
        }

        )

    else:

        moments_collection.update_one(

        {
        "_id":
        ObjectId(moment_id)
        },

        {
        "$push":{
        "likes":email
        }
        }

        )


    updated=moments_collection.find_one({

    "_id":
    ObjectId(moment_id)

    })

    updated["_id"]=str(
    updated["_id"]
    )

    return Response(
    updated
    )



@api_view(['POST'])
def comment_moment(request):

    moment_id=request.data.get(
        "moment_id"
    )

    email=request.data.get(
        "email"
    )

    text=request.data.get(
        "text"
    )


    comment={

    "email":email,

    "text":text

    }


    moments_collection.update_one(

    {

    "_id":
    ObjectId(moment_id)

    },

    {

    "$push":{

    "comments":
    comment

    }

    }

    )


    updated=moments_collection.find_one({

    "_id":
    ObjectId(moment_id)

    })

    updated["_id"]=str(
    updated["_id"]
    )

    return Response(
    updated
    )