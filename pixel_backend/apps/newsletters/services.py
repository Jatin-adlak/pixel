from config.db import newsletters_collection

def create(data):
    newsletter = {
        "title": data.get("title"),
        "cover": data.get("cover"),
        "pdf": data.get("pdf")
    }

    result = newsletters_collection.insert_one(newsletter)
    newsletter["_id"] = result.inserted_id
    return newsletter


def fetch():
    newsletters = list(newsletters_collection.find())

    for n in newsletters:
        n["_id"] = str(n["_id"])

    return newsletters