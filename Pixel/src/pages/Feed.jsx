import { useState, useEffect } from "react"
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react"
import { getPosts } from "../api/api"

export default function Feed(){

const user = JSON.parse(localStorage.getItem("pixelUser"))

const [posts,setPosts] = useState([])

/* 🔥 LOAD POSTS FROM BACKEND */

useEffect(()=>{

getPosts()
.then((data)=>{

const formatted = data.map(p => ({
...p,

// 🔥 FIX: SUPPORT BOTH image_url AND image
image: p.image_url || p.image || null,

liked:(p.liked_by || []).includes(user?.email),
likes:p.likes || 0,
saved:(user?.saved_posts || []).includes(p._id),
hearts:[],
showComments:false,
commentInput:"",
comments:p.comments || []
}))

setPosts(formatted)

})
.catch(err=>{
console.error("Error fetching posts:", err)
setPosts([])
})

},[])

/* UPDATE POSTS */

const updatePosts = (newPosts) => {
setPosts(newPosts)
}

/* SAVE */

const handleSave = async (post) => {

if(!user){
alert("Please login to save posts")
return
}

try{

const res = await fetch(
"http://127.0.0.1:8000/api/users/save-post/",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email:user.email,
post_id:post._id
})
}
)

const data = await res.json()

// 🔥 UPDATE LOCAL USER
const updatedUser = {
...user,
saved_posts:data.saved_posts || []
}

localStorage.setItem(
"pixelUser",
JSON.stringify(updatedUser)
)

window.dispatchEvent(
new Event("storage")
)

}catch(err){
console.error("Save error:", err)
}

const updated = posts.map(p =>
p._id === post._id
? {...p, saved: !p.saved}
: p
)

updatePosts(updated)
}

/* LIKE */

const handleLike = async (postId) => {

if(!user){
alert("Please login to like posts")
return
}

const currentPost = posts.find(
post => post._id === postId
)

if(!currentPost) return

try{

// 🔥 UPDATE DATABASE
await fetch(
`http://127.0.0.1:8000/api/posts/like/${postId}/`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email:user.email
})
}
)

}catch(err){
console.error("Like error:", err)
}

const updated = posts.map(post=>{

if(post._id !== postId) return post

if(!post.liked){

const hearts = Array.from({length:6}).map((_,i)=>({
id:Date.now()+i,
left:Math.random()*20-10
}))

setTimeout(()=>{
setPosts(prev =>
prev.map(p =>
p._id === postId ? {...p, hearts:[]} : p
))
},900)

return {
...post,
liked:true,
likes:(post.likes || 0) + 1,
hearts
}

}

return {
...post,
liked:false,
likes:Math.max((post.likes || 1) - 1, 0)
}

})

updatePosts(updated)
}

/* COMMENTS */

const toggleComments = (postId) => {

if(!user){
alert("Please login to comment")
return
}

updatePosts(
posts.map(post =>
post._id === postId
? {...post, showComments: !post.showComments}
: post
)
)
}

const updateCommentInput = (postId,value) => {

updatePosts(
posts.map(post =>
post._id === postId
? {...post, commentInput:value}
: post
)
)
}

const addComment = async (postId) => {

const post = posts.find(p=>p._id === postId)

if(!post || !post.commentInput?.trim()) return

try{

// 🔥 SAVE TO DATABASE
await fetch(
`http://127.0.0.1:8000/api/posts/comment/${postId}/`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
user:user.name || user.email,
text:post.commentInput
})
}
)

}catch(err){
console.error("Comment error:", err)
}

updatePosts(
posts.map(p=>{

if(p._id !== postId) return p

return {
...p,
commentInput:"",
comments:[
...(p.comments || []),
{
id:Date.now(),
user:user.name,
text:post.commentInput
}
]
}

})
)
}

