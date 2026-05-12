import { useEffect, useState } from "react"

export default function CustomCursor(){

const [pos,setPos] = useState({x:0,y:0})
const [click,setClick] = useState(false)
const [hover,setHover] = useState(false)
const [enabled,setEnabled] = useState(false)

useEffect(()=>{

/* ✅ BULLETPROOF DEVICE DETECTION */
const isTouch =
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0

const hasHover = window.matchMedia("(hover: hover)").matches

const enableCursor = hasHover && !isTouch

setEnabled(enableCursor)

/* ✅ CURSOR VISIBILITY */
document.body.style.cursor = enableCursor ? "none" : "auto"

/* ❌ STOP EVERYTHING IF NOT DESKTOP */
if(!enableCursor) return

/* ✅ EVENTS */
const move = (e)=>{
setPos({x:e.clientX,y:e.clientY})
}

const down = ()=>setClick(true)
const up = ()=>setClick(false)

const hoverOn = (e)=>{
if(e.target.closest("button, a, img")){
setHover(true)
}else{
setHover(false)
}
}

window.addEventListener("mousemove",move)
window.addEventListener("mousedown",down)
window.addEventListener("mouseup",up)
window.addEventListener("mouseover",hoverOn)

return ()=>{
document.body.style.cursor = "auto"
window.removeEventListener("mousemove",move)
window.removeEventListener("mousedown",down)
window.removeEventListener("mouseup",up)
window.removeEventListener("mouseover",hoverOn)
}

},[])

/* ❌ DO NOT RENDER ON MOBILE */
if(!enabled) return null

return(

<div
id="custom-cursor"
style={{
transform:`translate3d(${pos.x}px, ${pos.y}px, 0)`
}}
className="fixed top-0 left-0 pointer-events-none z-[9999]"
>

{/* APERTURE ICON */}
<div
className={`
relative flex items-center justify-center
transition-all duration-150
${click ? "scale-75 rotate-90" : "scale-100"}
${hover ? "text-blue-500" : "text-black dark:text-white"}
`}
>

{/* CLEAN APERTURE ICON */}
<svg
width="28"
height="28"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="1.8"
strokeLinecap="round"
strokeLinejoin="round"
className={`transition-transform duration-200 ${click ? "rotate-45 scale-75" : ""}`}
>
<circle cx="12" cy="12" r="10"/>
<path d="M14.31 8L20.05 18"/>
<path d="M9.69 8h11.48"/>
<path d="M7.38 12L13.12 2"/>
<path d="M9.69 16L3.95 6"/>
<path d="M14.31 16H2.83"/>
<path d="M16.62 12L10.88 22"/>
</svg>

{/* CLICK FLASH */}
{click && (
<div className="absolute w-6 h-6 bg-blue-400/30 rounded-full animate-ping"/>
)}

</div>

</div>

)
}