import { useNavigate } from "react-router-dom"
import { useRef, useState, useEffect } from "react"
import { getEvents } from "../api/api"

export default function Gallery(){

const navigate = useNavigate()

/* 🔥 BACKEND EVENTS */

const [events,setEvents] = useState([])

useEffect(()=>{

getEvents()
.then((data)=>{

  console.log("📡 EVENTS:", data)

  const formatted = (data || []).map(event => {

    let coverUrl = null

    // ✅ PRIORITY 1: backend already gives full URL
    if (event.cover && typeof event.cover === "string" && event.cover.startsWith("http")) {
      coverUrl = event.cover
    }

    // ✅ PRIORITY 2: cover_url field
    else if (event.cover_url) {
      coverUrl = event.cover_url
    }

    // ✅ PRIORITY 3: file_id → build URL
    else if (event.cover) {
      coverUrl = `http://127.0.0.1:8000/api/events/cover/${event.cover}/`
    }

    return {
      ...event,
      coverUrl
    }
  })

  setEvents(formatted)

})
.catch((err)=>{
  console.error("Error fetching events:", err)
  setEvents([])
})

},[])

/* SEARCH */

const [search,setSearch] = useState("")

const filteredEvents = events.filter(event =>
(event.name || "").toLowerCase().includes(search.toLowerCase())
)

/* SCROLL SYSTEM */

const sectionRefs = useRef([])
const [activeIndex,setActiveIndex] = useState(0)

useEffect(()=>{

const handleScroll = () => {

filteredEvents.forEach((_,i)=>{
const section = sectionRefs.current[i]
if(!section) return

const rect = section.getBoundingClientRect()

if(rect.top < 200 && rect.bottom > 200){
setActiveIndex(i)
}
})

}

window.addEventListener("scroll",handleScroll)
return ()=>window.removeEventListener("scroll",handleScroll)

},[filteredEvents])

return(

<div className="min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-x-hidden">

<h1 className="text-4xl font-introducing text-center pt-20">
Event Gallery
</h1>

{/* SEARCH */}

<div className="flex justify-center mt-6 px-4">

<input
type="text"
placeholder="Search events..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="
w-full max-w-2xl
px-6 py-3
rounded-full
bg-white/40 dark:bg-white/10
backdrop-blur-md
border border-gray-300 dark:border-white/20
text-black dark:text-white
placeholder-gray-600 dark:placeholder-gray-300
shadow-sm
focus:outline-none focus:ring-2 focus:ring-blue-500
transition
"
/>

</div>

{/* EVENTS */}

<div className="max-w-6xl mx-auto px-5 sm:px-6 md:px-8 mt-16 space-y-24">

{events.length === 0 ? (

<p className="text-center text-gray-500">
No events found.
</p>

) : filteredEvents.length === 0 ? (

<p className="text-center text-gray-500">
No matching events.
</p>

) : (

filteredEvents.map((event,index)=>(

<div
key={event._id}
ref={(el)=>sectionRefs.current[index]=el}
onClick={()=>navigate(`/gallery/${event._id}`)}
className="cursor-pointer group"
>

<div className="relative overflow-hidden rounded-xl">

<img
src={
  event.coverUrl ||
  "https://via.placeholder.com/800x400?text=No+Cover"
}
className="w-full h-56 sm:h-64 object-cover group-hover:scale-110 transition"
onError={(e)=>{
  e.target.src = "https://via.placeholder.com/800x400?text=No+Cover"
}}
/>

<div className="absolute inset-0 bg-black/30 flex items-end p-4">

<h2 className="text-white text-lg sm:text-xl font-semibold">
{event.name}
</h2>

</div>

</div>

</div>

))

)}

</div>

{/* NAVIGATOR */}

{filteredEvents.length > 0 && (
<div className="hidden md:flex fixed right-5 top-1/2 -translate-y-1/2 flex-col gap-3 z-50">

{filteredEvents.map((event,index)=>(

<div
key={event._id}
onClick={()=>{
sectionRefs.current[index]?.scrollIntoView({behavior:"smooth"})
}}
className={`group relative w-2 h-6 rounded-full cursor-pointer transition
${activeIndex === index ? "bg-blue-600" : "bg-neutral-400"}
`}
>

<span className="absolute right-6 top-1/2 -translate-y-1/2 whitespace-nowrap
bg-black text-white text-xs px-2 py-1 rounded opacity-0
group-hover:opacity-100 transition"
>
{event.name}
</span>

</div>

))}

</div>
)}

</div>

)

}