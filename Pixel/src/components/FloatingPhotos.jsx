import { motion } from "framer-motion"

const photos = [

{src:"C:/pixel/photos/photo1.jpg", x:10, y:20, rotate:-10},
{src:"/photos/photo2.jpg", x:80, y:30, rotate:8},
{src:"/photos/photo3.jpg", x:20, y:70, rotate:-6},
{src:"/photos/photo4.jpg", x:85, y:75, rotate:12},
{src:"/photos/photo5.jpg", x:60, y:15, rotate:-8},
// {src:"/photos/photo6.jpg", x:5, y:50, rotate:6}

]

export default function FloatingPhotos({mouse}){

return photos.map((photo,i)=>(

<motion.div
key={i}
className="absolute w-40 bg-white dark:bg-neutral-900 p-2 rounded-md shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]"

style={{
left:`${photo.x}%`,
top:`${photo.y}%`,
rotate:photo.rotate,
x:mouse.x * 50,
y:mouse.y * 50
}}

animate={{
y:[0,-30,0],
x:[0,20,0]
}}

transition={{
duration:8 + i,
repeat:Infinity,
ease:"easeInOut"
}}

whileHover={{
scale:1.08
}}

>

<img
src={photo.src}
className="w-full h-32 object-cover rounded-sm"
/>

</motion.div>

))

}