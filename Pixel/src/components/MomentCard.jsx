import { API_ORIGIN } from "../config/env"

import { useState, useRef } from "react"

import {
  likeMoment,
  commentMoment,
} from "../api/api"

import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Download,
} from "lucide-react"

export default function MomentCard({ moment, user }) {
  const [currentMoment, setCurrentMoment] = useState(moment)
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)

  const videoRef = useRef(null)

  const liked = currentMoment?.likes?.includes(user?.email)

  const videoUrl = currentMoment?.video_url
    ? currentMoment.video_url.startsWith("http")
      ? currentMoment.video_url
      : `${API_ORIGIN}${currentMoment.video_url}`
    : ""

  const coverUrl = currentMoment?.cover_url
    ? currentMoment.cover_url.startsWith("http")
      ? currentMoment.cover_url
      : `${API_ORIGIN}${currentMoment.cover_url}`
    : "/fallback.jpg"

  /* PLAY VIDEO ON FIRST CLICK */
  const handlePlay = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      await video.play()
      setIsPlaying(true)
    } catch (error) {
      console.error("Video playback failed:", error)
    }
  }

  const handleLike = async () => {
    if (!user?.email) {
      alert("Please log in to like this moment.")
      return
    }

    try {
      const updated = await likeMoment(
        currentMoment._id,
        user.email
      )

      if (updated) setCurrentMoment(updated)
    } catch (error) {
      console.error("Like failed:", error)
    }
  }

  const handleComment = async () => {
    if (!comment.trim()) return

    if (!user?.email) {
      alert("Please log in to comment.")
      return
    }

    try {
      const updated = await commentMoment(
        currentMoment._id,
        user.email,
        comment
      )

      if (updated) setCurrentMoment(updated)
      setComment("")
    } catch (error) {
      console.error("Comment failed:", error)
    }
  }

  /* SHARE */
  const handleShare = async () => {
    const shareLink =
      `${window.location.origin}/moment/${currentMoment._id}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: currentMoment.title,
          text: currentMoment.caption,
          url: shareLink,
        })
      } else {
        await navigator.clipboard.writeText(shareLink)
        alert("Link copied ✅")
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share failed:", error)
      }
    }
  }

  return (
    <div
      className="
        bg-white dark:bg-neutral-900
        rounded-3xl overflow-hidden
        shadow-lg border
        border-neutral-200 dark:border-neutral-800
      "
    >
      {/* VIDEO
          The video stays mounted, so the first click can start
          playback immediately instead of first replacing the poster.
      */}
      <div
        className="relative bg-black"
        onClick={(event) => {
          // Start playback when clicking the preview area.
          // Let native video controls handle their own clicks.
          if (
            event.target === videoRef.current &&
            videoRef.current?.paused
          ) {
            handlePlay()
          }
        }}
      >
        <video
          ref={videoRef}
          controls
          playsInline
          preload="none"
          poster={coverUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="
            block w-full
            max-h-[700px]
            min-h-[240px]
            object-contain
            bg-black
          "
        >
          {videoUrl && (
            <source src={videoUrl} type="video/mp4" />
          )}

          Your browser does not support video playback.
        </video>

        {/* Custom overlay: one click starts playback */}
        {!isPlaying && (
          <button
            type="button"
            onClick={handlePlay}
            aria-label="Play video"
            className="
              absolute inset-0
              flex items-center justify-center
              bg-black/10
              group
            "
          >
            <span
              className="
                flex items-center justify-center
                w-20 h-20 rounded-full
                bg-white text-blue-600
                shadow-xl text-3xl
                transition-transform
                group-hover:scale-110
              "
            >
              ▶
            </span>
          </button>
        )}
      </div>

      <div className="p-5">
        <h2 className="font-bold text-lg">
          {currentMoment.title}
        </h2>

        <p className="text-gray-500 mt-2">
          {currentMoment.caption}
        </p>

        {/* ACTIONS */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-6">
            {/* LIKE */}
            <button
              type="button"
              onClick={handleLike}
              aria-label="Like moment"
              className="flex items-center gap-2 hover:scale-110 transition"
            >
              <Heart
                size={22}
                fill={liked ? "currentColor" : "none"}
                className={liked ? "text-red-500" : ""}
              />

              <span>
                {currentMoment.likes?.length || 0}
              </span>
            </button>

            {/* COMMENTS */}
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              aria-label="Show comments"
              className="flex items-center gap-2 hover:scale-110 transition"
            >
              <MessageCircle size={22} />

              <span>
                {currentMoment.comments?.length || 0}
              </span>
            </button>

            {/* SHARE */}
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share moment"
              className="hover:scale-110 transition"
            >
              <Share2 size={22} />
            </button>

            {/* DOWNLOAD */}
            <a
              href={videoUrl}
              download={`${currentMoment.title || "moment"}.mp4`}
              aria-label="Download video"
              className="hover:scale-110 transition"
            >
              <Download size={22} />
            </a>
          </div>

          {/* SAVE */}
          <button
            type="button"
            aria-label="Bookmark moment"
            className="hover:scale-110 transition"
          >
            <Bookmark size={22} />
          </button>
        </div>

        {/* COMMENTS */}
        {showComments && (
          <div className="mt-6">
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {currentMoment.comments?.map((c, i) => (
                <div
                  key={i}
                  className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-xl"
                >
                  <b>{c.email?.split("@")[0] || "User"}</b>{" "}
                  {c.text}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add comment..."
                className="
                  flex-1 border rounded-xl p-3
                  dark:text-black
                "
              />

              <button
                type="button"
                onClick={handleComment}
                className="bg-blue-600 text-white px-5 rounded-xl"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
