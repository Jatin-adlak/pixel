import { motion } from "framer-motion"

export default function About(){

return(

<section className="
relative
py-36
bg-white
dark:bg-black
overflow-hidden
text-black
dark:text-white
">

{/* Navy Glow */}

<div className="
absolute
top-1/2
left-1/2
-translate-x-1/2
-translate-y-1/2

w-[700px]
h-[700px]

bg-blue-900/10

rounded-full
blur-[180px]
"/>


<div className="
relative
z-10
max-w-7xl
mx-auto
px-8
">

{/* Header */}

<motion.div

initial={{
opacity:0,
y:30
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
duration:.7
}}

className="
text-center
mb-24
"

>

<p className="
uppercase
tracking-[6px]
text-blue-500
text-sm
mb-4
">

About PIXEL

</p>

<h2 className="
text-4xl
md:text-6xl
font-headersfont
mb-6
">

Capturing Stories,
Creating Memories

</h2>

<p className="
max-w-3xl
mx-auto
opacity-60
leading-8
">

PIXEL is the official photography and visual storytelling
club of Sri Aurobindo Institute of Technology.

</p>

</motion.div>



<div className="
grid
lg:grid-cols-2
gap-20
items-center
">

{/* LEFT SIDE */}

<div className="
space-y-10
">

<div className="
border-l-2
border-blue-500/40
pl-8
">

<h3 className="
text-2xl
font-medium
mb-4
">

Founded in 2025

</h3>

<p className="
opacity-60
leading-8
">

Established in November 2025 under the guidance
of Dr. Aaquil Bunglowala with a vision to preserve
and document every important moment inside SAIT.

</p>

</div>


<div className="
border-l-2
border-blue-500/40
pl-8
">

<h3 className="
text-2xl
font-medium
mb-4
">

Student Driven

</h3>

<p className="
opacity-60
leading-8
">

The club is completely operated by students,
covering photography, videography and visual
storytelling across campus.

</p>

</div>


<div className="
border-l-2
border-blue-500/40
pl-8
">

<h3 className="
text-2xl
font-medium
mb-4
">

Major Coverage

</h3>

<p className="
opacity-60
leading-8
">

Covered TEDxSAIT 2026, Cognoise 2K26,
seminars, workshops, cultural events and
many other college activities.

</p>

</div>

</div>


{/* RIGHT SIDE */}

<div>

<h3 className="
text-3xl
font-medium
mb-8
leading-tight
">

The vision behind PIXEL

</h3>


<p className="
leading-9
opacity-70
mb-8
">

PIXEL was created to capture every story,
every event and every memorable moment
inside Sri Aurobindo Institute of Technology.

</p>


<p className="
leading-9
opacity-70
mb-12
">

From academic conferences to cultural
celebrations, the club ensures every moment
becomes a memory through creative visual
storytelling and teamwork.

</p>


{/* Stats */}

<div className="
grid
grid-cols-3
gap-5
">

<div className="
rounded-3xl
border
border-neutral-200
dark:border-neutral-800

bg-neutral-50
dark:bg-neutral-950

p-6
text-center
">

<h2 className="
text-3xl
font-bold
text-blue-500
">

20+

</h2>

<p className="
opacity-60
text-sm
mt-2
">

Events

</p>

</div>


<div className="
rounded-3xl
border
border-neutral-200
dark:border-neutral-800

bg-neutral-50
dark:bg-neutral-950

p-6
text-center
">

<h2 className="
text-3xl
font-bold
text-blue-500
">

2025

</h2>

<p className="
opacity-60
text-sm
mt-2
">

Started

</p>

</div>


<div className="
rounded-3xl
border
border-neutral-200
dark:border-neutral-800

bg-neutral-50
dark:bg-neutral-950

p-6
text-center
">

<h2 className="
text-3xl
font-bold
text-blue-500
">

100%

</h2>

<p className="
opacity-60
text-sm
mt-2
">

Students

</p>

</div>

</div>

</div>

</div>

</div>

</section>

)

}