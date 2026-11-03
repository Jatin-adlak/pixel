import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export default function ThemeToggle(){

const [dark,setDark] = useState(false)

useEffect(()=>{

const saved = localStorage.getItem("theme")

if(saved === "dark"){
document.documentElement.classList.add("dark")
setDark(true)
}

},[])

const toggleTheme = () => {

if(dark){
document.documentElement.classList.remove("dark")
localStorage.setItem("theme","light")
setDark(false)
}else{
document.documentElement.classList.add("dark")
localStorage.setItem("theme","dark")
setDark(true)
}

}

return(

<button
onClick={toggleTheme}
className="fixed z-[99999] hover:scale-110 transition
           right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] p-3 rounded-full
           bg-white/85 dark:bg-neutral-900/85 backdrop-blur shadow-lg border border-neutral-200 dark:border-neutral-700
           md:right-6 md:bottom-6 md:p-0 md:bg-transparent md:dark:bg-transparent md:shadow-none md:border-0 md:backdrop-blur-none"
>

{dark ? (
<Sun size={22} className="text-white"/>
) : (
<Moon size={22} className="text-black"/>
)}

</button>

)

}