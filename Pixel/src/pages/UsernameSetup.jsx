import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export default function UsernameSetup(){

const [username,setUsername] = useState("")
const navigate = useNavigate()
const location = useLocation()

/* ✅ GET EMAIL FROM NAVIGATION OR STORAGE */
const storedUser = JSON.parse(localStorage.getItem("pixelUser"))
const email = location.state?.email || storedUser?.email

/* ✅ HANDLE SESSION */
useEffect(() => {
  if (!email) {
    navigate("/")
  }
}, [email, navigate])

/* ✅ STOP RENDER IF NO EMAIL */
if (!email) return null

/* ✅ SAVE USERNAME */

const handleContinue = async () => {

  if (!username.trim()) {
    alert("Enter username")
    return
  }

  try {

    await fetch("http://127.0.0.1:8000/api/users/update-username/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        username: username
      })
    })

    /* ✅ STORE USER SESSION */
    localStorage.setItem("pixelUser", JSON.stringify({
      email: email,
      name: username
    }))

    navigate("/feed")

  } catch (err) {
    console.error(err)
    alert("Failed to update username")
  }
}

return(

<div className="min-h-screen flex items-center justify-center px-6 bg-white dark:bg-black text-black dark:text-white">

<div className="w-full max-w-md space-y-6">

<h1 className="text-3xl text-center">
Choose your username
</h1>

<p className="text-center text-gray-500">
This will be visible on your profile
</p>

<input
type="text"
placeholder="Enter username..."
value={username}
onChange={(e)=>setUsername(e.target.value)}
className="
w-full
px-5 py-3
rounded-full
bg-white/40 dark:bg-white/10
backdrop-blur-md
border border-gray-300 dark:border-white/20
text-black dark:text-white
placeholder-gray-600 dark:placeholder-gray-300
focus:outline-none focus:ring-2 focus:ring-blue-500
"
/>

<button
onClick={handleContinue}
className="w-full py-3 rounded-full bg-blue-600 text-white hover:scale-105 transition"
>
Continue
</button>

</div>

</div>

)

}