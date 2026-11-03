import { API_ORIGIN } from "../config/env"

import { useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Bookmark,
  X
} from "lucide-react"

export default function ImageViewer({
  images,
  index,
  setViewer,
  hideDownload = false
}) {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("pixelUser"))
    } catch {
      return null
    }
  })()

  const getPhoto = (item) => {
    if (typeof item === "string") {
      return {
        preview: item,
        full: item,
        name: "photo.jpg"
      }
    }

    return {
      preview: item?.preview || item?.thumbnail || item?.full || item?.full_size || "",
      full: item?.full || item?.full_size || item?.preview || item?.thumbnail || "",
      name: item?.name || "photo.jpg"
    }
  }

  const photo = getPhoto(images[index])
  const image = photo.full

  const [saved, setSaved] = useState(
    (user?.saved_images || []).includes(image)
  )
  const [fullLoaded, setFullLoaded] = useState(false)
  const [fullFailed, setFullFailed] = useState(false)

  // Update bookmark and image-loading state when the selected photo changes.
  useEffect(() => {
    setSaved((user?.saved_images || []).includes(image))
    setFullLoaded(false)
    setFullFailed(false)
  }, [image])

  // Preload the original without blocking the preview.
  useEffect(() => {
    if (!image || image === photo.preview) {
      setFullLoaded(true)
      return
    }

    let cancelled = false
    const preload = new Image()

    preload.onload = () => {
      if (!cancelled) setFullLoaded(true)
    }

    preload.onerror = () => {
      if (!cancelled) setFullFailed(true)
    }

    preload.src = image

    return () => {
      cancelled = true
      preload.onload = null
      preload.onerror = null
    }
  }, [image, photo.preview])

  // Keyboard navigation.
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") {
        setViewer((prev) => (prev + 1) % images.length)
      }

      if (e.key === "ArrowLeft") {
        setViewer((prev) => (prev - 1 + images.length) % images.length)
      }

      if (e.key === "Escape") {
        setViewer(null)
      }
    }

    window.addEventListener("keydown", handleKey)

    return () => window.removeEventListener("keydown", handleKey)
  }, [images.length, setViewer])

  const nextImage = () => {
    setViewer((index + 1) % images.length)
  }

  const prevImage = () => {
    setViewer((index - 1 + images.length) % images.length)
  }

  // Bookmark the original image URL.
  const toggleSave = async () => {
    if (!user) {
      alert("Login to bookmark images")
      return
    }

    try {
      const res = await fetch(
        `${API_ORIGIN}/api/users/save-image/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: user.email,
            image_url: image
          })
        }
      )

      if (!res.ok) {
        throw new Error(`Bookmark request failed: ${res.status}`)
      }

      const data = await res.json()

      const updatedUser = {
        ...user,
        saved_images: data.saved_images || []
      }

      localStorage.setItem("pixelUser", JSON.stringify(updatedUser))
      window.dispatchEvent(new Event("storage"))

      setSaved(Boolean(data.saved))
    } catch (err) {
      console.error("Save image error:", err)
    }
  }

  // Download the original-quality image.
  const handleDownload = async () => {
    if (!image) return

    if (image.includes("res.cloudinary.com")) {
      const link = document.createElement("a")
      link.href = image.replace("/upload/", "/upload/fl_attachment/")
      link.download = photo.name || "photo.jpg"
      link.click()
      return
    }

    try {
      const response = await fetch(image)

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = photo.name || "photo.jpg"

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      console.error("Download error:", err)
      window.open(image, "_blank", "noopener,noreferrer")
    }
  }

  if (!photo.preview && !image) return null

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 px-4">

      {/* CLOSE BUTTON */}
      <button
        onClick={() => setViewer(null)}
        className="absolute top-5 right-5 z-50 text-white hover:text-red-500 transition"
        aria-label="Close viewer"
      >
        <X size={30} />
      </button>

      {/* IMAGE + ACTIONS */}
      <div className="relative group flex flex-col items-center">

        {/* PREVIEW FIRST, ORIGINAL WHEN READY */}
        <img
          key={photo.preview}
          src={fullLoaded && !fullFailed ? image : photo.preview}
          alt={photo.name}
          className="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
        />

        {!fullLoaded && !fullFailed && image !== photo.preview && (
          <p className="absolute bottom-3 text-xs text-white/70 bg-black/60 px-3 py-1 rounded-full">
            Loading full-resolution image…
          </p>
        )}

        {fullFailed && image !== photo.preview && (
          <p className="absolute bottom-3 text-xs text-white/70 bg-black/60 px-3 py-1 rounded-full">
            Showing preview — original could not be loaded.
          </p>
        )}

        {/* MOBILE ACTION BAR */}
        <div className="flex md:hidden justify-center gap-4 mt-5">
          {!hideDownload && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full border border-white/10"
            >
              <Download size={18} />
              <span>Download</span>
            </button>
          )}

          <button
            onClick={toggleSave}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition ${
              saved
                ? "bg-blue-600 text-white"
                : "bg-black text-white border border-white/10"
            }`}
          >
            <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
            <span>Save</span>
          </button>
        </div>

        {/* DESKTOP DYNAMIC ISLAND */}
        <div className="hidden md:flex absolute top-8 left-1/2 -translate-x-1/2 items-center justify-center bg-black/90 text-white rounded-full overflow-hidden backdrop-blur-xl border border-white/10 transition-all duration-300 md:w-3 md:opacity-0 md:group-hover:w-44 md:group-hover:opacity-100 h-11 shadow-xl">
          <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition duration-300">
            {!hideDownload && (
              <>
                <button onClick={handleDownload} className="hover:text-blue-500 transition" aria-label="Download image">
                  <Download size={20} />
                </button>
                <span className="text-gray-500">|</span>
              </>
            )}

            <button
              onClick={toggleSave}
              className={`hover:text-blue-500 transition ${saved ? "text-blue-500" : ""}`}
              aria-label="Bookmark image"
            >
              <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      {/* PREVIOUS */}
      <button
        onClick={prevImage}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-white bg-black/50 p-3 rounded-full hover:bg-black/80 transition backdrop-blur-md"
        aria-label="Previous photo"
      >
        <ChevronLeft size={32} />
      </button>

      {/* NEXT */}
      <button
        onClick={nextImage}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-white bg-black/50 p-3 rounded-full hover:bg-black/80 transition backdrop-blur-md"
        aria-label="Next photo"
      >
        <ChevronRight size={32} />
      </button>

      {/* BACKDROP */}
      <div
        onClick={() => setViewer(null)}
        className="absolute inset-0 -z-10"
      />
    </div>
  )
}
