import { useEffect, useState } from "react"
import { getNewsletters } from "../api/api"

export default function Newsletter(){

const [newsletters,setNewsletters] = useState([])
const [loading,setLoading] = useState(true)

useEffect(()=>{

getNewsletters()

.then((data)=>{

console.log(
"NEWSLETTER DATA:",
data
)

if(Array.isArray(data)){

setNewsletters(data)

}else{

setNewsletters([])

}

})

.catch((err)=>{

console.error(
"NEWSLETTER ERROR:",
err
)

setNewsletters([])

})

.finally(()=>{

setLoading(false)

})

},[])


/* 🔥 HANDLE BOTH ABSOLUTE + RELATIVE URLS */

const getFileUrl = (url)=>{

if(!url) return ""

if(url.startsWith("http")){

return url

}

return `http://127.0.0.1:8000${url}`

}

return(

<div className="
pt-28
min-h-screen
bg-white
dark:bg-black
text-black
dark:text-white
">

<div className="
max-w-7xl
mx-auto
px-6
">

<h1 className="
text-4xl
font-introducing
mb-16
text-center
">
Newsletters
</h1>


{loading ? (

<div className="
h-40
flex
items-center
justify-center
">

<p className="
text-lg
text-gray-500
animate-pulse
">
Loading...
</p>

</div>

) : newsletters.length===0 ? (

<div className="
h-40
flex
items-center
justify-center
">

<p className="
text-gray-500
text-lg
">
No newsletters available
</p>

</div>

) : (

<div className="
grid
sm:grid-cols-1
md:grid-cols-2
lg:grid-cols-3
gap-8
">

{newsletters.map((n,i)=>(

<div
key={n?._id || i}
className="
bg-neutral-100
dark:bg-neutral-900
rounded-3xl
overflow-hidden
shadow-lg
hover:shadow-2xl
hover:scale-[1.03]
transition
duration-300
"
>

{/* COVER */}

<img
src={
getFileUrl(
n?.cover
) || "/fallback.jpg"
}
alt={n?.title}
className="
w-full
h-64
object-cover
"
/>

{/* CONTENT */}

<div className="p-6">

<h2 className="
text-xl
font-headersfont
mb-5
line-clamp-2
">

{n?.title || "Untitled"}

</h2>

<a
href={
getFileUrl(
n?.pdf
)
}
target="_blank"
rel="noopener noreferrer"
className="
inline-flex
items-center
justify-center
w-full
px-5 py-3
rounded-full
font-buttonsfont
bg-black
text-white
dark:bg-white
dark:text-black
hover:scale-105
transition
"
>

📄 Open Newsletter

</a>

</div>

</div>

))}

</div>

)}

</div>

</div>

)

}