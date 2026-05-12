import { useState, useEffect } from "react"

export default function ManageFeed(){

const [image,setImage] = useState(null)
const [title,setTitle] = useState("")
const [caption,setCaption] = useState("")
const [posts,setPosts] = useState([])

/* LOAD POSTS */

const loadPosts = async () => {
const res = await fetch("http://localhost:8000/api/posts/")
const data = await res.json()
setPosts(data)
}

useEffect(()=>{
loadPosts()
},[])

/* IMAGE */

const handleImage = (e)=>{
setImage(e.target.files[0])
}

/* SAVE */

const savePost = async () => {

if(!image || !title){
alert("Image & title required")
return
}

const formData = new FormData()
formData.append("image", image)
formData.append("title", title)
formData.append("caption", caption)

await fetch("http://localhost:8000/api/posts/",{
method:"POST",
body:formData
})

alert("Post uploaded ✅")

setImage(null)
setTitle("")
setCaption("")

loadPosts()
}

/* DELETE */

const deletePost = async (id)=>{
await fetch(`http://localhost:8000/api/posts/${id}/`,{
method:"DELETE"
})
loadPosts()
}

return(

<div className="space-y-6">

<input type="file" onChange={handleImage}/>

<input
value={title}
onChange={(e)=>setTitle(e.target.value)}
placeholder="Title"
className="border px-3 py-2 w-full"
/>

<textarea
value={caption}
onChange={(e)=>setCaption(e.target.value)}
placeholder="Caption"
className="border px-3 py-2 w-full"
/>

<button onClick={savePost} className="bg-blue-600 text-white px-4 py-2 rounded">
Upload Post
</button>

<div className="grid grid-cols-2 gap-4">

{posts.map(p=>(
<div key={p._id}>

<img src={p.image_url} />
<h3>{p.title}</h3>

<button onClick={()=>deletePost(p._id)}>Delete</button>

</div>
))}

</div>

</div>

)
}