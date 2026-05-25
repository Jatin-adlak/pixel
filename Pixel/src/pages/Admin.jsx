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

  /* 🔥 NEWSLETTER */

  const [newsletters, setNewsletters] = useState([])

  const [newsletterTitle, setNewsletterTitle] = useState("")
  const [newsletterCover, setNewsletterCover] = useState(null)
  const [newsletterPdf, setNewsletterPdf] = useState(null)

  const [newsletterEditId, setNewsletterEditId] = useState(null)

  const [activeTab,setActiveTab]=useState("events")

  /* 🔥 MOMENTS */

  const [moments,setMoments]=useState([])

  const [momentTitle,setMomentTitle]=useState("")
  const [momentCaption,setMomentCaption]=useState("")

  const [momentVideo,setMomentVideo]=useState(null)
  const [momentCover,setMomentCover]=useState(null)

  const [momentEditId,setMomentEditId]=useState(null)

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

  /* LOAD NEWSLETTERS */

  const loadNewsletters = async () => {

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/api/newsletters/"
      )

      const data = await res.json()

      setNewsletters(data)

    } catch (err) {

      console.log(err)

    }

  }

  useEffect(() => {

    loadNewsletters()

  }, [])


  const uploadNewsletter = async () => {

if(
!newsletterTitle ||
(!newsletterCover && !newsletterEditId) ||
(!newsletterPdf && !newsletterEditId)
){

alert(
"Fill required fields"
)

return

}

try{

const formData = new FormData()

formData.append(
"title",
newsletterTitle
)

if(newsletterCover){

formData.append(
"cover",
newsletterCover
)

}

if(newsletterPdf){

formData.append(
"pdf",
newsletterPdf
)

}

/*Newsletter edit vs create*/
/* 🔥 UPDATED ROUTES */

const url = newsletterEditId

? `http://127.0.0.1:8000/api/newsletters/edit/${newsletterEditId}/`

: "http://127.0.0.1:8000/api/newsletters/upload/"


const method =

newsletterEditId
? "PUT"
: "POST"


const res = await fetch(

url,

{
method,
body:formData
}

)

const data = await res.json()

console.log(
"NEWSLETTER RESPONSE:",
data
)

if(!res.ok){

alert(
data.error || "Failed"
)

return

}

alert(

newsletterEditId
? "Newsletter updated ✅"
: "Newsletter uploaded ✅"

)


setNewsletterTitle("")
setNewsletterCover(null)
setNewsletterPdf(null)
setNewsletterEditId(null)

loadNewsletters()

}catch(err){

console.log(
"NEWSLETTER ERROR:",
err
)

alert(
"Something went wrong"
)

}

}



/* EDIT */

const editNewsletter = (n)=>{

setNewsletterTitle(
n.title
)

setNewsletterEditId(
n._id
)

}



/* DELETE */

const deleteNewsletter = async(id)=>{

if(
!window.confirm(
"Delete newsletter?"
)
)return

try{

const res = await fetch(

`http://127.0.0.1:8000/api/newsletters/delete/${id}/`,

{
method:"DELETE"
}

)

const data = await res.json()

console.log(
"DELETE RESPONSE:",
data
)

loadNewsletters()

}catch(err){

console.log(
"DELETE ERROR:",
err
)

}

}

/* ---------------- MOMENTS ---------------- */


/* LOAD */

const loadMoments = async()=>{

try{

const res = await fetch(

"http://127.0.0.1:8000/api/moments/"

)

const data = await res.json()

setMoments(data)

}catch(err){

console.log(err)

}

}


/* LOAD ON START */

useEffect(()=>{

loadMoments()

},[])


/* CREATE + UPDATE */

const createMoment = async()=>{

if(
!momentVideo &&
!momentEditId
){

alert(
"Video required"
)

return

}

try{

const formData = new FormData()

formData.append(
"title",
momentTitle
)

formData.append(
"caption",
momentCaption
)

if(momentVideo){

formData.append(
"video",
momentVideo
)

}

if(momentCover){

formData.append(
"cover",
momentCover
)

}


const url = momentEditId

?

`http://127.0.0.1:8000/api/moments/edit/${momentEditId}/`

:

"http://127.0.0.1:8000/api/moments/create/"


const method = momentEditId

?

"PUT"

:

"POST"


const res = await fetch(

url,

{
method,
body:formData
}

)

const data = await res.json()

console.log(data)

if(!res.ok){

alert(
data.error || "Failed"
)

return

}


alert(

momentEditId

?

"Moment updated ✅"

:

"Moment uploaded ✅"

)


setMomentTitle("")
setMomentCaption("")

setMomentVideo(null)
setMomentCover(null)

setMomentEditId(null)

loadMoments()

}catch(err){

console.log(err)

}

}


