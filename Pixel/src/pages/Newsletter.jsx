import { useEffect, useState } from "react"
import { getNewsletters } from "../api/api"

export default function Newsletter(){

const [newsletters, setNewsletters] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  getNewsletters()
    .then((data) => {
      console.log("API DATA:", data) // 🔥 DEBUG

      if (Array.isArray(data)) {
        setNewsletters(data)
      } else {
        setNewsletters([])
      }
    })
    .catch((err) => {
      console.error("API ERROR:", err)
      setNewsletters([])
    })
    .finally(() => setLoading(false))
}, [])

return(

<div className="pt-28 min-h-screen bg-white dark:bg-black text-black dark:text-white">
    
<div className="max-w-6xl mx-auto px-8">

<h1 className="text-4xl font-introducing mb-16 text-center">
Newsletters
</h1>

<div className="grid md:grid-cols-2 gap-10">

{loading ? (

<p className="text-center col-span-full">Loading...</p>

) : newsletters.length === 0 ? (

<p className="text-center text-gray-500 col-span-full">
No newsletters available.
</p>

) : (

newsletters.map((n, i)=>(

<div
key={n?._id || i}
className="bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden shadow-lg hover:scale-[1.03] transition duration-300"
>

<img
src={n?.cover ? `${window.location.origin}${n.cover}` : "/fallback.jpg"}
className="w-full h-64 object-cover"
/>

<div className="p-6">

<h2 className="text-xl font-headersfont mb-4">
{n?.title || "Untitled"}
</h2>

<a
href={n?.pdf ? `${window.location.origin}${n.pdf}` : "#"}
target="_blank"
className="inline-block px-5 py-2 rounded-3xl font-buttonsfont bg-black text-white dark:bg-white dark:text-black"
>
Open Newsletter
</a>

</div>

</div>

))

)}

</div>

</div>

</div>

)

}