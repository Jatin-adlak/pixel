import { useEffect, useState } from "react"
import FloatingLogos from "./FloatingLogos"
import { ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Hero(){

const scrollToFilmroll = () => {
  document.getElementById("filmroll").scrollIntoView({
    behavior: "smooth"
  })
}

const [mouse,setMouse]=useState({x:0,y:0})
const [user,setUser] = useState(null)   // ✅ NEW
const navigate = useNavigate()

/* ✅ LOAD USER */
useEffect(()=>{

const loadUser = () => {
  const stored = localStorage.getItem("pixelUser")
  setUser(stored ? JSON.parse(stored) : null)
}

loadUser()

window.addEventListener("storage", loadUser)
window.addEventListener("userChanged", loadUser)

return ()=>{
  window.removeEventListener("storage", loadUser)
  window.removeEventListener("userChanged", loadUser)
}

},[])

/* SCROLL EFFECT */
useEffect(()=>{

const handleScroll = () => {

const scrollY = window.scrollY
const maxScroll = 400

const progress = Math.min(scrollY / maxScroll, 1)
const visible = 100 - progress * 100

const text = document.querySelector(".intro-text")

if(text){
text.style.webkitMaskSize = `${visible}% 100%`
text.style.maskSize = `${visible}% 100%`
}

}

window.addEventListener("scroll", handleScroll)
return ()=>window.removeEventListener("scroll", handleScroll)

},[])

/* MOUSE EFFECT */
useEffect(()=>{

const move=(e)=>{
setMouse({
x:(e.clientX/window.innerWidth - 0.5),
y:(e.clientY/window.innerHeight - 0.5)
})
}

window.addEventListener("mousemove",move)
return()=>window.removeEventListener("mousemove",move)

},[])

return(

<section className="relative h-screen w-full overflow-hidden">

<FloatingLogos mouse={mouse}/>

{/* CENTER HERO */}
<div className="absolute inset-0 flex items-center justify-center">

<div className="text-center z-10 max-w-xl">

<h1 className=" intro-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl
font-introducing text-center px-6
break-words leading-tight">
Introducing
</h1>

<br/>

<span className="
text-7xl
sm:text-5xl
md:text-6xl
lg:text-7xl
text-blue-600
font-pixel
text-center px-6
drop-shadow-[0_0_25px_rgba(99,102,241,0.6)]
">
Pixel
</span>

<p className="mt-6 text-gray-500 text-lg">
Your <i>moments </i>, Organised <i>Beautifully!</i>
</p>

{/* ✅ BUTTON SECTION */}
<div className="mt-10 flex justify-center gap-4">

{/* ✅ SHOW ONLY IF LOGGED OUT */}
{!user && (
<button
onClick={() => navigate("/login")}
className="px-8 py-4 font-buttonsfont bg-black text-white rounded-full hover:scale-105 transition dark:border-2"
>
Get Started
</button>
)}

<a href="#team" className="hover:scale-105 transition">

<button
className={`
px-8 py-4 font-buttonsfont bg-white text-black rounded-full 
border-2 border-black dark:border-white transition
${user ? "mx-auto" : ""}
`}
>
Learn More
</button>

</a>

<div className="absolute left-1/2 -translate-x-1/2 top-[72%]">

<button
onClick={scrollToFilmroll}
className="float-arrow text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
<ChevronDown size={38} color="#225CDB" />
</button>

</div>

</div>

</div>

</div>

</section>

)

}