/* EDIT */

const editMoment = (moment)=>{

setMomentTitle(
moment.title || ""
)

setMomentCaption(
moment.caption || ""
)

setMomentEditId(
moment._id
)

}


/* DELETE */

const deleteMoment = async(id)=>{

if(
!window.confirm(
"Delete moment?"
)
)return

try{

await fetch(

`http://127.0.0.1:8000/api/moments/delete/${id}/`,

{
method:"DELETE"
}

)

loadMoments()

}catch(err){

console.log(err)

}

}

  return (

<div className="
min-h-screen
pt-24
px-6 md:px-10
pb-20
bg-neutral-100
dark:bg-black
text-black
dark:text-white
">

{/* HEADER */}

<div className="mb-10">

<h1 className="
text-4xl font-bold
mb-2
">
Admin Dashboard
</h1>

<p className="text-gray-500">
Manage events, gallery, posts and newsletters
</p>

</div>


{/* STATS */}

<div className="
grid grid-cols-2
lg:grid-cols-4
gap-5
mb-10
">

<div className="
bg-white dark:bg-neutral-900
rounded-3xl p-6 shadow-lg
">
<p className="text-gray-500">Events</p>
<h1 className="text-3xl font-bold">
{events.length}
</h1>
</div>


<div className="
bg-white dark:bg-neutral-900
rounded-3xl p-6 shadow-lg
">
<p className="text-gray-500">Posts</p>
<h1 className="text-3xl font-bold">
{posts.length}
</h1>
</div>


<div className="
bg-white dark:bg-neutral-900
rounded-3xl p-6 shadow-lg
">
<p className="text-gray-500">Images</p>
<h1 className="text-3xl font-bold">
{eventImages.length}
</h1>
</div>


<div className="
bg-white dark:bg-neutral-900
rounded-3xl p-6 shadow-lg
">
<p className="text-gray-500">Newsletters</p>
<h1 className="text-3xl font-bold">
{newsletters.length}
</h1>
</div>

</div>


{/* TABS */}

<div className="
flex gap-3
mb-10
overflow-x-auto
">

{[
"events",
"gallery",
"posts",
"newsletter",
"moments"
].map(tab=>(

<button
key={tab}
onClick={()=>
setActiveTab(tab)
}
className={`
px-6 py-3
rounded-full
capitalize
transition

${
activeTab===tab

?

"bg-blue-600 text-white"

:

"bg-white dark:bg-neutral-900"
}
`}
>

{tab}

</button>

))}

</div>


{/* EVENTS */}

{activeTab==="events" && (

<div className="
bg-white dark:bg-neutral-900
rounded-3xl
p-6
shadow-lg
">

<div className="
mb-8 space-y-4
max-w-xl
">

<h2 className="text-2xl font-bold">

{editingId
? "Edit Event"
: "Create Event"}

</h2>

<input
value={name}
onChange={(e)=>setName(e.target.value)}
placeholder="Event Name"
className="
w-full p-3 rounded-xl
border dark:text-black
"
/>

<textarea
value={description}
onChange={(e)=>
setDescription(
e.target.value
)
}
placeholder="Description"
className="
w-full p-3 rounded-xl
border dark:text-black
"
/>

{!editingId && (

<input
type="file"
accept="image/*"
onChange={(e)=>
setCover(
e.target.files[0]
)
}
/>

)}

<button
onClick={createEvent}
className="
bg-green-600
px-6 py-3
rounded-xl
text-white
"
>

{
editingId
?
"Update Event"
:
"Create Event"
}

</button>

</div>


<div className="space-y-3">

{events.map(e=>(

<div
key={e._id}
className="
bg-neutral-100
dark:bg-neutral-800
rounded-xl
p-4
flex justify-between
"
>

<span>
{e.name}
</span>

<div className="space-x-2">

<button
onClick={()=>
editEvent(e)
}
className="
bg-blue-500
px-3 py-1
rounded text-white
"
>
Edit
</button>

<button
onClick={()=>
deleteEvent(e._id)
}
className="
bg-red-600
px-3 py-1
rounded text-white
"
>
Delete
</button>

</div>

</div>

))}

</div>

</div>

)}



{/* GALLERY */}

{activeTab==="gallery" && (

<div className="
bg-white dark:bg-neutral-900
rounded-3xl
p-6 shadow-lg
">

<select
value={eventId}
onChange={(e)=>
setEventId(
e.target.value
)
}
className="
mb-6 p-3 rounded-xl
border dark:text-black
"
>

{events.map(e=>(

<option
key={e._id}
value={e._id}
>

{e.name}

</option>

))}

</select>

<input
type="file"
multiple
onChange={handleFile}
/>

{uploading &&
<p className="mt-4">
Uploading...
</p>}

<div className="
grid md:grid-cols-4
gap-4 mt-8
">

{eventImages.map(img=>(

<div
key={img.file_id}
className="relative"
>

<img
src={img.url}
className="
h-48
w-full
object-cover
rounded-xl
"
/>

<button
onClick={()=>
deleteImage(
img.file_id
)
}
className="
absolute
top-2 right-2
bg-red-600
text-white
rounded-full
w-8 h-8
"
>
✕
</button>

</div>

))}

</div>

</div>

)}



{/* POSTS */}

{activeTab==="posts" && (

<div className="
bg-white dark:bg-neutral-900
rounded-3xl
p-6 shadow-lg
">

<div className="
space-y-4
max-w-xl
">

<input
value={postTitle}
onChange={(e)=>
setPostTitle(
e.target.value
)
}
placeholder="Title"
className="
w-full p-3 border rounded-xl
dark:text-black
"
/>

<textarea
value={postCaption}
onChange={(e)=>
setPostCaption(
e.target.value
)
}
placeholder="Caption"
className="
w-full p-3 border rounded-xl
dark:text-black
"
/>

<input
type="file"
onChange={(e)=>
setPostImage(
e.target.files[0]
)
}
/>

<button
onClick={createPost}
className="
bg-purple-600
text-white
px-6 py-3
rounded-xl
"
>

Create Post

</button>

</div>

<div className="
grid md:grid-cols-3
gap-5 mt-10
">

{posts.map(p=>(

<div
key={p._id}
className="
bg-neutral-100
dark:bg-neutral-800
rounded-xl
p-4 relative
"
>

{p.image_url &&
<img
src={p.image_url}
className="
h-40 w-full
object-cover rounded
"
/>}

<p className="mt-3">
{p.title}
</p>

<button
onClick={()=>
deletePost(
p._id
)
}
className="
absolute
top-2 right-2
bg-red-600
rounded-full
w-8 h-8
text-white
"
>

✕

</button>

</div>

))}

</div>

</div>

)}



{/* NEWSLETTER */}

{activeTab==="newsletter" && (

<div className="
bg-white dark:bg-neutral-900
rounded-3xl
p-6 shadow-lg
">

<div className="
space-y-6
">

<h2 className="
text-2xl font-bold
">

Newsletter Management

</h2>


{/* FORM */}

<div className="
max-w-xl
space-y-4
">

<input
value={newsletterTitle}
onChange={(e)=>
setNewsletterTitle(
e.target.value
)
}
placeholder="Newsletter title"
className="
w-full
p-3
rounded-xl
border
dark:text-black
"
/>


<div>

<p className="
mb-2 text-sm
text-gray-500
">
Cover Image
</p>

<input
type="file"
accept="image/*"
onChange={(e)=>
setNewsletterCover(
e.target.files[0]
)
}
/>

</div>


<div>

<p className="
mb-2 text-sm
text-gray-500
">
PDF File
</p>

<input
type="file"
accept=".pdf"
onChange={(e)=>
setNewsletterPdf(
e.target.files[0]
)
}
/>

</div>


<button
onClick={uploadNewsletter}
className="
bg-blue-600
text-white
px-6 py-3
rounded-xl
hover:scale-105
transition
"
>

{

newsletterEditId

?

"Update Newsletter"

:

"Upload Newsletter"

}

</button>

</div>


{/* NEWSLETTER CARDS */}

<div className="
grid
md:grid-cols-2
lg:grid-cols-3
gap-6
mt-10
">

{newsletters.map(n=>(

<div
key={n._id}
className="
bg-neutral-100
dark:bg-neutral-800
rounded-3xl
overflow-hidden
shadow-lg
relative
"
>

<img
src={

n.cover?.startsWith("http")

?

n.cover

:

`http://127.0.0.1:8000${n.cover}`

}
className="
w-full
h-48
object-cover
"
/>


<div className="p-5">

<h3 className="
font-semibold
text-lg
line-clamp-2
">

{n.title}

</h3>


<div className="
flex gap-3
mt-5
">

<button
onClick={()=>
editNewsletter(
n
)
}
className="
bg-yellow-500
text-white
px-4 py-2
rounded-xl
"
>

Edit

</button>


<button
onClick={()=>
deleteNewsletter(
n._id
)
}
className="
bg-red-600
text-white
px-4 py-2
rounded-xl
"
>

Delete

</button>

</div>


<a
href={

n.pdf?.startsWith("http")

?

n.pdf

:

`http://127.0.0.1:8000${n.pdf}`

}
target="_blank"
rel="noreferrer"
className="
block
mt-4
text-blue-500
text-sm
"
>

View PDF →

</a>

</div>

</div>

))}

</div>

</div>

</div>

)}

{/* 🔥 MOMENTS */}

{activeTab==="moments" && (

<div className="
bg-white dark:bg-neutral-900
rounded-3xl
p-6 shadow-lg
">

<h2 className="
text-2xl font-bold
mb-8
">

Moments Management

</h2>


{/* FORM */}

<div className="
max-w-xl
space-y-4
">

<input
value={momentTitle}
onChange={(e)=>
setMomentTitle(
e.target.value
)
}
placeholder="Moment title"
className="
w-full
p-3
rounded-xl
border
dark:text-black
"
/>


<textarea
value={momentCaption}
onChange={(e)=>
setMomentCaption(
e.target.value
)
}
placeholder="Caption"
className="
w-full
p-3
rounded-xl
border
dark:text-black
"
/>


<div>

<p className="
mb-2 text-sm
text-gray-500
">

Cover Image

</p>

<input
type="file"
accept="image/*"
onChange={(e)=>
setMomentCover(
e.target.files[0]
)
}
/>

</div>


<div>

<p className="
mb-2 text-sm
text-gray-500
">

Video

</p>

<input
type="file"
accept="video/*"
onChange={(e)=>
setMomentVideo(
e.target.files[0]
)
}
/>

</div>


<button
onClick={createMoment}
className="
bg-blue-600
text-white
px-6 py-3
rounded-xl
hover:scale-105
transition
"
>

{

momentEditId

?

"Update Moment"

:

"Upload Moment"

}

</button>

</div>



{/* MOMENTS GRID */}

<div className="
grid
md:grid-cols-2
lg:grid-cols-3
gap-6
mt-10
">

{moments.map(moment=>(

<div
key={moment._id}
className="
bg-neutral-100
dark:bg-neutral-800
rounded-3xl
overflow-hidden
shadow-lg
"
>

<img
src={

moment.cover_url?.startsWith("http")

?

moment.cover_url

:

`http://127.0.0.1:8000${moment.cover_url}`

}
className="
w-full
h-48
object-cover
"
/>


<div className="p-5">

<h3 className="
font-semibold
text-lg
">

{moment.title}

</h3>


<p className="
text-sm
text-gray-500
mt-2
line-clamp-2
">

{moment.caption}

</p>


<div className="
flex gap-3
mt-5
">

<button
onClick={()=>
editMoment(
moment
)
}
className="
bg-yellow-500
text-white
px-4 py-2
rounded-xl
"
>

Edit

</button>


<button
onClick={()=>
deleteMoment(
moment._id
)
}
className="
bg-red-600
text-white
px-4 py-2
rounded-xl
"
>

Delete

</button>

</div>

</div>

</div>

))}

</div>

</div>

)}

</div>

)
}