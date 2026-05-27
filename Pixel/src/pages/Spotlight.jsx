import { motion } from "framer-motion"
import { useEffect,useState } from "react"

export default function Spotlight(){

const [
events,
setEvents
]=useState([])

const [
loading,
setLoading
]=useState(true)


useEffect(()=>{

loadSpotlights()

},[])


const loadSpotlights=async()=>{

try{

const res=await fetch(
`${import.meta.env.VITE_API_URL}api/spotlight/`
)

const data=await res.json()

setEvents(

Array.isArray(data)

?

data

:

[]

)

}catch(err){

console.log(err)

}
finally{

setLoading(false)

}

}


return(

<div className="
min-h-screen
pt-28
bg-white
dark:bg-black
text-black
dark:text-white
">

<div className="
max-w-7xl
mx-auto
px-8
">

{/* HEADER */}

<div className="
text-center
mb-20
">

<p className="
text-blue-500
tracking-[5px]
uppercase
mb-3
">

Upcoming Events

</p>

<h1 className="
text-5xl
font-headersfont
mb-6
">

Spotlight

</h1>

<p className="
opacity-60
max-w-2xl
mx-auto
">

Stay updated with upcoming college events,
workshops and activities.

</p>

</div>


{loading ? (

<div className="
text-center
text-xl
">

Loading...

</div>

)

:

events.length===0 ? (

<div className="
text-center
text-gray-500
">

No spotlight events available

</div>

)

:

(

<div className="
space-y-16
">

{

events.map((event)=>(

<motion.div

key={event._id}

initial={{
opacity:0,
y:50
}}

whileInView={{
opacity:1,
y:0
}}

transition={{
duration:0.6
}}

viewport={{
once:true
}}

className="
grid
md:grid-cols-[350px_1fr]
gap-8

bg-neutral-100
dark:bg-neutral-950

rounded-3xl
overflow-hidden

border
border-neutral-200
dark:border-neutral-800

items-stretch
"

>

{/* IMAGE */}

<div>

<img

src={`${import.meta.env.VITE_API_URL}${event.poster}`}

alt={event.name}

className="
w-full
h-full
object-cover
"

/>

</div>


{/* DETAILS */}

<div className="
p-10
md:p-14

flex
flex-col
justify-center
">

{/* TITLE */}

<h2 className="
text-4xl
md:text-5xl
font-introducing
leading-tight
tracking-tight
mb-6
">

{event.name}

</h2>


{/* DESCRIPTION */}

<p className="
text-base
md:text-lg

opacity-70
leading-9

mb-10
max-w-3xl
">

{event.description}

</p>


{/* INFO CARDS */}

<div className="
grid
sm:grid-cols-2
gap-5
">

<div className="
bg-white
dark:bg-neutral-900
rounded-2xl
px-5 py-4
">

<p className="
text-xs
uppercase
tracking-widest
opacity-50
mb-2
">

Date

</p>

<p className="
font-medium
text-lg
">

📅 {event.date}

</p>

</div>


<div className="
bg-white
dark:bg-neutral-900
rounded-2xl
px-5 py-4
">

<p className="
text-xs
uppercase
tracking-widest
opacity-50
mb-2
">

Time

</p>

<p className="
font-medium
text-lg
">

⏰ {event.time}

</p>

</div>


<div className="
bg-white
dark:bg-neutral-900
rounded-2xl
px-5 py-4
">

<p className="
text-xs
uppercase
tracking-widest
opacity-50
mb-2
">

Venue

</p>

<p className="
font-medium
text-lg
">

📍 {event.venue}

</p>

</div>


<div className="
bg-white
dark:bg-neutral-900
rounded-2xl
px-5 py-4
">

<p className="
text-xs
uppercase
tracking-widest
opacity-50
mb-2
">

Guests

</p>

<p className="
font-medium
text-lg
leading-8
">

🎤 {event.guests?.join(", ")}

</p>

</div>

</div>


{/* REGISTER BUTTON */}

{

event.form_link && (

<a

href={event.form_link}

target="_blank"

rel="noreferrer"

className="
mt-10
self-start

px-8
py-4

rounded-2xl

bg-blue-600
hover:bg-blue-700

text-white
font-medium

transition-all
duration-300

hover:scale-[1.03]
"

>

Register Now →

</a>

)

}

</div>

</motion.div>

))

}

</div>

)

}

</div>

</div>

)

}