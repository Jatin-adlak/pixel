const BASE_URL = "http://127.0.0.1:8000/api"


/* ================= USERS ================= */

export const loginUser = async (data) => {
  const res = await fetch(`${BASE_URL}/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  return res.json()
}


/* ================= POSTS ================= */

export const getPosts = async () => {
  const res = await fetch(`${BASE_URL}/posts/`)
  return res.json()
}

export const createPost = async (formData) => {
  const res = await fetch(`${BASE_URL}/posts/create/`, {
    method: "POST",
    body: formData   // ✅ FIXED (no headers)
  })

  return res.json()
}

export const deletePost = async (postId) => {
  const res = await fetch(`${BASE_URL}/posts/delete/${postId}/`, {
    method: "DELETE"
  })

  return res.json()
}


/* ================= EVENTS ================= */

export const getEvents = async () => {
  const res = await fetch(`${BASE_URL}/events/`)
  return res.json()
}

export const createEvent = async (formData) => {
  const res = await fetch(`${BASE_URL}/events/add/`, {   // ✅ FIXED
    method: "POST",
    body: formData   // ✅ FIXED (FormData)
  })

  return res.json()
}

export const deleteEvent = async (eventId) => {
  const res = await fetch(`${BASE_URL}/events/delete/${eventId}/`, {
    method: "DELETE"
  })

  return res.json()
}

export const updateEvent = async (eventId, formData) => {
  const res = await fetch(`${BASE_URL}/events/update/${eventId}/`, {
    method: "PUT",
    body: formData
  })

  return res.json()
}


/* ================= IMAGES ================= */

export const getImages = async (eventId) => {
  const res = await fetch(`${BASE_URL}/images/?event_id=${eventId}`)
  return res.json()
}

export const uploadImage = async (formData) => {
  const res = await fetch(`${BASE_URL}/images/upload/`, {
    method: "POST",
    body: formData   // ✅ FIXED
  })

  return res.json()
}

export const deleteImage = async (fileId) => {
  const res = await fetch(`${BASE_URL}/images/delete/${fileId}/`, {
    method: "DELETE"
  })

  return res.json()
}


/* ================= NEWSLETTER ================= */

export const getNewsletters = async () => {
  const res = await fetch(`${BASE_URL}/newsletters/`)
  return res.json()
}


/* ================= USER UPDATE ================= */

export const updateUsername = async (data) => {
  const res = await fetch(`${BASE_URL}/users/update-username/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    throw new Error("Failed to update username")
  }

  return res.json()
}