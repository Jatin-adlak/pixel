import { API_ORIGIN } from "../config/env"

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Bell, Search, X } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const [showRequests, setShowRequests] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const navigate = useNavigate();

  /* LOAD USER */

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      const storedUser = window.localStorage.getItem("pixelUser");

      if (!storedUser) {
        if (!cancelled) {
          setUser(null);
        }
        return;
      }

      try {
        const parsed = JSON.parse(storedUser);

        if (!parsed.email) {
          if (!cancelled) {
            setUser(parsed);
          }
          return;
        }

        const res = await fetch(
          `${API_ORIGIN}/api/users/public/${encodeURIComponent(
            parsed.email
          )}/`
        );

        if (!res.ok) {
          throw new Error(`Failed to load user: ${res.status}`);
        }

        const freshUser = await res.json();

        if (cancelled) return;

        const updatedUser = {
          ...parsed,
          followers: freshUser.followers || [],
          following: freshUser.following || [],
          follow_requests: freshUser.follow_requests || [],
        };

        localStorage.setItem(
          "pixelUser",
          JSON.stringify(updatedUser)
        );

        setUser(updatedUser);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load navbar user:", err);
        }
      }
    };

    loadUser();

    window.addEventListener("storage", loadUser);
    window.addEventListener("userChanged", loadUser);

    return () => {
      cancelled = true;

      window.removeEventListener("storage", loadUser);
      window.removeEventListener("userChanged", loadUser);
    };
  }, []);

  /* SEARCH USERS */

  const searchUsers = async (value) => {
    setSearch(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(
        `${API_ORIGIN}/api/users/search/?q=${encodeURIComponent(
          value
        )}`
      );

      if (!res.ok) {
        throw new Error(`Search failed: ${res.status}`);
      }

      const data = await res.json();

      setResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ACCEPT REQUEST */

  const acceptRequest = async (followerEmail) => {
    try {
      const res = await fetch(
        `${API_ORIGIN}/api/users/accept-request/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_email: user.email,
            follower_email: followerEmail,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Accept request failed: ${res.status}`);
      }

      const updatedRequests = (
        user.follow_requests || []
      ).filter((req) => req !== followerEmail);

      const updatedFollowers = [
        ...(user.followers || []),
        followerEmail,
      ];

      const updatedUser = {
        ...user,
        follow_requests: updatedRequests,
        followers: updatedFollowers,
      };

      localStorage.setItem(
        "pixelUser",
        JSON.stringify(updatedUser)
      );

      setUser({
        ...updatedUser,
        follow_requests: updatedUser.follow_requests || [],
      });

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("userChanged"));
    } catch (err) {
      console.error("Accept request error:", err);
    }
  };

  /* REJECT REQUEST */

  const rejectRequest = async (followerEmail) => {
    try {
      const res = await fetch(
        `${API_ORIGIN}/api/users/reject-request/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_email: user.email,
            follower_email: followerEmail,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Reject request failed: ${res.status}`);
      }

      const updatedRequests = (
        user.follow_requests || []
      ).filter((req) => req !== followerEmail);

      const updatedUser = {
        ...user,
        follow_requests: updatedRequests,
      };

      localStorage.setItem(
        "pixelUser",
        JSON.stringify(updatedUser)
      );

      setUser(updatedUser);

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("userChanged"));
    } catch (err) {
      console.error("Reject request error:", err);
    }
  };

  /* LOGOUT */

  const handleLogout = () => {
    window.localStorage.removeItem("pixelUser");

    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("userChanged"));

    navigate("/");
  };

  /* RING COLOR */

  const getRingColor = () => {
    if (!user) return "";

    if (user.domain === "sait.ac.in") {
      return "ring-[#b55f22]";
    }

    if (user.domain === "saip.ac.in") {
      return "ring-blue-600";
    }

    return "ring-neutral-400";
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-neutral-200 dark:border-neutral-800 dark:text-white overflow-visible pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 overflow-visible">

        {/* LOGO */}

        <Link
          to="/"
          className="font-headersfont text-xl hover:text-blue-600 shrink-0"
        >
          Pixel
        </Link>

        {/* NAV LINKS */}

        <div className="flex items-center gap-3 md:gap-5 lg:gap-8 overflow-visible">

          {/* MOBILE SEARCH BUTTON */}

          <button
            type="button"
            aria-label="Search users"
            onClick={() => setShowMobileSearch((v) => !v)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full active:bg-neutral-200 dark:active:bg-neutral-800"
          >
            {showMobileSearch ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* SEARCH */}

          <div className="relative hidden md:block overflow-visible">
            <div className="relative">

              {/* ICON */}

              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>

              <input
                value={search}
                onChange={(e) => searchUsers(e.target.value)}
                placeholder="Search users"
                className="
                  w-72 lg:w-[26rem]
                  pl-11 pr-5 py-2.5
                  rounded-full
                  text-sm
                  border border-neutral-300 dark:border-neutral-700
                  bg-white dark:bg-neutral-900
                  outline-none
                  focus:ring-2 focus:ring-blue-500
                  transition
                "
              />
            </div>

            {/* LIVE RESULTS */}

            {results.length > 0 && (
              <div
                className="
                  absolute top-14 left-0 w-full
                  bg-white dark:bg-neutral-900
                  rounded-2xl shadow-2xl border
                  border-neutral-200 dark:border-neutral-700
                  overflow-hidden
                  z-[999]
                  max-h-80 overflow-y-auto
                  backdrop-blur-xl
                "
              >
                {results.map((result) => (
                  <div
                    key={result._id}
                    onClick={() => {
                      navigate(
                        `/user/${encodeURIComponent(result.email)}`
                      );
                      setResults([]);
                      setSearch("");
                    }}
                    className="
                      flex items-center gap-3 p-4
                      hover:bg-neutral-100 dark:hover:bg-neutral-800
                      cursor-pointer transition
                    "
                  >
                    <img
                      src={result.picture}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {result.name || "Unnamed"}
                      </p>

                      <p className="text-xs text-gray-500 truncate">
                        {result.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-5 lg:gap-8">
          <Link
            to="/"
            className="hover:text-blue-600 transition text-sm md:text-base"
          >
            Home
          </Link>

          <Link
            to="/feed"
            className="hover:text-blue-600 transition text-sm md:text-base"
          >
            Feed
          </Link>

          <Link
            to="/moments"
            className="hover:text-blue-600 transition text-sm md:text-base"
          >
            Moments
          </Link>

          <Link
            to="/gallery"
            className="hover:text-blue-600 transition text-sm md:text-base"
          >
            Gallery
          </Link>

          <Link
            to="/spotlight"
            className="hover:text-blue-600 transition text-sm md:text-base"
          >
            Spotlight
          </Link>

          <Link
            to="/newsletter"
            className="hover:text-blue-600 transition text-sm md:text-base"
          >
            Newsletter
          </Link>
          </div>

          {/* FOLLOW REQUESTS */}

          {user && (
            <div className="relative">
              <button
                onClick={() => setShowRequests(!showRequests)}
                className="
                  relative
                  w-10 h-10
                  flex items-center justify-center
                  rounded-full
                  hover:bg-neutral-200
                  dark:hover:bg-neutral-800
                  transition
                "
              >
                <Bell size={20} />

                {(user.follow_requests || []).length > 0 && (
                  <div
                    className="
                      absolute -top-1 -right-1
                      min-w-[18px] h-[18px]
                      px-1
                      rounded-full
                      bg-red-500 text-white
                      text-[10px]
                      flex items-center justify-center
                      font-bold
                    "
                  >
                    {user.follow_requests.length}
                  </div>
                )}
              </button>

              {/* DROPDOWN */}

              {showRequests && (
                <div
                  className="
                    fixed left-3 right-3 top-[calc(3.75rem+env(safe-area-inset-top))]
                    md:absolute md:left-auto md:right-0 md:top-14
                    md:w-80
                    bg-white dark:bg-neutral-900
                    border border-neutral-200 dark:border-neutral-700
                    rounded-2xl
                    shadow-2xl
                    overflow-hidden
                    z-[999]
                  "
                >
                  <div
                    className="
                      p-4 border-b
                      border-neutral-200 dark:border-neutral-700
                      font-semibold
                    "
                  >
                    Follow Requests
                  </div>

                  {!user?.follow_requests ||
                  user.follow_requests.length === 0 ? (
                    <div className="p-5 text-sm text-gray-500 text-center">
                      No requests
                    </div>
                  ) : (
                    (user?.follow_requests || []).map((req, i) => (
                      <div
                        key={i}
                        className="
                          p-4 flex items-center justify-between gap-3
                          border-b border-neutral-100
                          dark:border-neutral-800
                        "
                      >
                        <div className="text-sm truncate">
                          {req}
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => acceptRequest(req)}
                            className="
                              px-3 py-1 rounded-lg
                              bg-blue-600 text-white
                              text-xs
                            "
                          >
                            Accept
                          </button>

                          <button
                            onClick={() => rejectRequest(req)}
                            className="
                              px-3 py-1 rounded-lg
                              border text-xs
                            "
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* LOGIN / PROFILE SWITCH */}

          {user ? (
            <img
              src={user.picture}
              alt="profile"
              onClick={() => navigate("/profile")}
              className={`
                w-8 h-8 md:w-9 md:h-9
                rounded-full cursor-pointer object-cover
                ring-2 ring-offset-1 md:ring-offset-2
                ring-offset-white dark:ring-offset-black
                ${getRingColor()}
                hover:scale-105 transition shrink-0
              `}
            />
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="
                px-3 py-1
                border-2 border-blue-600
                text-black dark:text-white
                rounded-full
                text-sm md:text-base
                hover:bg-blue-600 hover:text-white
                transition
              "
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* MOBILE SEARCH PANEL */}

      {showMobileSearch && (
        <div className="md:hidden px-4 pb-3">
          <input
            autoFocus
            value={search}
            onChange={(e) => searchUsers(e.target.value)}
            placeholder="Search users"
            className="
              w-full px-4 py-3 rounded-full text-base
              border border-neutral-300 dark:border-neutral-700
              bg-white dark:bg-neutral-900
              outline-none focus:ring-2 focus:ring-blue-500
            "
          />

          {results.length > 0 && (
            <div
              className="
                mt-2 max-h-[60vh] overflow-y-auto
                bg-white dark:bg-neutral-900
                rounded-2xl border border-neutral-200 dark:border-neutral-700
                shadow-xl
              "
            >
              {results.map((result) => (
                <div
                  key={result._id}
                  onClick={() => {
                    navigate(`/user/${encodeURIComponent(result.email)}`);
                    setResults([]);
                    setSearch("");
                    setShowMobileSearch(false);
                  }}
                  className="flex items-center gap-3 p-3 active:bg-neutral-100 dark:active:bg-neutral-800"
                >
                  <img
                    src={result.picture}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {result.name || "Unnamed"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {result.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
