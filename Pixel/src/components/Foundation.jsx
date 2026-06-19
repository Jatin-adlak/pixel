import React from "react"
import { motion } from "framer-motion"
import TeamParticles from "./TeamParticles"

import collegeImage from "../assets/foundation/sait.jpg"
import directorImage from "../assets/foundation/director.jpg"

// id="foundation"
export default function Foundation(){

return(

<section
id="foundation"
className="
relative
py-32
bg-white
dark:bg-black
overflow-hidden
"
>

<TeamParticles />
{/* Background Glow

<div
className="
absolute
top-1/2
left-1/2
-translate-x-1/2
-translate-y-1/2

w-[900px]
h-[900px]

rounded-full
bg-blue-500/10

blur-[180px]
"
/> */}

<div className="relative z-10">

{/* HEADING */}

<motion.div

initial={{opacity:0,y:30}}
whileInView={{opacity:1,y:0}}
transition={{duration:.8}}
viewport={{once:true}}

className="text-center mb-24 px-8"
>

<p
className="
uppercase
tracking-[5px]
text-blue-500
text-sm
mb-4
"
>

Built On Vision

</p>

<h2
className="
text-4xl
md:text-6xl
font-headersfont
mb-6
"
>

The Foundation Behind PIXEL

</h2>

<p
className="
max-w-3xl
mx-auto
opacity-70
leading-8
"
>

PIXEL was built upon a vision of creativity,
leadership and preserving every memorable
moment that shapes campus life.

</p>

</motion.div>


{/* COLLEGE SECTION */}

<motion.div
initial={{ opacity: 0, y: 40 }}
whileInView={{ opacity: 1, y: 0 }}
transition={{ duration: .8 }}
viewport={{ once: true }}
className="
max-w-6xl
mx-auto
px-8
mb-32
"
>

<div
className="
group
relative
overflow-hidden
rounded-[40px]
shadow-2xl
cursor-pointer
"
>

{/* IMAGE */}

<img
src={collegeImage}
alt="SAIT Campus"
className="
w-full
h-[550px]
object-cover
transition-transform
duration-700
group-hover:scale-105
"
/>

{/* DARK OVERLAY */}

<div
className="
absolute
inset-0
bg-gradient-to-t
from-black
via-black/30
to-transparent
"
/>

{/* COLLAPSED CONTENT */}

<div
className="
absolute
bottom-0
left-0
right-0

p-10

transition-all
duration-700

group-hover:translate-y-[-180px]
"
>

<h3
className="
text-3xl
md:text-6xl
font-introducing
text-white
mb-4
"
>

Sri Aurobindo Institute
of Technology

</h3>

<p
className="
text-white/90
text-lg
"
>

An institution fostering innovation,
leadership and student-driven initiatives.

</p>

</div>

{/* EXPANDED CONTENT */}

<div
className="
absolute
left-0
right-0
bottom-0

px-10
pb-10

text-white

opacity-0
translate-y-12

group-hover:opacity-100
group-hover:translate-y-0

transition-all
duration-700
delay-150
"
>

<div
className="
w-16
h-[3px]
bg-blue-500
mb-6
"
/>

<p
className="
max-w-4xl
leading-9
text-lg
text-white/90
"
>

Sri Aurobindo Institute of Technology has consistently
encouraged innovation, creativity and student leadership.
By providing opportunities beyond academics, the institute
empowers students to build communities, lead initiatives
and contribute meaningfully to campus life.

PIXEL emerged from this culture of creativity and
collaboration, becoming a platform where moments,
achievements and stories are preserved through the
lens of passionate student creators.

</p>

</div>

</div>

</motion.div>


{/* DIRECTOR */}

<motion.div

initial={{opacity:0,y:40}}
whileInView={{opacity:1,y:0}}
transition={{duration:.8}}
viewport={{once:true}}

className="
max-w-6xl
mx-auto
px-8

grid
md:grid-cols-2
gap-16
items-center
mb-32
"
>

{/* IMAGE */}

<div className="flex justify-center">

<img
src={directorImage}
alt="Director"

className="
w-[256px]
h-[430px]

object-cover

rounded-full
shadow-2xl
"
/>

</div>


{/* TEXT */}

<div>

<p
className="
uppercase
tracking-[4px]
text-blue-500
text-sm
mb-4
"
>

Leadership

</p>

<h3
className="
text-4xl
font-introducing
mb-3
"
>

Dr. Aaquil Bunglowala

</h3>

<p
className="
opacity-60
mb-8
"
>

Director, SAIT

</p>

<p
className="
leading-9
opacity-80
mb-8
"
>

Under the guidance and encouragement of
Dr. Aaquil Bunglowala, PIXEL was established
in November 2025 as a student-led initiative
dedicated to documenting the institution's
journey, achievements and memorable moments.

His support for creativity, innovation and
student leadership played a significant role
in enabling the club to grow into a platform
for visual storytelling and community building.

</p>


<div
className="
border-l-4
border-blue-500
pl-6
italic
opacity-80
"
>

"Creativity thrives when students are empowered
to preserve, share and celebrate their stories."

</div>

</div>

</motion.div>


{/* TIMELINE */}

<div
className="
max-w-6xl
mx-auto
px-8

grid
md:grid-cols-4
gap-10
"
>

{[
{
year:"Nov 2025",
title:"PIXEL Founded"
},
{
year:"20+",
title:"Major Events Covered"
},
{
year:"TEDxSAIT",
title:"Flagship Event Coverage"
},
{
year:"Growing",
title:"Visual Community"
}
].map((item,index)=>(

<div
key={index}

className="
text-center
"
>

<div
className="
w-4
h-4
rounded-full
bg-blue-500
mx-auto
mb-5
"
/>

<h4
className="
font-semibold
text-xl
mb-2
"
>

{item.year}

</h4>

<p
className="
opacity-60
"
>

{item.title}

</p>

</div>

))

}

</div>

</div>

</section>

)

}