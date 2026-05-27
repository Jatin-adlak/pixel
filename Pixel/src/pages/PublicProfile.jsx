import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import ImageViewer from "./ImageViewer"

export default function PublicProfile(){

const { email } = useParams()

const currentUser = JSON.parse(
localStorage.getItem("pixelUser")
)

const [profile,setProfile] = useState(null)
const [savedPosts,setSavedPosts] = useState([])

const [viewer,setViewer] = useState(null)
const [postViewer,setPostViewer] = useState(null)

const [activeTab,setActiveTab] = useState("posts")

const [isFollowing,setIsFollowing] = useState(false)
const [requestSent,setRequestSent] = useState(false)

useEffect(()=>{

const loadProfile = async ()=>{

try{

const res = await fetch(
`${import.meta.env.VITE_API_URL}api/users/public/${email}/`
)

const data = await res.json()

setProfile(data)

setIsFollowing(
(data.followers || []).includes(
currentUser?.email
)
)

setRequestSent(
(data.follow_requests || []).includes(
currentUser?.email
)
)

const postsRes = await fetch(
`${import.meta.env.VITE_API_URL}api/posts/`
)

const allPosts = await postsRes.json()

const filteredPosts = allPosts.filter(
post => (data.saved_posts || []).includes(post._id)
)

setSavedPosts(

filteredPosts.map(post=>({

id:post._id,
image:post.image_url || post.image

}))

)

}catch(err){
console.error(err)
}

}

loadProfile()

},[email])

/* 🔥 FOLLOW REQUEST */

const sendRequest = async () => {

if(!currentUser){
alert("Login required")
return
}

try{

const res = await fetch(
`${import.meta.env.VITE_API_URL}api/users/follow-request/`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
sender:currentUser.email,
target:profile.email
})
}
)

const data = await res.json()

console.log("FOLLOW RESPONSE:", data)

/* 🔥 UPDATE UI INSTANTLY */

setRequestSent(true)

setProfile(prev => ({

...prev,

follow_requests:[
...(prev?.follow_requests || []),
currentUser.email
]

}))

/* 🔥 UPDATE LOCAL USER */

const storedUser = JSON.parse(
localStorage.getItem("pixelUser") || "{}"
)

const updatedUser = {

...storedUser

}

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

}

/* 🔥 UNFOLLOW */

/* 🔥 UNFOLLOW */

const unfollow = async () => {

try{

await fetch(
`${import.meta.env.VITE_API_URL}api/users/unfollow/`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
user_email:currentUser.email,
target_email:profile.email
})
}
)

/* 🔥 UPDATE FRONTEND */

setIsFollowing(false)

setProfile(prev => ({

...prev,

followers:
(prev.followers || []).filter(
f => f !== currentUser.email
)

}))

/* 🔥 UPDATE LOCAL USER */

const storedUser = JSON.parse(
localStorage.getItem("pixelUser") || "{}"
)

const updatedUser = {

...storedUser,

following:
(storedUser.following || []).filter(
f => f !== profile.email
)

}

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

}

if(!profile){
return(
<div className="min-h-screen flex items-center justify-center">
Loading...
</div>
)
}

return(

<div className="min-h-screen pt-24 bg-white dark:bg-black text-black dark:text-white overflow-x-hidden px-4 sm:px-6">

<div className="max-w-6xl mx-auto">

{/* PROFILE HEADER */}

<div className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16 pt-6">

{/* PROFILE IMAGE */}

<div className="shrink-0">

<img
src={profile.picture}
className="
w-32 h-32 md:w-40 md:h-40
rounded-full object-cover
ring-4 ring-offset-4
ring-offset-white dark:ring-offset-black
ring-neutral-400
"
/>

</div>

{/* USER INFO */}

<div className="flex flex-col gap-3 text-center md:text-left">

<h1 className="text-3xl md:text-4xl font-headersfont">
{profile.name}
</h1>

<p className="text-gray-500 dark:text-gray-400 text-sm">
{profile.email}
</p>

{/* FOLLOW BUTTON */}

{currentUser?.email !== profile.email && (

<div className="mt-2">

{isFollowing ? (

<button
onClick={unfollow}
className="
px-6 py-2 rounded-xl
border border-neutral-400
hover:bg-neutral-100
dark:hover:bg-neutral-900
transition
"
>
Following
</button>

) : requestSent ? (

<button
disabled
className="
px-6 py-2 rounded-xl
bg-neutral-500 text-white
cursor-not-allowed
"
>
Request Sent
</button>

) : (

<button
onClick={sendRequest}
className="
px-6 py-2 rounded-xl
bg-blue-600 text-white
hover:bg-blue-700
transition
"
>
Follow
</button>

)}

</div>

)}

<div className="
flex gap-8 mt-3
text-sm md:text-base
text-gray-700 dark:text-gray-300
justify-center md:justify-start
">

<span>
<b>
{savedPosts.length +
(profile.saved_images?.length || 0)}
</b> Saves
</span>

<span>
<b>{profile.followers?.length || 0}</b> Followers
</span>

<span>
<b>{profile.following?.length || 0}</b> Following
</span>

</div>

</div>

</div>

{/* 🔥 INSTAGRAM STYLE TABS */}

<div className="mt-16 border-t border-neutral-800 max-w-4xl mx-auto">

{/* TABS */}

<div className="flex justify-center gap-16">

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

{!isFollowing ? (

<div className="text-center py-20">

<p className="text-gray-500 mb-5">
Follow this account to view saved images
</p>

{!requestSent && currentUser?.email !== profile.email && (

<button
onClick={sendRequest}
className="
px-6 py-2 rounded-xl
bg-blue-600 text-white
hover:bg-blue-700
transition
"
>
Follow
</button>

)}

{requestSent && (

<button
disabled
className="
px-6 py-2 rounded-xl
bg-neutral-500 text-white
cursor-not-allowed
"
>
Request Sent
</button>

)}

</div>

) : profile.saved_images?.length === 0 ? (

<p className="text-gray-500 text-center">
No saved images yet.
</p>

) : (

<div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-5">

{profile.saved_images.map((img,i)=>(

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

{/* IMAGE VIEWER */}

{viewer !== null && (

<ImageViewer
images={profile.saved_images}
index={viewer}
setViewer={setViewer}
hideDownload={true}
/>

)}

{/* POST VIEWER */}

{postViewer !== null && (

<ImageViewer
images={savedPosts.map(p=>p.image)}
index={postViewer}
setViewer={setPostViewer}
hideDownload={true}
/>

)}

</div>

</div>

)

}