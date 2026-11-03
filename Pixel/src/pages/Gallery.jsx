import { API_ORIGIN } from "../config/env"

import { useNavigate } from "react-router-dom"
import { useRef, useState, useEffect } from "react"
import { getEventCatalog } from "../api/api"

export default function Gallery() {
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [search, setSearch] = useState("")
  const sectionRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)

  /* LOAD EVENTS */
  useEffect(() => {
    getEventCatalog()
      .then((data) => {
        console.log("📡 EVENTS:", data)

        const formatted = (data || []).map((event) => {
          let coverUrl = null

          // Priority 1: Backend provides a full cover URL
          if (
            typeof event.cover === "string" &&
            event.cover.startsWith("http")
          ) {
            coverUrl = event.cover
          }
          // Priority 2: cover_url field
          else if (event.cover_url) {
            coverUrl = event.cover_url
          }
          // Priority 3: Build URL from cover file ID
          else if (event.cover) {
            coverUrl = `${API_ORIGIN}/api/events/cover/${event.cover}/`
          }

          // Build Google Drive folder URL from its ID
          const folderId = event.drive_folder_id

          const driveUrl =
            typeof folderId === "string" && folderId.trim()
              ? `https://drive.google.com/drive/folders/${encodeURIComponent(
                  folderId.trim()
                )}`
              : null

          return {
            ...event,
            coverUrl,
            driveUrl,
          }
        })

        setEvents(formatted)
      })
      .catch((err) => {
        console.error("Error fetching events:", err)
        setEvents([])
      })
  }, [])

  /* SEARCH */
  const filteredEvents = events.filter((event) =>
    (event.title || event.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  /* SCROLL NAVIGATOR */
  useEffect(() => {
    const handleScroll = () => {
      filteredEvents.forEach((_, index) => {
        const section = sectionRefs.current[index]
        if (!section) return

        const rect = section.getBoundingClientRect()

        if (rect.top < 200 && rect.bottom > 200) {
          setActiveIndex(index)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [filteredEvents])

  /* OPEN EVENT GALLERY */
  const openEventGallery = (event) => {
    navigate(`/gallery/${event.slug || event._id}`)
  }

  /* KEYBOARD ACCESSIBILITY */
  const handleCardKeyDown = (e, event) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      openEventGallery(event)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-x-hidden">
      <h1 className="text-4xl font-introducing text-center pt-20">
        Event Gallery
      </h1>

      {/* SEARCH */}
      <div className="flex justify-center mt-6 px-4">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setActiveIndex(0)
            sectionRefs.current = []
          }}
          className="
            w-full max-w-2xl px-6 py-3 rounded-full
            bg-white/40 dark:bg-white/10 backdrop-blur-md
            border border-gray-300 dark:border-white/20
            text-black dark:text-white
            placeholder-gray-600 dark:placeholder-gray-300
            shadow-sm focus:outline-none focus:ring-2
            focus:ring-blue-500 transition
          "
        />
      </div>

      {/* EVENTS */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6 md:px-8 mt-16 space-y-24">
        {events.length === 0 ? (
          <p className="text-center text-gray-500">
            No events found.
          </p>
        ) : filteredEvents.length === 0 ? (
          <p className="text-center text-gray-500">
            No matching events.
          </p>
        ) : (
          filteredEvents.map((event, index) => (
            <div
              key={event.slug || event._id}
              ref={(el) => {
                sectionRefs.current[index] = el
              }}
              role="link"
              tabIndex={0}
              aria-label={`Open gallery for ${event.title || event.name}`}
              onClick={() => openEventGallery(event)}
              onKeyDown={(e) => handleCardKeyDown(e, event)}
              className="cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
            >
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={
                    event.coverUrl ||
                    "https://via.placeholder.com/800x400?text=No+Cover"
                  }
                  alt={event.title || event.name || "Event cover"}
                  className="w-full h-56 sm:h-64 object-cover group-hover:scale-110 transition duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src =
                      "https://via.placeholder.com/800x400?text=No+Cover"
                  }}
                />

                {/* EVENT DETAILS AND DRIVE BUTTON */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-4 sm:p-6">
                  <div className="flex items-end justify-between gap-4 w-full">
                    <div className="min-w-0">
                      <h2 className="text-white text-lg sm:text-xl font-semibold">
                        {event.title || event.name}
                      </h2>

                      {event.date && (
                        <p className="text-white/80 text-sm mt-1">
                          {event.date}
                        </p>
                      )}
                    </div>

                    {/* DRIVE BUTTON
                        Stop propagation so this click opens Drive,
                        not the PIXEL EventGallery page.
                    */}
                    {event.driveUrl ? (
                      <a
                        href={event.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="
                          shrink-0 inline-flex items-center gap-2
                          bg-blue-600 hover:bg-blue-700
                          text-white text-sm font-semibold
                          px-4 py-2.5 rounded-full
                          shadow-lg transition
                          focus:outline-none focus:ring-2
                          focus:ring-blue-300
                        "
                        aria-label={`Open Google Drive folder for ${event.title || event.name}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M14 3h7v7" />
                          <path d="M10 14 21 3" />
                          <path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6" />
                        </svg>
                        Drive Link
                      </a>
                    ) : (
                      <span
                        title="No Google Drive folder is configured for this event."
                        onClick={(e) => e.stopPropagation()}
                        className="
                          shrink-0 bg-gray-500/80 text-white/80
                          text-xs sm:text-sm px-3 py-2.5
                          rounded-full cursor-not-allowed
                        "
                      >
                        Drive link unavailable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SIDE NAVIGATOR */}
      {filteredEvents.length > 0 && (
        <div className="hidden md:flex fixed right-5 top-1/2 -translate-y-1/2 flex-col gap-3 z-50">
          {filteredEvents.map((event, index) => (
            <button
              type="button"
              key={event.slug || event._id}
              onClick={() =>
                sectionRefs.current[index]?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                })
              }
              aria-label={`Scroll to ${event.title || event.name}`}
              className={`group relative w-2 h-6 rounded-full cursor-pointer transition ${
                activeIndex === index
                  ? "bg-blue-600"
                  : "bg-neutral-400"
              }`}
            >
              <span
                className="
                  absolute right-6 top-1/2 -translate-y-1/2
                  whitespace-nowrap bg-black text-white text-xs
                  px-2 py-1 rounded opacity-0
                  group-hover:opacity-100 transition
                  pointer-events-none
                "
              >
                {event.title || event.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
