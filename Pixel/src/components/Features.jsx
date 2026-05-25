import { motion } from "framer-motion"

const features=[

{
icon:"📷",
title:"Photography Feed",
desc:"Share photographs and engage through interactions."
},

{
icon:"🎥",
title:"Moments",
desc:"Upload cinematic reels and visual stories."
},

{
icon:"🔍",
title:"AI Face Search",
desc:"Locate your photos instantly using AI."
},

{
icon:"📰",
title:"Newsletter",
desc:"Read updates and creative stories."
},

{
icon:"🖼️",
title:"Gallery",
desc:"Explore captured memories and collections."
},

{
icon:"👥",
title:"Community",
desc:"Follow creators and build connections."
},

{
icon:"❤️",
title:"Interactions",
desc:"Like, comment, share and engage."
},

{
icon:"📅",
title:"Events",
desc:"Stay updated with workshops and activities."
}

]

export default function Features(){

return(

<section className="
relative
py-32
bg-white
dark:bg-black
overflow-hidden
">

{/* Navy glow */}

<div className="
absolute
top-0
left-1/2
-translate-x-1/2

w-[800px]
h-[800px]

rounded-full

bg-blue-900/10

blur-[180px]
"/>

<div className="
relative
z-10

max-w-7xl
mx-auto
px-8
">

<motion.div

initial={{
opacity:0,
y:30
}}

whileInView={{
opacity:1,
y:0
}}

transition={{
duration:0.7
}}

viewport={{
once:true
}}

>

<p className="
text-center
text-blue-500
tracking-[6px]
uppercase
mb-4
text-sm
">

Explore Pixel

</p>

<h2 className="
text-center
text-5xl
font-headersfont
mb-6
">

Everything In One Place

</h2>

<p className="
max-w-2xl
mx-auto
text-center
opacity-60
leading-8
mb-20
">

Photography, community, AI and storytelling
combined into one platform.

</p>

</motion.div>


<div className="
grid
md:grid-cols-2
lg:grid-cols-4
gap-6
">

{

features.map((f,i)=>(

<motion.div

key={i}

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
duration:0.4,
delay:i*0.05
}}

whileHover={{
y:-6
}}

className="

group

rounded-3xl

p-7

bg-neutral-100
dark:bg-neutral-950

border

border-neutral-200
dark:border-neutral-800

transition-all
duration-500

hover:border-blue-500/30

hover:shadow-[0_0_30px_rgba(37,99,235,0.15)]

"

>

<div className="
text-3xl
mb-5
">

{f.icon}

</div>


<h3 className="
font-medium
text-lg
mb-3
">

{f.title}

</h3>


<p className="
text-sm
opacity-60
leading-7
">

{f.desc}

</p>

</motion.div>

))

}

</div>

</div>

</section>

)

}