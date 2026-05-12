import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Admin() {

  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [eventId, setEventId] = useState("")
  const [uploading, setUploading] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [cover, setCover] = useState(null)

  const [eventImages, setEventImages] = useState([])

  // 🔥 EDIT MODE
  const [editingId, setEditingId] = useState(null)

  // 🔥 POSTS
  const [posts, setPosts] = useState([])
  const [postTitle, setPostTitle] = useState("")
  const [postCaption, setPostCaption] = useState("")
  const [postImage, setPostImage] = useState(null)

  /* ADMIN PROTECTION */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("pixelUser"))

    if (!user || !user.isAdmin) {
      alert("Access denied ❌")
      navigate("/")
    }
  }, [navigate])

  /* LOAD EVENTS */
  const loadEvents = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/events/")
      const data = await res.json()

      setEvents(data)

      if (data.length > 0 && !eventId) {
        setEventId(data[0]._id)
      }

    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  /* CREATE / UPDATE EVENT */
  const createEvent = async () => {

    if (!name.trim()) {
      alert("Event name required")
      return
    }

    try {

      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)

      if (cover) formData.append("cover", cover)

      const url = editingId
        ? `http://127.0.0.1:8000/api/events/update/${editingId}/`
        : "http://127.0.0.1:8000/api/events/add/"

      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Failed ❌")
        return
      }

      alert(editingId ? "Event updated ✅" : "Event created ✅")

      setName("")
      setDescription("")
      setCover(null)
      setEditingId(null)

      loadEvents()

    } catch (err) {
      console.error(err)
      alert("Error ❌")
    }
  }

  /* EDIT EVENT */
  const editEvent = (event) => {
    setName(event.name)
    setDescription(event.description || "")
    setEditingId(event._id)
  }

  /* DELETE EVENT */
  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event and all images?")) return

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/events/delete/${id}/`,
        { method: "DELETE" }
      )

      if (!res.ok) return alert("Delete failed ❌")

      alert("Event deleted ✅")
      loadEvents()

    } catch (err) {
      console.error(err)
    }
  }

  /* LOAD IMAGES */
  const loadImagesForEvent = async () => {
    if (!eventId) return

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/images/?event_id=${eventId}`
      )

      const data = await res.json()
      setEventImages(data)

    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadImagesForEvent()
  }, [eventId])

  /* DELETE IMAGE */
  const deleteImage = async (fileId) => {
    if (!window.confirm("Delete this image?")) return

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/images/delete/${fileId}/`,
        { method: "DELETE" }
      )

      if (!res.ok) {
        alert("Delete failed ❌")
        return
      }

      alert("Image deleted ✅")
      loadImagesForEvent()

    } catch (err) {
      console.error(err)
    }
  }

  /* UPLOAD IMAGES */
  const handleFile = async (e) => {

    const files = Array.from(e.target.files)
    if (!files.length || !eventId) return

    try {
      setUploading(true)

      const formData = new FormData()

      files.forEach(file => formData.append("images", file))

      formData.append("event_id", eventId)
      formData.append("uploaded_by", "admin")

      const res = await fetch("http://127.0.0.1:8000/api/images/upload/", {
        method: "POST",
        body: formData
      })

      if (!res.ok) return alert("Upload failed ❌")

      alert("Uploaded ✅")
      loadImagesForEvent()

    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  /* ---------------- POSTS ---------------- */

  const loadPosts = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/posts/")
    const data = await res.json()
    setPosts(data)
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const createPost = async () => {
    const formData = new FormData()
    formData.append("title", postTitle)
    formData.append("caption", postCaption)
    if (postImage) formData.append("image", postImage)

    const res = await fetch("http://127.0.0.1:8000/api/posts/create/", {
      method: "POST",
      body: formData
    })

    if (!res.ok) return alert("Post failed ❌")

    alert("Post created ✅")
    setPostTitle("")
    setPostCaption("")
    setPostImage(null)
    loadPosts()
  }

  const deletePost = async (id) => {
    await fetch(`http://127.0.0.1:8000/api/posts/delete/${id}/`, {
      method: "DELETE"
    })
    loadPosts()
  }

  return (
    <div className="min-h-screen pt-24 px-6 bg-white dark:bg-black text-black dark:text-white">

      <h1 className="text-3xl mb-6">Admin Panel</h1>

      {/* EVENT FORM */}
      <div className="mb-10 space-y-3 max-w-md">

        <h2 className="text-xl">{editingId ? "Edit Event" : "Create Event"}</h2>

        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Event Name"
          className="border px-3 py-2 rounded w-full dark:text-black" />

        <textarea value={description} onChange={(e)=>setDescription(e.target.value)}
          placeholder="Description"
          className="border px-3 py-2 rounded w-full dark:text-black" />

        {!editingId && (
          <input type="file" accept="image/*" onChange={(e)=>setCover(e.target.files[0])} />
        )}

        <button onClick={createEvent}
          className="bg-green-600 text-white px-4 py-2 rounded">
          {editingId ? "Update Event" : "Create Event"}
        </button>

      </div>

      {/* EVENTS */}
      {events.map(e => (
        <div key={e._id} className="flex justify-between border p-2 mb-2 rounded">
          <span>{e.name}</span>

          <div className="space-x-2">
            <button onClick={()=>editEvent(e)} className="bg-blue-500 px-2 py-1 text-white rounded">Edit</button>
            <button onClick={()=>deleteEvent(e._id)} className="bg-red-600 px-2 py-1 text-white rounded">Delete</button>
          </div>
        </div>
      ))}

      {/* IMAGE MANAGEMENT */}
      <select value={eventId} onChange={(e)=>setEventId(e.target.value)}
        className="px-4 py-2 rounded border mb-6">

        {events.map(e=>(
          <option key={e._id} value={e._id}>{e.name}</option>
        ))}
      </select>

      <input type="file" multiple onChange={handleFile} />
      {uploading && <p>Uploading...</p>}

      <div className="grid grid-cols-3 gap-4 mt-6">
        {eventImages.map(img => (
          <div key={img.file_id} className="relative">
            <img src={img.url} className="h-40 w-full object-cover rounded" />
            <button onClick={()=>deleteImage(img.file_id)}
              className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs rounded">
              X
            </button>
          </div>
        ))}
      </div>

      {/* POSTS */}
      <div className="mt-16 max-w-md space-y-3">

        <h2 className="text-xl">Create Post</h2>

        <input value={postTitle} onChange={(e)=>setPostTitle(e.target.value)} placeholder="Title"
          className="border px-3 py-2 w-full dark:text-black" />

        <textarea value={postCaption} onChange={(e)=>setPostCaption(e.target.value)}
          placeholder="Caption"
          className="border px-3 py-2 w-full dark:text-black" />

        <input type="file" onChange={(e)=>setPostImage(e.target.files[0])} />

        <button onClick={createPost}
          className="bg-purple-600 text-white px-4 py-2 rounded">
          Create Post
        </button>

      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {posts.map(p => (
          <div key={p._id} className="border p-2 rounded relative">
            {p.image_url && <img src={p.image_url} className="h-32 w-full object-cover" />}
            <p>{p.title}</p>

            <button onClick={()=>deletePost(p._id)}
              className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs rounded">
              X
            </button>
          </div>
        ))}
      </div>

    </div>
  )
}