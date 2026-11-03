import { API_ORIGIN } from "./env"

/*
  The Django backend (and some documents stored in MongoDB) contain absolute
  links such as  http://127.0.0.1:8000/api/images/file/<id>/ .
  On a phone / emulator 127.0.0.1 is the device itself, so those images and
  files never load.

  When API_ORIGIN points somewhere else (e.g. http://10.0.2.2:8000 or your
  production domain) rewrite those links inside every JSON API response.
*/

const LOCAL = /http:\/\/(?:127\.0\.0\.1|localhost):8000/g

if (
  typeof window !== "undefined" &&
  !window.__pixelFetchPatched &&
  !/^http:\/\/(127\.0\.0\.1|localhost):8000$/.test(API_ORIGIN)
) {
  window.__pixelFetchPatched = true
  const originalFetch = window.fetch.bind(window)

  window.fetch = async (...args) => {
    const res = await originalFetch(...args)

    try {
      const type = res.headers.get("content-type") || ""
      if (!type.includes("application/json")) return res

      const body = await res.text()
      return new Response(body.replace(LOCAL, API_ORIGIN), {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      })
    } catch {
      return res
    }
  }
}
