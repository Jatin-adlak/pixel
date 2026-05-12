import { useState } from "react"
import { Instagram, Linkedin } from "lucide-react"

export default function Footer(){

const [hover,setHover] = useState(false)

return(

<footer className="
w-full
bg-white dark:bg-black
text-black dark:text-white
pt-40 pb-16 mt-32
relative overflow-hidden
">

{/* 🔥 BIG CENTER LOGO (HALF HIDDEN) */}

<div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2">

<div
onMouseEnter={()=>setHover(true)}
onMouseLeave={()=>setHover(false)}
className="inline-block transition-all duration-[3000ms] ease-in-out"
style={{
transform: hover ? "rotate(360deg)" : "rotate(0deg)",
opacity: hover ? 1 : 0.2
}}
>

<img
src="/photos/ulogopixel.svg"
alt="logo"
className="
block
w-[900px] md:w-[1100px] lg:w-[1300px]
object-contain
"
/>

</div>
</div>

{/* FOOTER CONTENT */}

<div className="
relative z-10
max-w-6xl mx-auto px-6
flex flex-col md:flex-row
justify-between items-center
text-sm
text-gray-500 dark:text-gray-400
gap-4
">

{/* LEFT: TEXT + ICONS */}
<div className="flex flex-col items-center md:items-start gap-2">

<p>© {new Date().getFullYear()} Pixel. All rights reserved.</p>

{/* ✅ SOCIAL ICONS (proper placement) */}
<div className="flex gap-4">

<a
href="https://instagram.com/pixel_sait"
target="_blank"
rel="noopener noreferrer"
className="hover:text-black dark:hover:text-white transition hover:scale-110"
>
<Instagram size={24}/>
</a>

<a
href="https://linkedin.com/in/YOUR_PROFILE"
target="_blank"
rel="noopener noreferrer"
className="hover:text-black dark:hover:text-white transition hover:scale-110"
>
<Linkedin size={24}/>
</a>

</div>

</div>

{/* RIGHT: LINKS */}
<div className="flex gap-6">
<span className="hover:text-black dark:hover:text-white cursor-pointer">Privacy</span>
<span className="hover:text-black dark:hover:text-white cursor-pointer">Terms</span>
<span className="hover:text-black dark:hover:text-white cursor-pointer">Contact</span>
</div>

</div>

</footer>

)

}