const deleteComment = async (postId, commentId) => {

const post = posts.find(p => p._id === postId)

if(!post) return

const commentIndex = (post.comments || []).findIndex(
c => c.id === commentId
)

try{

// 🔥 DELETE FROM DATABASE
await fetch(
`http://127.0.0.1:8000/api/posts/comment/delete/${postId}/${commentIndex}/`,
{
method:"DELETE"
}
)

}catch(err){
console.error("Delete comment error:", err)
}

updatePosts(
posts.map(post=>{

if(post._id !== postId) return post

return {
...post,
comments: (post.comments || []).filter(
c => c.id !== commentId
)
}

})
)
}
return(

<div className="min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-x-hidden">

<h1 className="text-4xl text-center pt-20 font-introducing">
Event Feed
</h1>

<div className="max-w-4xl mx-auto mt-16 space-y-16 px-4">

{/* EMPTY STATE */}

{posts.length === 0 ? (

<p className="text-center text-gray-500 mt-20">
No posts yet.
</p>

) : (

posts.map(post=>(

<div key={post._id} className="flex flex-col md:flex-row gap-6 items-start">

{/* POST */}

<div className="flex-1 border border-neutral-200 dark:border-neutral-800 p-6 rounded-xl">

<h2 className="font-semibold text-xl mb-2">
{post.title}
</h2>

<p className="opacity-80 mb-4">
{post.text}
</p>

{/* 🔥 FIXED IMAGE RENDER */}
{post.image ? (
<img
src={post.image}
className="w-full rounded-lg"
onError={(e)=>{
e.target.src = "https://via.placeholder.com/500x300?text=Image+Not+Available"
}}
/>
) : (
<div className="w-full h-48 flex items-center justify-center bg-gray-200 dark:bg-neutral-800 rounded-lg text-sm opacity-60">
No Image
</div>
)}

{/* ACTION BAR */}

<div className="flex items-center justify-between mt-4">

<div className="flex gap-4">

<div className="flex items-center gap-1">

<button onClick={()=>handleLike(post._id)}>
<Heart
size={20}
fill={post.liked ? "currentColor" : "none"}
/>
</button>

<span className="text-sm">
{post.likes || 0}
</span>

</div>

<button
onClick={()=>toggleComments(post._id)}
className="w-9 h-9 flex items-center justify-center rounded-full hover:text-blue-600"
>
<MessageCircle size={20}/>
</button>

<button className="w-9 h-9 flex items-center justify-center rounded-full hover:text-blue-600">
<Share2 size={20}/>
</button>

</div>

<button
onClick={()=>handleSave(post)}
className={`w-9 h-9 flex items-center justify-center rounded-full
${post.saved ? "text-blue-600" : ""}
`}
>
<Bookmark size={20} fill={post.saved ? "currentColor" : "none"} />
</button>

</div>

</div>

{/* Comments  */}

{post.showComments && (

<div className="w-full md:w-80 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-4">

<h3 className="font-semibold">Comments</h3>

<div className="space-y-3 max-h-80 overflow-y-auto">

{(post.comments || []).map(comment => (

<div key={comment.id || Math.random()}>

<p className="text-sm">
<b>{comment.user}</b> {comment.text}
</p>

<div className="flex gap-3 text-xs mt-1">

{user && comment.user === user.name && (
<button
onClick={()=>deleteComment(post._id,comment.id)}
className="text-red-500"
>
Delete
</button>
)}

</div>

</div>

))}

</div>

<div className="flex gap-2">

<input
value={post.commentInput || ""}
onChange={(e)=>
updateCommentInput(
post._id,
e.target.value
)
}
placeholder="Add comment..."
className="flex-1 text-sm border rounded-lg px-3 py-1
bg-white text-black dark:bg-neutral-900 dark:text-white
border-neutral-300 dark:border-neutral-700"
/>

<button
onClick={()=>addComment(post._id)}
className="text-sm px-3 py-1 border rounded-3xl"
>
Post
</button>

</div>

</div>

)}

</div>

))

)}

</div>

</div>

)

}