/*
  Central place for backend / OAuth configuration.

  - In development nothing needs to be set: it falls back to localhost.
  - For a mobile build, set these in Pixel/.env.production (see .env.example).
*/

// Origin of the Django backend, WITHOUT a trailing slash and WITHOUT /api
export const API_ORIGIN = (
  import.meta.env.VITE_API_ORIGIN || "http://127.0.0.1:8000"
).replace(/\/+$/, "")

export const API = `${API_ORIGIN}/api`

// Web OAuth client ID (also used as the audience for native Google sign-in)
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "578954072006-aas3viqv21ho7hc2gvg64ibpac1ljsmr.apps.googleusercontent.com"
