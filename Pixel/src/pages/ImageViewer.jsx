import { useEffect, useState } from "react"
import {
ChevronLeft,
ChevronRight,
Download,
Bookmark,
X
} from "lucide-react"

export default function ImageViewer({
images,
index,
setViewer,
hideDownload=false
}) {

const user = JSON.parse(localStorage.getItem("pixelUser"))
const image = images[index]

const [saved,setSaved] = useState(
(user?.saved_images || []).includes(image)
)

/* 🔥 UPDATE SAVE STATE WHEN IMAGE CHANGES */

useEffect(()=>{

setSaved(
(user?.saved_images || []).includes(image)
)

},[image,user])

/* KEYBOARD NAVIGATION */

useEffect(()=>{

const handleKey = (e)=>{

if(e.key === "ArrowRight"){
setViewer((prev)=>(prev + 1) % images.length)
}

if(e.key === "ArrowLeft"){
setViewer((prev)=>(prev - 1 + images.length) % images.length)
}

if(e.key === "Escape"){
setViewer(null)
}

}

window.addEventListener("keydown",handleKey)

return ()=>window.removeEventListener(
"keydown",
handleKey
)

},[images,setViewer])

/* NAVIGATION */

const nextImage = ()=>
setViewer((index + 1) % images.length)

const prevImage = ()=>
setViewer((index - 1 + images.length) % images.length)

/* 🔥 BOOKMARK */

const toggleSave = async ()=>{

if(!user){
alert("Login to bookmark images")
return
}

try{

const res = await fetch(
`${import.meta.env.VITE_API_URL}api/users/save-image/`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email:user.email,
image_url:image
})
}
)

const data = await res.json()

/* 🔥 UPDATE LOCAL USER */

const updatedUser = {
...user,
saved_images:data.saved_images || []
}

localStorage.setItem(
"pixelUser",
JSON.stringify(updatedUser)
)

window.dispatchEvent(
new Event("storage")
)

setSaved(data.saved)

}catch(err){
console.error("Save image error:", err)
}

}

/* 🔥 DOWNLOAD */

const handleDownload = () => {

if(!image) return

/* Cloudinary */
if(image.includes("res.cloudinary.com")){

const link = document.createElement("a")

link.href = image.replace(
"/upload/",
"/upload/fl_attachment/"
)

link.download = "photo.jpg"
link.click()

return
}

/* Normal URL */

fetch(image)
.then(res => res.blob())
.then(blob => {

const url = window.URL.createObjectURL(blob)

const a = document.createElement("a")
a.href = url

a.download = "photo.png"

document.body.appendChild(a)
a.click()
a.remove()

window.URL.revokeObjectURL(url)

})

}

if(!image) return null

return(

<div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 px-4">

{/* CLOSE BUTTON */}

<button
onClick={()=>setViewer(null)}
className="absolute top-5 right-5 z-50 text-white hover:text-red-500 transition"
>
<X size={30}/>
</button>

{/* IMAGE + ACTIONS */}

<div className="relative group flex flex-col items-center">

{/* IMAGE */}

<img
src={image}
className="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
/>

{/* 📱 MOBILE ACTION BAR */}

<div className="flex md:hidden justify-center gap-4 mt-5">

{!hideDownload && (
<button
onClick={handleDownload}
className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full border border-white/10"
>
<Download size={18}/>
<span>Download</span>
</button>
)}

<button
onClick={toggleSave}
className={`flex items-center gap-2 px-6 py-3 rounded-full transition ${
saved
? "bg-blue-600 text-white"
: "bg-black text-white border border-white/10"
}`}
>
<Bookmark
size={18}
fill={saved ? "currentColor" : "none"}
/>
<span>Save</span>
</button>

</div>

{/* 💻 DYNAMIC ISLAND */}

<div
className="
hidden md:flex
absolute top-8 left-1/2 -translate-x-1/2
items-center justify-center
bg-black/90 text-white
rounded-full
overflow-hidden
backdrop-blur-xl
border border-white/10
transition-all duration-300
md:w-3 md:opacity-0
md:group-hover:w-44
md:group-hover:opacity-100
h-11
shadow-xl
"
>

<div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition duration-300">

{!hideDownload && (
<>
<button
onClick={handleDownload}
className="hover:text-blue-500 transition"
>
<Download size={20}/>
</button>

<span className="text-gray-500">|</span>
</>
)}

<button
onClick={toggleSave}
className={`hover:text-blue-500 transition ${
saved ? "text-blue-500" : ""
}`}
>
<Bookmark
size={20}
fill={saved ? "currentColor" : "none"}
/>
</button>

</div>

</div>

</div>

{/* LEFT */}

<button
onClick={prevImage}
className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-white bg-black/50 p-3 rounded-full hover:bg-black/80 transition backdrop-blur-md"
>
<ChevronLeft size={32}/>
</button>

{/* RIGHT */}

<button
onClick={nextImage}
className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-white bg-black/50 p-3 rounded-full hover:bg-black/80 transition backdrop-blur-md"
>
<ChevronRight size={32}/>
</button>

{/* BACKDROP CLICK */}

<div
onClick={()=>setViewer(null)}
className="absolute inset-0 -z-10"
/>

</div>

)

}