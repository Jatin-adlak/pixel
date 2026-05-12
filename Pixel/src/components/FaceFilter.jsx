import { useNavigate, useParams } from "react-router-dom"

export default function FaceFilter(){

const navigate = useNavigate()
const { id } = useParams()

const faceData = localStorage.getItem("faceData")

/* EVENTS */

const events = {
1:[
"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512354/photo6_p5lng5.jpg",
"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512346/photo10_m1fzw9.jpg",
"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512341/photo5_cdywlo.jpg"
],
2:[
"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512346/photo10_m1fzw9.jpg",
"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512341/photo5_cdywlo.jpg"
]
}

const images = events[id] || []

return(

<div className="min-h-screen w-full bg-white dark:bg-black text-black dark:text-white">

{/* ✅ FIXED CONTAINER */}
<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">

<h1 className="text-3xl mb-6 text-center">
Your Photos
</h1>

{/* ❌ NO FACE */}
{!faceData ? (

<div className="text-center space-y-4">

<p className="text-gray-500">
No face data found. Add your face to enable this feature.
</p>

<button
onClick={()=>navigate(`/face-setup`)}
className="px-5 py-2 rounded-xl bg-blue-600 text-white"
>
Set Up Face Recognition
</button>

</div>

) : (

<div className="space-y-6">

{/* FACE PREVIEW */}
<div className="flex flex-col items-center gap-3">

<img
src={faceData}
className="w-24 h-24 rounded-full object-cover"
/>

<p className="text-gray-500 text-sm">
Showing results for this event
</p>

</div>

{/* ⚠️ IMPORTANT FIX */}
{images.length === 0 ? (

<p className="text-center text-gray-500">
No images in this event.
</p>

) : (

<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

{images.map((img,i)=>(
<img
key={i}
src={img}
className="rounded-lg object-cover w-full h-40"
/>
))}

</div>

)}

</div>

)}

</div>
</div>

)

}