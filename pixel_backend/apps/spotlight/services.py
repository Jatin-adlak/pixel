from config.db import spotlight_collection, fs
from bson import ObjectId
from datetime import datetime
import os

BACKEND_URL = os.getenv(
    "BACKEND_URL",
    "http://127.0.0.1:8000"
    )

def create_spotlight(data):

    poster_url=""

    poster=data.get("poster")


    if poster:

        file_id=fs.put(

            poster,

            filename=poster.name,

            content_type=poster.content_type

        )

        poster_url=f"{BACKEND_URL}/api/images/file/{file_id}/"


    item={

        "name":
            data.get("name"),

        "description":
            data.get("description"),

        "date":
            data.get("date"),

        "time":
            data.get("time"),

        "venue":
            data.get("venue"),

        "guests":
            data.get(
                "guests",
                []
            ),

        "form_link":
            data.get(
                "form_link",
                ""
            ),

        "poster":
            poster_url,

        "created_at":
            datetime.now()

    }


    result=spotlight_collection.insert_one(
        item
    )

    item["_id"]=str(
        result.inserted_id
    )

    return item



def get_spotlights():

    data=[]

    for item in spotlight_collection.find():

        item["_id"]=str(
            item["_id"]
        )

        data.append(
            item
        )

    return data



def delete_spotlight(id):

    spotlight_collection.delete_one({

        "_id":
            ObjectId(id)

    })



def edit_spotlight(id,data):

    update_data={

        "name":
            data.get("name"),

        "description":
            data.get("description"),

        "date":
            data.get("date"),

        "time":
            data.get("time"),

        "venue":
            data.get("venue"),

        "guests":
            data.get(
                "guests",
                []
            ),
        "form_link":
            data.get(
                "form_link",
                ""
            ),

    }


    poster=data.get(
        "poster"
    )

    if poster:

        file_id=fs.put(

            poster,

            filename=poster.name,

            content_type=poster.content_type

        )

        update_data[

            "poster"

        ]=f"{BACKEND_URL}/api/images/file/{file_id}/"


    spotlight_collection.update_one(

        {

            "_id":
            ObjectId(id)

        },

        {

            "$set":
            update_data

        }

    )


    updated=spotlight_collection.find_one({

        "_id":
        ObjectId(id)

    })


    updated["_id"]=str(
        updated["_id"]
    )

    return updated