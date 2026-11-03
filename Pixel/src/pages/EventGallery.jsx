
import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import ImageViewer from "./ImageViewer"
import { getEventGallery } from "../api/api"

export default function EventGallery() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("pixelUser"))
    } catch {
      return null
    }
  })()

  const { eventSlug } = useParams()

  const [event, setEvent] = useState(null)
  const [photos, setPhotos] = useState([])
  const [viewer, setViewer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [downloading, setDownloading] = useState({})

  useEffect(() => {
    if (!eventSlug) {
      setError("Invalid event")
      setLoading(false)
      return
    }

    let cancelled = false

    const loadGallery = async () => {
      try {
        setLoading(true)
        setError("")

        const data = await getEventGallery(eventSlug)

        if (cancelled) return

        setEvent(data)
        setPhotos(Array.isArray(data.photos) ? data.photos : [])
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching gallery:", err)
          setError(err.message || "Could not load this gallery")
          setPhotos([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadGallery()

    return () => {
      cancelled = true
    }
  }, [eventSlug])

  // Keep both URLs so the viewer can use the preview first.
  const imageUrls = photos.map((photo) => ({
    preview: photo.thumbnail || photo.full_size,
    full: photo.full_size || photo.thumbnail,
    name: photo.name || "photo.jpg",
  }))

  const handleFindMyPhotosComingSoon = () => {
    alert(
      "📸 Find My Photos\n\n" +
      "This feature is coming soon!\n\n" +
      "We are working on bringing AI-powered photo finding to PIXEL."
    )
  }

  const handleDownload = async (photo, index) => {
    const imageUrl = photo.full_size || photo.thumbnail

    if (!imageUrl) {
      alert("Image URL is unavailable.")
      return
    }

    setDownloading((previous) => ({
      ...previous,
      [index]: true,
    }))

    try {
      const response = await fetch(imageUrl)

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement("a")

      anchor.href = objectUrl
      anchor.download = photo.name || "photo.jpg"

      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()

      // Keep the temporary URL alive long enough for the download to start.
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    } catch (err) {
      console.error("Download error:", err)
      // Direct navigation fallback if the remote server blocks fetch/CORS.
      window.open(imageUrl, "_blank", "noopener,noreferrer")
    } finally {
      setDownloading((previous) => ({
        ...previous,
        [index]: false,
      }))
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-6 pt-24 flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-headersfont">
            {event?.title || "Event Photos"}
          </h1>

          {event?.date && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {event.date}
            </p>
          )}

          {event?.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 max-w-3xl">
              {event.description}
            </p>
          )}
        </div>

        {user && (
          <button
            onClick={handleFindMyPhotosComingSoon}
            className="px-4 py-2 rounded-3xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition font-buttonsfont shrink-0"
          >
            Find My Photos
          </button>
        )}
      </div>

      {/* PHOTO GRID */}
      <div className="max-w-6xl mx-auto px-6 mt-10 pb-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <p className="text-gray-500 col-span-full text-center">
            Loading gallery…
          </p>
        ) : error ? (
          <p className="text-red-500 col-span-full text-center">
            {error}
          </p>
        ) : photos.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center">
            No images found for this event.
          </p>
        ) : (
          photos.map((photo, i) => (
            <div
              key={photo.id || i}
              className="relative group overflow-hidden rounded-lg bg-neutral-900"
            >
              <button
                type="button"
                onClick={() => user && setViewer(i)}
                className="block w-full cursor-pointer"
                aria-label={`View ${photo.name || "event photo"}`}
              >
                <img
                  src={photo.thumbnail || photo.full_size}
                  alt={photo.name || "Event photo"}
                  loading={i < 4 ? "eager" : "lazy"}
                  decoding="async"
                  className={`rounded-lg object-cover w-full h-64 ${
                    !user ? "blur-sm brightness-75" : ""
                  }`}
                  onError={(e) => {
                    // Avoid repeatedly retrying a failing image URL.
                    e.currentTarget.onerror = null
                    e.currentTarget.style.visibility = "hidden"
                  }}
                />
              </button>

              {!user && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg pointer-events-none">
                  <p className="text-white text-sm font-buttonsfont">
                    Login to View
                  </p>
                </div>
              )}

              {user && (
                <button
                  onClick={() => handleDownload(photo, i)}
                  disabled={downloading[i]}
                  className="absolute top-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded-3xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition disabled:opacity-70"
                >
                  {downloading[i] ? "Downloading..." : "Download"}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* FULL-SIZE VIEWER */}
      {viewer !== null && imageUrls[viewer] && (
        <ImageViewer
          images={imageUrls}
          index={viewer}
          setViewer={setViewer}
        />
      )}
    </div>
  )
}
