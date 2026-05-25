import React from "react"
import { motion } from "framer-motion"
import TeamParticles from "./TeamParticles"

import jatin1 from "../assets/team/jatin1.JPG"
import jatin2 from "../assets/team/jatin2.JPG"
import brajesh1 from "../assets/team/brajesh1.JPG"

const team = [

{
name:"Kanishk Kukreja",
title:"Lead Photographer & Designer",
image:"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512862/Me_CameraPic2_npr7ij.jpg",
hoverImage:"https://res.cloudinary.com/dwk329jcv/image/upload/v1773939795/podcast_pic_xhqbag.png",
bio:`Notice who isn’t in any of the photos? Yep — that’s me.
Leads the club’s photography initiatives while bringing creative ideas to life through impactful designs, ensuring a strong visual identity across events and content.`
},

{
name:"Aniket Ambadkar",
title:"Lead Photographer & Co-Founder",
image:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774449880/DSC08641_stomxz.jpg",
hoverImage:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774449880/DSC08794_mlo3yh.jpg",
bio:`Leads the creative vision of photography initiatives while co-founding and helping build the club’s culture, events, and direction.`
},

{
name:"Madhav Maurya",
title:"Lead Videographer",
image:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774450187/DSC08642_ofvhhe.jpg",
hoverImage:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774450195/DSC08791_lcgyvv.jpg",
bio:`Directs and manages video production, ensuring high-quality visual storytelling through planning, shooting, and creative execution.`
},

{
name:"Jatin Adlak",
title:"Technical Head & Videographer",

image:jatin1,
hoverImage:jatin2,

bio:`Handles technical operations and equipment management while contributing to video production and creative content development.`
},

{
name:"Ansh Jain",
title:"Photographer & Logistics Manager",
image:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774449894/DSC08537_pz1oe8.jpg",
hoverImage:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774449907/DSC08639_e7gc31.jpg",
bio:`Manages photography responsibilities alongside coordinating event logistics and ensuring smooth execution of club activities.`
},

{
name:"Brajesh Patel",
title:"Videographer & Editor",
image:brajesh1,
hoverImage:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774450098/IMG_5196_2_zeglb5.jpg",
bio:`Captures and edits engaging visual content, transforming raw footage into polished and impactful stories.`
},

// {
// name:"Batul Athar",
// title:"Photographer",
// image:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774450065/DSC_0934_2_zi4wtr.jpg",
// hoverImage:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774450098/IMG_5196_2_zeglb5.jpg",
// bio:`Captures memorable moments and creative visuals while contributing to the club’s artistic and event coverage efforts.`
// },

// {
// name:"Shailaja Mishra",
// title:"Social Media Manager",
// image:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774450065/DSC_0934_2_zi4wtr.jpg",
// hoverImage:"https://res.cloudinary.com/dwk329jcv/image/upload/v1774450098/IMG_5196_2_zeglb5.jpg",
// bio:`Oversees the club’s online presence by creating content strategies, managing platforms, and increasing audience engagement.`
// }

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