import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Pencil } from "lucide-react"
import ImageViewer from "./ImageViewer"

export default function Profile() {

const navigate = useNavigate()

const [user,setUser] = useState(null)

const [savedPosts,setSavedPosts] = useState([])
const [savedImages,setSavedImages] = useState([])

const [viewer,setViewer] = useState(null)
const [postViewer,setPostViewer] = useState(null)

const [editing,setEditing] = useState(false)

const [newName,setNewName] = useState("")
const [newPhoto,setNewPhoto] = useState("")

const [activeTab,setActiveTab] = useState("posts")

const [showFollowers,setShowFollowers] =
useState(false)

const [showFollowing,setShowFollowing] =
useState(false)

const [followersData,setFollowersData] =
useState([])

const [followingData,setFollowingData] =
useState([])

const [followersSearch,setFollowersSearch] =
useState("")

const [followingSearch,setFollowingSearch] =
useState("")

/* LOAD USER */

useEffect(()=>{

const loadData = async () => {

const storedUser = localStorage.getItem("pixelUser")

if(storedUser){

const parsed = JSON.parse(storedUser)

setUser(parsed)

if(!editing){
setNewName(parsed.name || "")
setNewPhoto(parsed.picture || "")
}

try{

const res = await fetch(
"http://127.0.0.1:8000/api/posts/"
)

const allPosts = await res.json()

const savedIds = parsed.saved_posts || []

const filteredPosts = allPosts.filter(
post => savedIds.includes(post._id)
)

setSavedPosts(

filteredPosts.map(post=>({

id:post._id,
image:post.image_url || post.image

}))

)

}catch(err){
console.error("Saved posts error:", err)
}

setSavedImages(parsed.saved_images || [])

}

}

loadData()

window.addEventListener("storage", loadData)

return ()=>window.removeEventListener(
"storage",
loadData
)

},[editing])

/* LOGOUT */

const handleLogout = () => {

localStorage.removeItem("pixelUser")

window.dispatchEvent(new Event("storage"))

navigate("/")

}

/* IMAGE UPLOAD */

const handleImageUpload = (e) => {

const file = e.target.files[0]

if(!file) return

if(!file.type.startsWith("image/")){
alert("Please upload image")
return
}

const reader = new FileReader()

reader.onload = ()=>{

const img = new Image()

img.onload = ()=>{

const size = Math.min(img.width,img.height)

const canvas = document.createElement("canvas")

canvas.width = size
canvas.height = size

const ctx = canvas.getContext("2d")

ctx.drawImage(
img,
(img.width - size) / 2,
(img.height - size) / 2,
size,
size,
0,
0,
size,
size
)

const cropped = canvas.toDataURL("image/png")

setNewPhoto(cropped)

}

img.src = reader.result

}

reader.readAsDataURL(file)

}

/* SAVE PROFILE */

const saveProfile = () => {

if(!newName.trim()){
alert("Username required")
return
}

const updatedUser = {
...user,
name:newName,
picture:newPhoto || user.picture
}

localStorage.setItem(
"pixelUser",
JSON.stringify(updatedUser)
)

window.dispatchEvent(new Event("storage"))
window.dispatchEvent(new Event("userChanged"))

setUser(updatedUser)

setEditing(false)

}

/* CANCEL EDIT */

const cancelEdit = () => {

setNewName(user.name)
setNewPhoto(user.picture)

setEditing(false)

}

/* RING COLOR */

const getRingColor = () => {

if(!user) return ""

if(user.domain === "sait.ac.in"){
return "ring-[#b55f22]"
}

if(user.domain === "saip.ac.in"){
return "ring-blue-600"
}

return "ring-neutral-400"

}

/* LOAD FOLLOW CONNECTIONS */

const loadConnections = async (
emails,
type
) => {

try{

const users = await Promise.all(

emails.map(async (email)=>{

const res = await fetch(
`http://127.0.0.1:8000/api/users/public/${email}/`
)

return await res.json()

})

)

if(type === "followers"){
setFollowersData(users)
}else{
setFollowingData(users)
}

}catch(err){

console.error(err)

}

}

if(!user){
return(
<div className="min-h-screen flex items-center justify-center">
Not logged in
</div>
)
}

return(

<div className="min-h-screen pt-24 bg-white dark:bg-black text-black dark:text-white overflow-x-hidden">

<div className="max-w-6xl mx-auto px-4 sm:px-6">

<div className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16 pt-6">

{/* PROFILE IMAGE */}

<div className="flex flex-col items-center gap-3 shrink-0">

<img
src={newPhoto || user.picture}
className={`
w-32 h-32 md:w-40 md:h-40
rounded-full object-cover
ring-4 ring-offset-4
ring-offset-white dark:ring-offset-black
${getRingColor()}
`}
/>

{editing && (

<input
type="file"
accept="image/*"
onChange={handleImageUpload}
className="text-xs"
/>

)}

</div>

{/* USER INFO */}

<div className="flex flex-col gap-3 text-center md:text-left">

{/* NAME */}

<div className="flex items-center gap-3 justify-center md:justify-start">

{editing ? (

<input
value={newName}
onChange={(e)=>setNewName(e.target.value)}
className="
text-3xl md:text-4xl
font-headersfont
px-3 py-1 rounded-lg
border border-gray-300 dark:border-neutral-700
bg-white dark:bg-neutral-900
"
/>

) : (

<>

<h1 className="text-3xl md:text-4xl font-headersfont">
{user.name}
</h1>

<button
onClick={()=>setEditing(true)}
className="
w-8 h-8
flex items-center justify-center
rounded-full
hover:bg-neutral-200
dark:hover:bg-neutral-800
transition
"
>
<Pencil
size={16}
className="text-gray-500 hover:text-blue-600"
/>
</button>

</>

)}

</div>

{/* EMAIL */}

<p className="text-gray-500 dark:text-gray-400 text-sm">
{user.email}
</p>

{/* BUTTONS */}

<div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">

{editing && (

<>

<button
onClick={saveProfile}
className="
px-5 py-2
rounded-xl
bg-blue-600 text-white
hover:bg-blue-700 transition
"
>
Save
</button>

<button
onClick={cancelEdit}
className="
px-5 py-2 rounded-xl
border border-neutral-300
dark:border-neutral-700
hover:bg-neutral-100
dark:hover:bg-neutral-900
transition
"
>
Cancel
</button>

</>

)}

<button
onClick={handleLogout}
className="
px-5 py-2 rounded-xl
border border-red-500
text-red-500
hover:bg-red-500 hover:text-white
transition
"
>
Logout
</button>

{user?.isAdmin && (

<button
onClick={()=>navigate("/admin")}
className="
px-5 py-2 rounded-xl
bg-purple-600 text-white
hover:bg-purple-700 transition
"
>
Admin Panel
</button>

)}

</div>

{/* STATS */}

<div className="
flex gap-8 mt-3
text-sm md:text-base
text-gray-700 dark:text-gray-300
justify-center md:justify-start
">

<span>
<b>
{savedPosts.length + savedImages.length}
</b> Saves
</span>

<button
onClick={()=>{

loadConnections(
user.followers || [],
"followers"
)

setShowFollowers(true)

}}
className="
hover:text-blue-500 transition
"
>

<b>
{user.followers?.length || 0}
</b> Followers

</button>

<button
onClick={()=>{

loadConnections(
user.following || [],
"following"
)

setShowFollowing(true)

}}
className="
hover:text-blue-500 transition
"
>

<b>
{user.following?.length || 0}
</b> Following

</button>

</div>

</div>

</div>

{/* 🔥 INSTAGRAM STYLE TABS */}

<div className="mt-16 border-t border-neutral-800 max-w-4xl mx-auto">

{/* TABS */}

<div className="flex justify-center gap-20">

<button
onClick={()=>setActiveTab("posts")}
className={`
py-4 text-sm font-medium border-t-2 transition
${activeTab === "posts"
? "border-white text-white"
: "border-transparent text-gray-500"
}
`}
>
Saved Posts
</button>

<button
onClick={()=>setActiveTab("images")}
className={`
py-4 text-sm font-medium border-t-2 transition
${activeTab === "images"
? "border-white text-white"
: "border-transparent text-gray-500"
}
`}
>
Saved Images
</button>

</div>

{/* POSTS */}

{activeTab === "posts" && (

<div className="mt-8">

{savedPosts.length === 0 ? (

<p className="text-gray-500 text-center">
No saved posts yet.
</p>

) : (

<div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-5">

{savedPosts.map((post,i)=>(

<img
key={post.id}
src={post.image}
onClick={()=>setPostViewer(i)}
className="
aspect-square
w-full
object-cover
cursor-pointer
rounded-xl
hover:scale-[1.02]
hover:opacity-90
transition duration-300
"
/>

))}

</div>

)}

</div>

)}

{/* IMAGES */}

{activeTab === "images" && (

<div className="mt-8">

{savedImages.length === 0 ? (

<p className="text-gray-500 text-center">
No saved images yet.
</p>

) : (

<div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-5">

{savedImages.map((img,i)=>(

<img
key={i}
src={img}
onClick={()=>setViewer(i)}
className="
aspect-square
w-full
object-cover
cursor-pointer
rounded-xl
hover:scale-[1.02]
hover:opacity-90
transition duration-300
"
/>

))}

</div>

)}

</div>

)}

</div>

{/* 🔥 FOLLOWERS MODAL */}

{showFollowers && (

<div className="
fixed inset-0 z-50
bg-black/70
flex items-center justify-center
px-4
">

<div className="
w-full max-w-md
bg-neutral-900
border border-neutral-800
rounded-3xl
overflow-hidden
shadow-2xl
">

<div className="
flex items-center justify-between
p-5 border-b border-neutral-800
">

<h2 className="font-semibold text-lg">
Followers
</h2>

<button
onClick={()=>
setShowFollowers(false)
}
className="
text-gray-400 hover:text-white
transition
"
>
✕
</button>

</div>

{/* 🔥 SEARCH */}

<div className="p-4 border-b border-neutral-800">

<input
value={followersSearch}
onChange={(e)=>
setFollowersSearch(e.target.value)
}
placeholder="Search followers..."
className="
w-full px-4 py-3
rounded-xl
bg-neutral-800
border border-neutral-700
outline-none
focus:border-blue-500
text-sm
"
/>

</div>

<div className="max-h-[420px] overflow-y-auto">

{followersData.length === 0 ? (

<p className="
text-center py-10 text-gray-500
">
No followers yet
</p>

) : (

followersData
.filter(person =>

person.name
?.toLowerCase()
.includes(
followersSearch.toLowerCase()
)

||

person.email
?.toLowerCase()
.includes(
followersSearch.toLowerCase()
)

)
.map(person => (

<div
key={person.email}
className="
flex items-center justify-between
p-4 hover:bg-neutral-800 transition
"
>

{/* PROFILE CLICK AREA */}

<div
onClick={()=>{

navigate(
`/user/${encodeURIComponent(
person.email
)}`
)

setShowFollowers(false)

}}
className="
flex items-center gap-4
cursor-pointer flex-1
"
>

<img
src={person.picture}
className="
w-12 h-12 rounded-full object-cover
"
/>

<div>

<p className="font-medium">
{person.name}
</p>

<p className="
text-sm text-gray-500
">
@{
person.email.split("@")[0]
}
</p>

</div>

</div>

{/* 🔥 REMOVE FOLLOWER */}

<button
onClick={async (e)=>{

e.stopPropagation()

try{

await fetch(
"http://127.0.0.1:8000/api/users/remove-follower/",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
user_email:user.email,
follower_email:person.email
})
}
)

/* UPDATE UI */

setFollowersData(prev =>
prev.filter(
f => f.email !== person.email
)
)

const updatedUser = {

...user,

followers:
(user.followers || []).filter(
f => f !== person.email
)

}

setUser(updatedUser)

localStorage.setItem(
"pixelUser",
JSON.stringify(updatedUser)
)

window.dispatchEvent(
new Event("storage")
)

}catch(err){

console.error(err)

}

}}
className="
w-8 h-8
rounded-full
flex items-center justify-center
text-gray-400
hover:bg-red-500/20
hover:text-red-500
transition
"
>
✕
</button>

</div>

))

)}

</div>

</div>

</div>

)}

