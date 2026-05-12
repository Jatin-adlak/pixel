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
className="fixed bottom-6 right-6 z-[99999] hover:scale-110 transition"
>

{dark ? (
<Sun size={26} className="text-white"/>
) : (
<Moon size={26} className="text-black"/>
)}

</button>

)

}