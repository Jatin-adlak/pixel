import { useEffect,useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const features=[

{
name:"Photography Feed",
route:"/feed",
description:"Share photographs and engage with the community through creative visual stories."
},

{
name:"Moments",
route:"/moments",
description:"Upload cinematic reels and create immersive visual experiences."
},

{
name:"AI Face Search",
route:"/face-search",
description:"Locate your photographs instantly using AI powered recognition."
},

{
name:"Newsletter",
route:"/newsletter",
description:"Read updates, announcements and creative stories from PIXEL."
},

{
name:"Spotlight",
route:"/spotlight",
description:"Discover upcoming workshops, events and featured activities."
},

{
name:"Gallery",
route:"/gallery",
description:"Browse memorable captures and curated collections."
},

{
name:"Community",
route:"/feed",
description:"Connect with creators and build meaningful interactions."
},

{
name:"Interactions",
route:"/feed",
description:"Like, comment and share content with others."
},

{
name:"Profiles",
route:"/profile",
description:"Build your creative identity and personal presence."
}

]

export default function Features(){

const [
selected,
setSelected
]=useState(0)

const [
paused,
setPaused
]=useState(false)


useEffect(()=>{

if(paused)return

const interval=setInterval(()=>{

setSelected(

prev=>

(prev+1)

%

features.length

)

},2500)

return()=>clearInterval(interval)

},[paused])


const radius=280
const centerX=400
const centerY=320


return(

<section className="
py-32
bg-white
dark:bg-black
text-black
dark:text-white
overflow-hidden
">

<div className="
max-w-7xl
mx-auto
px-8
">

{/* HEADER */}

<div className="
text-center
mb-24
">

<p className="
text-blue-500
tracking-[6px]
uppercase
text-sm
mb-4
">

Explore Pixel

</p>

<h2 className="
text-5xl
font-headersfont
mb-6
">

Everything In One Place

</h2>

<p className="
opacity-60
max-w-2xl
mx-auto
leading-8
">

Photography, AI and storytelling
combined into one ecosystem.

</p>

</div>


<div className="
relative
h-[700px]
w-full
">

{/* Navy background glow */}

<motion.div

animate={{

x:

selected*50

}}

transition={{

duration:.8

}}

className="
absolute

left-1/2
top-[40%]

-translate-x-1/2

w-[350px]
h-[350px]

rounded-full

bg-blue-900/10

blur-[120px]
"
/>


{/* LEFT PANEL */}

<motion.div

key={`left-${selected}`}

initial={{
opacity:0,
x:-20
}}

animate={{
opacity:1,
x:0
}}

className="
absolute
left-0
top-[35%]

max-w-[280px]
"

>

<p className="
text-blue-500
uppercase
tracking-[5px]
text-xs
mb-4
">

Current Feature

</p>


<h3 className="
text-4xl
font-medium
mb-6
leading-tight
">

{
features[selected].name
}

</h3>


<p className="
opacity-60
leading-8
">

{
features[selected].description
}

</p>

</motion.div>


{/* RIGHT PANEL */}

<motion.div

key={`right-${selected}`}

initial={{
opacity:0,
x:20
}}

animate={{
opacity:1,
x:0
}}

className="
absolute
right-0
top-[35%]

w-[260px]

bg-neutral-100
dark:bg-neutral-950

rounded-[30px]

border
border-neutral-200
dark:border-neutral-800

p-8
"

>

<p className="
text-xs
uppercase
tracking-[5px]
opacity-50
mb-4
">

Navigation

</p>

<div className="
w-12
h-[2px]
bg-blue-500
mb-5
"/>

<p className="
opacity-60
leading-8
">

Navigate directly into the selected
PIXEL feature experience.

</p>

</motion.div>



{/* ARC */}

<div className="
absolute
left-1/2
-translate-x-1/2
">

<svg

width="800"
height="600"

>

<path

d="
M120,320
A280,280
0
0
1
680,320
"

fill="none"

stroke="rgba(37,99,235,.2)"

strokeWidth="2"

/>


{

features.map(

(feature,index)=>{

const angle=

Math.PI+

(

index/

(features.length-1)

)

*

Math.PI


const x=

centerX+

radius*

Math.cos(angle)


const y=

centerY+

radius*

Math.sin(angle)


return(

<g

key={index}

onClick={()=>{

setSelected(index)
setPaused(true)

}}

className="
cursor-pointer
"

>

<motion.circle

cx={x}
cy={y}

r={

selected===index

?

16

:

9

}

fill="#2563eb"

/>


<motion.circle

cx={x}
cy={y}

r={

selected===index

?

30

:

16

}

fill="rgba(37,99,235,.12)"

animate={{

scale:

selected===index

?

[1,1.2,1]

:

1

}}

transition={{

repeat:Infinity,
duration:2

}}

/>

</g>

)

}

)

}

</svg>

</div>



{/* BOTTOM BUTTON */}

<div className="
absolute
bottom-0

left-1/2
-translate-x-1/2

text-center
">

<Link

to={
features[selected].route
}

className="
inline-flex

px-8
py-4

rounded-full

bg-blue-600

hover:bg-blue-700

text-white

transition-all
"

>

Explore Now →

</Link>


{

paused && (

<button

onClick={()=>
setPaused(false)
}

className="
block
mx-auto
mt-5

opacity-50
text-sm
"

>

Resume auto rotation

</button>

)

}

</div>

</div>

</div>

</section>

)

}