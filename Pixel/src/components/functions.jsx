import { motion } from "framer-motion"

const features=[

{
icon:"📷",
title:"Photography Feed",
desc:"Upload and share creative photographs with likes, comments and interactions."
},

{
icon:"🖼️",
title:"Gallery",
desc:"Explore curated collections and visual stories captured by the community."
},

{
icon:"🎥",
title:"Moments",
desc:"Watch and upload short cinematic moments with reels-like interactions."
},

{
icon:"🔍",
title:"Face Search",
desc:"Find your photos instantly using AI-powered face recognition."
},

{
icon:"📰",
title:"Newsletter",
desc:"Read club updates, event highlights and creative stories."
},

{
icon:"👥",
title:"Community",
desc:"Follow photographers, build connections and interact with creators."
},

{
icon:"❤️",
title:"Likes & Comments",
desc:"Engage with posts and moments through real-time interactions."
},

{
icon:"📅",
title:"Events",
desc:"Stay updated with photography events, workshops and competitions."
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

<div className="
max-w-7xl
mx-auto
px-8
">

<motion.h2

initial={{
opacity:0,
y:40
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
duration:0.8
}}

className="
text-center
text-4xl
font-headersfont
mb-20
"

>

What Pixel Offers

</motion.h2>


<div className="
grid
md:grid-cols-2
lg:grid-cols-4
gap-8
">

{

features.map((f,i)=>(

<motion.div

key={i}

initial={{
opacity:0,
y:50
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
duration:0.5,
delay:i*0.08
}}

className="

group

bg-neutral-100
dark:bg-neutral-900

border
border-transparent

hover:border-purple-500/40

rounded-3xl

p-8

transition-all
duration-500

hover:-translate-y-3

hover:shadow-[0_0_35px_rgba(168,85,247,0.25)]

"

>

<div className="
text-4xl
mb-6
">

{f.icon}

</div>


<h3 className="
font-introducing
text-xl
mb-4
">

{f.title}

</h3>


<p className="
text-sm
opacity-70
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