{/* 🔥 FOLLOWING MODAL */}

{showFollowing && (

<div className="
fixed inset-0 z-50
bg-black/70
flex items-center justify-center
px-4
">

<div className="
w-full max-w-md
bg-neutral-900
border border-neutral-800
rounded-3xl
overflow-hidden
shadow-2xl
">

<div className="
flex items-center justify-between
p-5 border-b border-neutral-800
">

<h2 className="font-semibold text-lg">
Following
</h2>

<button
onClick={()=>
setShowFollowing(false)
}
className="
text-gray-400 hover:text-white
transition
"
>
✕
</button>

</div>

{/* 🔥 SEARCH */}

<div className="p-4 border-b border-neutral-800">

<input
value={followingSearch}
onChange={(e)=>
setFollowingSearch(e.target.value)
}
placeholder="Search following..."
className="
w-full px-4 py-3
rounded-xl
bg-neutral-800
border border-neutral-700
outline-none
focus:border-blue-500
text-sm
"
/>

</div>

<div className="max-h-[420px] overflow-y-auto">

{followingData.length === 0 ? (

<p className="
text-center py-10 text-gray-500
">
No following yet
</p>

) : (

followingData
.filter(person =>

person.name
?.toLowerCase()
.includes(
followingSearch.toLowerCase()
)

||

person.email
?.toLowerCase()
.includes(
followingSearch.toLowerCase()
)

)
.map(person => (

<div
key={person.email}
onClick={()=>{

navigate(
`/user/${encodeURIComponent(
person.email
)}`
)

setShowFollowing(false)

}}
className="
flex items-center gap-4
p-4 cursor-pointer
hover:bg-neutral-800 transition
"
>

<img
src={person.picture}
className="
w-12 h-12 rounded-full object-cover
"
/>

<div>

<p className="font-medium">
{person.name}
</p>

<p className="
text-sm text-gray-500
">
@{
person.email.split("@")[0]
}
</p>

</div>

</div>

))

)}

</div>

</div>

</div>

)}

{/* IMAGE VIEWER */}

{viewer !== null && (

<ImageViewer
images={savedImages}
index={viewer}
setViewer={setViewer}
/>

)}

{/* POST VIEWER */}

{postViewer !== null && (

<ImageViewer
images={savedPosts.map(p=>p.image)}
index={postViewer}
setViewer={setPostViewer}
/>

)}

</div>

</div>

)

}