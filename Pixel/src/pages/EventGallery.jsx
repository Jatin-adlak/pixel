import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import ImageViewer from "./ImageViewer"
import { getImages } from "../api/api"

export default function EventGallery(){

  const user = JSON.parse(localStorage.getItem("pixelUser"))
  const navigate = useNavigate()
  const { id } = useParams()

  const [images,setImages] = useState([])
  const [viewer,setViewer] = useState(null)
  const [searching,setSearching] = useState(false)

  /* 🔥 LOAD IMAGES */

  useEffect(() => {

    if(!id){
      console.log("❌ Event ID is undefined")
      return
    }

    const loadImages = async () => {
      try {

        console.log("📡 Fetching images for:", id)

        const data = await getImages(id)

        const formatted = (data || [])
          .map(img => {
            if (typeof img === "string") return img
            if (img?.url) return img.url
            return null
          })
          .filter(Boolean)

        setImages(formatted)

      } catch (err) {
        console.error("❌ Error fetching images:", err)
        setImages([])
      }
    }

    loadImages()

  }, [id])


  /* 🔥 FIND MY PHOTOS */

  const handleFindMyPhotos = async () => {

    if(!user){
      alert("Login required")
      return
    }

    if(!id){
      alert("Invalid event")
      return
    }

    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"

    input.onchange = async (e) => {

      const file = e.target.files[0]
      if(!file) return

      try {

        setSearching(true)

        const formData = new FormData()
        formData.append("image", file)

        const res = await fetch(
          `http://127.0.0.1:8000/api/face/find/${id}/`,
          {
            method: "POST",
            body: formData
          }
        )

        if (!res.ok) {
          const errText = await res.text()
          console.error("❌ FACE API ERROR:", errText)
          alert("Error finding photos")
          return
        }

        const data = await res.json()

        if(!data?.matchedImages || data.matchedImages.length === 0){
          alert("No matching photos found")
          return
        }

        const formatted = data.matchedImages
          .map(img => typeof img === "string" ? img : img?.url)
          .filter(Boolean)

        setImages(formatted)

      } catch(err){
        console.error("❌ FIND ERROR:", err)
        alert("Error finding photos")
      } finally {
        setSearching(false)
      }

    }

    input.click()
  }


  return(

    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">

      {/* HEADER */}

      <div className="max-w-6xl mx-auto px-6 pt-24 flex justify-between items-center">

        <h1 className="text-2xl font-headersfont">
          Event Photos
        </h1>

        {user && (
          <button
            onClick={handleFindMyPhotos}
            className="px-4 py-2 rounded-3xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition font-buttonsfont"
          >
            {searching ? "Searching..." : "Find My Photos"}
          </button>
        )}

      </div>

      {/* IMAGES */}

      <div className="max-w-6xl mx-auto px-6 mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {images.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center">
            No images found for this event.
          </p>
        ) : (

          images.map((img,i)=>(

            <div key={i} className="relative group cursor-pointer">

              <img
                src={img}
                onClick={()=> user && setViewer(i)}
                className={`rounded-lg object-cover w-full h-64
                ${!user ? "blur-sm brightness-75" : ""}
                `}
                onError={(e)=>{
                  e.target.src = none
                }}
              />

              {/* LOGIN OVERLAY */}
              {!user && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                  <p className="text-white text-sm font-buttonsfont">
                    Login to View
                  </p>
                </div>
              )}

              {/* DOWNLOAD */}
              {user && (
                <button
                  onClick={async ()=>{
                    try{
                      const res = await fetch(img)
                      const blob = await res.blob()

                      const url = window.URL.createObjectURL(blob)

                      const a = document.createElement("a")
                      a.href = url
                      a.download = "photo.jpg"
                      document.body.appendChild(a)
                      a.click()
                      a.remove()

                      window.URL.revokeObjectURL(url)
                    }catch(err){
                      console.error("Download error:", err)
                    }
                  }}
                  className="
                  absolute top-2 right-2
                  bg-black/70 text-white text-xs px-3 py-1
                  rounded-3xl
                  opacity-100 md:opacity-0 md:group-hover:opacity-100
                  transition
                  "
                >
                  Download
                </button>
              )}

            </div>

          ))

        )}

      </div>

      {/* VIEWER */}

      {viewer !== null && images[viewer] && (
        <ImageViewer
          images={images}
          index={viewer}
          setViewer={setViewer}
        />
      )}

    </div>

  )

}