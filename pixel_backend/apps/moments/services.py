from pymongo import MongoClient
from bson import ObjectId

client = MongoClient(
"mongodb+srv://pixeladmin:Pixel%402026@cluster0.abazyvl.mongodb.net/"
)

db = client["pixel_db"]

moments_collection = db["moments"]


def get_all_moments():

    moments=list(
        moments_collection.find()
    )

    for m in moments:

        m["_id"]=str(
            m["_id"]
        )

    return moments


def create_moment_db(moment):

    result= moments_collection.insert_one(
        moment
    )

    moment["_id"]=str(
        result.inserted_id
    )

    return moment


def delete_moment_db(id):

    moments_collection.delete_one(

        {
            "_id":
            ObjectId(id)
        }

    )