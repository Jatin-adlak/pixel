import { NavLink, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { Home, LayoutGrid, Film, Image, Sparkles, Newspaper } from "lucide-react"

const TABS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/feed", label: "Feed", icon: LayoutGrid },
  { to: "/moments", label: "Moments", icon: Film },
  { to: "/gallery", label: "Gallery", icon: Image },
  { to: "/spotlight", label: "Spotlight", icon: Sparkles },
  { to: "/newsletter", label: "News", icon: Newspaper },
]

// Routes where the bottom bar would only get in the way
const HIDDEN_ON = ["/login", "/username", "/face-setup", "/admin", "/manage"]

export default function MobileTabBar() {
  const { pathname } = useLocation()

  const hidden = HIDDEN_ON.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )

  // lets index.css add bottom padding only while the bar is on screen
  useEffect(() => {
    document.body.classList.toggle("has-tabbar", !hidden)
    return () => document.body.classList.remove("has-tabbar")
  }, [hidden])

  if (hidden) return null

  return (
    <nav
      aria-label="Main"
      className="
        md:hidden fixed bottom-0 left-0 right-0 z-[9998]
        bg-white/90 dark:bg-black/90 backdrop-blur-xl
        border-t border-neutral-200 dark:border-neutral-800
        pb-[env(safe-area-inset-bottom)]
      "
    >
      <ul className="flex items-stretch justify-around">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-0.5
                h-14 text-[10px] font-medium select-none
                transition-colors active:scale-95
                ${
                  isActive
                    ? "text-blue-600"
                    : "text-neutral-500 dark:text-neutral-400"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
