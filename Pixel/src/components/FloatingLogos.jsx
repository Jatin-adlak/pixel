import { motion } from "framer-motion"

import {
Camera,
Aperture,
Focus,
Image,
Film,
ScanLine,
GalleryHorizontal
} from "lucide-react"

const icons = [

{Icon:Camera, x:10, y:20, color:"text-red-500"},
{Icon:Aperture, x:80, y:30, color:"text-purple-500"},
{Icon:Focus, x:20, y:70, color:"text-blue-500"},
{Icon:Image, x:85, y:75, color:"text-green-500"},
{Icon:Film, x:60, y:15, color:"text-yellow-500"},
{Icon:ScanLine, x:35, y:85, color:"text-pink-500"},
{Icon:GalleryHorizontal, x:5, y:50, color:"text-orange-500"}

]

export default function FloatingIcons({mouse}){

return icons.map((item,i)=>{

const Icon = item.Icon

return(

<motion.div
key={i}

className={`absolute ${item.color} dark:drop-shadow-[0_0_12px_currentColor]`}

style={{
left:`${item.x}%`,
top:`${item.y}%`,
translateX:mouse.x*69,
translateY:mouse.y*69
}}

animate={{
y:[0,-56,0],
x:[0,65,0]
}}

transition={{
duration:6+i,
repeat:Infinity
}}

whileHover={{
scale:1.25,
rotate:10
}}

>

<Icon size={48} strokeWidth={1.7}/>

</motion.div>

)

})

}