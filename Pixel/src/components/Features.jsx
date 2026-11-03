import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

// id="features"

const features = [
  {
    name: "Photography Feed",
    route: "/feed",
    description:
      "Share photographs and engage with the community through creative visual stories.",
  },
  {
    name: "Moments",
    route: "/moments",
    description: "Upload cinematic reels and create immersive visual experiences.",
  },
  {
    name: "AI Face Search",
    route: "/face-search",
    description: "Locate your photographs instantly using AI powered recognition.",
  },
  {
    name: "Newsletter",
    route: "/newsletter",
    description: "Read updates, announcements and creative stories from PIXEL.",
  },
  {
    name: "Spotlight",
    route: "/spotlight",
    description: "Discover upcoming workshops, events and featured activities.",
  },
  {
    name: "Gallery",
    route: "/gallery",
    description: "Browse memorable captures and curated collections.",
  },
  {
    name: "Community",
    route: "/feed",
    description: "Connect with creators and build meaningful interactions.",
  },
  {
    name: "Interactions",
    route: "/feed",
    description: "Like, comment and share content with others.",
  },
  {
    name: "Profiles",
    route: "/profile",
    description: "Build your creative identity and personal presence.",
  },
]

export default function Features() {
  const [selected, setSelected] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return

    const interval = setInterval(() => {
      setSelected((prev) => (prev + 1) % features.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [paused])

  const radius = 280
  const centerX = 400
  const centerY = 320

  return (
    <section
      className="
        py-20 md:py-32
        bg-white dark:bg-black
        text-black dark:text-white
        overflow-hidden
      "
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* HEADER */}

        <div className="text-center mb-10 md:mb-24">
          <p className="text-blue-500 tracking-[4px] md:tracking-[6px] uppercase text-xs md:text-sm mb-4">
            Explore Pixel
          </p>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-headersfont mb-6">
            Everything In One Place
          </h2>

          <p className="opacity-60 max-w-2xl mx-auto leading-7 md:leading-8">
            Photography, AI and storytelling combined into one ecosystem.
          </p>
        </div>

        {/*
          Phone: stacked  -> arc, current feature, button
          md+  : original absolute-positioned layout
        */}
        <div className="relative w-full flex flex-col items-center md:block md:h-[700px]">
          {/* Navy background glow */}

          <motion.div
            animate={{ x: selected * 50 }}
            transition={{ duration: 0.8 }}
            className="
              absolute left-1/2 top-[20%] md:top-[40%] -translate-x-1/2
              w-[220px] h-[220px] md:w-[350px] md:h-[350px]
              rounded-full bg-blue-900/10 blur-[100px] md:blur-[120px]
              pointer-events-none
            "
          />

          {/* ARC (scales to the screen width) */}

          <div className="order-1 relative w-full md:absolute md:left-1/2 md:-translate-x-1/2 md:w-[800px]">
            <svg viewBox="0 0 800 360" className="w-full h-auto block">
              <path
                d="M120,320 A280,280 0 0 1 680,320"
                fill="none"
                stroke="rgba(37,99,235,.2)"
                strokeWidth="2"
              />

              {features.map((feature, index) => {
                const angle = Math.PI + (index / (features.length - 1)) * Math.PI

                const x = centerX + radius * Math.cos(angle)
                const y = centerY + radius * Math.sin(angle)

                return (
                  <g
                    key={index}
                    onClick={() => {
                      setSelected(index)
                      setPaused(true)
                    }}
                    className="cursor-pointer"
                  >
                    {/* larger invisible touch target */}
                    <circle cx={x} cy={y} r={38} fill="transparent" />

                    <motion.circle
                      cx={x}
                      cy={y}
                      r={selected === index ? 16 : 9}
                      fill="#2563eb"
                    />

                    <motion.circle
                      cx={x}
                      cy={y}
                      r={selected === index ? 30 : 16}
                      fill="rgba(37,99,235,.12)"
                      animate={{ scale: selected === index ? [1, 1.2, 1] : 1 }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  </g>
                )
              })}
            </svg>
          </div>

          {/* CURRENT FEATURE */}

          <motion.div
            key={`left-${selected}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="
              order-2 relative z-10 mt-6 text-center max-w-[320px]
              md:mt-0 md:text-left md:max-w-[280px]
              md:absolute md:left-0 md:top-[35%]
            "
          >
            <p className="text-blue-500 uppercase tracking-[4px] md:tracking-[5px] text-xs mb-3 md:mb-4">
              Current Feature
            </p>

            <h3 className="text-3xl md:text-4xl font-headersfont mb-3 md:mb-6 leading-tight">
              {features[selected].name}
            </h3>

            <p className="opacity-60 leading-7 md:leading-8 min-h-[84px] md:min-h-0">
              {features[selected].description}
            </p>
          </motion.div>

          {/* NAVIGATION CARD (desktop only - the button below replaces it on phones) */}

          <motion.div
            key={`right-${selected}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="
              hidden md:block
              absolute right-0 top-[35%] w-[260px]
              bg-neutral-100 dark:bg-neutral-950
              rounded-[30px]
              border border-neutral-200 dark:border-neutral-800
              p-8
            "
          >
            <p className="text-xs uppercase tracking-[5px] opacity-50 mb-4">
              Navigation
            </p>

            <div className="w-12 h-[2px] bg-blue-500 mb-5" />

            <p className="opacity-60 leading-8">
              Navigate directly into the selected PIXEL feature experience.
            </p>
          </motion.div>

          {/* BOTTOM BUTTON */}

          <div
            className="
              order-3 mt-6 text-center
              md:mt-0 md:absolute md:bottom-0 md:left-1/2 md:-translate-x-1/2
            "
          >
            <Link
              to={features[selected].route}
              className="
                inline-flex px-8 py-4 rounded-full
                bg-blue-600 hover:bg-blue-700 active:bg-blue-700
                text-white transition-all
              "
            >
              Explore Now →
            </Link>

            {paused && (
              <button
                onClick={() => setPaused(false)}
                className="block mx-auto mt-5 opacity-50 text-sm"
              >
                Resume auto rotation
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
