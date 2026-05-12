import React from "react"
import { motion } from "framer-motion"
import TeamParticles from "./TeamParticles"

const team = [

{
name:"Kanishk Kukreja",
title:"Lead Photographer & Designer",
image:"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512862/Me_CameraPic2_npr7ij.jpg",
hoverImage:"https://res.cloudinary.com/dwk329jcv/image/upload/v1773939795/podcast_pic_xhqbag.png",
bio:`Notice who isn’t in any of the photos? Yep — that’s me.
While everyone else is busy posing, I’m the one behind the lens capturing the moment before it disappears.
As Pixel’s lead photographer and designer, I turn everyday moments into visuals worth remembering.`
},

{
name:"Aniket Ambadkar",
title:"<Title>",
image:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774449880/DSC08641_stomxz.jpg",
hoverImage:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774449880/DSC08794_mlo3yh.jpg",
bio:`bio`
},

{
name:"Madhav Maurya",
title:"<Title>",
image:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774450187/DSC08642_ofvhhe.jpg",
hoverImage:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774450195/DSC08791_lcgyvv.jpg",
bio:`bio`
},

{
name:"Jatin Adlak",
title:"<Title>",
image:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774449941/DSC08521_2_bdpmwj.jpg",
hoverImage:"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512341/photo3_qtudet.jpg",
bio:`bio`
},

{
name:"Ansh Jain",
title:"<Title>",
image:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774449894/DSC08537_pz1oe8.jpg",
hoverImage:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774449907/DSC08639_e7gc31.jpg",
bio:`bio`
},

{
name:"Brajesh Patel",
title:"<Title>",
image:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774450065/DSC_0934_2_zi4wtr.jpg",
hoverImage:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774450098/IMG_5196_2_zeglb5.jpg",
bio:`bio`
}

]

export default function Team(){

return(

<section id="team" className="relative py-32 bg-white dark:bg-black overflow-hidden">

{/* Particle Background */}
<TeamParticles/>

{/* Content Layer */}
<div className="relative z-10">

<h2 className="text-4xl font-headersfont text-center mb-24">
Meet The Team
</h2>

<div className="max-w-6xl mx-auto px-8 space-y-32">

{team.map((member,i)=>(

<motion.div
key={i}
initial={{opacity:0, x: i%2===0 ? -120 : 120}}
whileInView={{opacity:1, x:0}}
transition={{duration:0.8}}
viewport={{once:true}}

className={`flex flex-col md:flex-row items-center gap-14 ${
i % 2 === 1 ? "md:flex-row-reverse" : ""
}`}
>

{/* IMAGE */}

<div className="relative group w-64 h-[420px] overflow-hidden rounded-[999px] shadow-2xl">

<img
src={member.image}
alt={member.name}
className="absolute w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
/>

<img
src={member.hoverImage}
alt={member.name}
className="absolute w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
/>

</div>


{/* TEXT */}

<div className="max-w-lg">

<h3 className="text-2xl font-introducing mb-2">
{member.name}
</h3>

<p className="text-sm opacity-70 mb-4">
{member.title}
</p>

<p className="text-lg font-buttonsfont opacity-90">
{member.bio}
</p>

</div>

</motion.div>

))}

</div>

</div>

</section>

)

}