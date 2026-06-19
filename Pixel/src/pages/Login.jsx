import { useNavigate } from "react-router-dom"
import TeamParticles from "../components/TeamParticles"
import { GoogleLogin } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import { loginUser } from "../api/api"

export default function Login(){

const navigate = useNavigate()

const allowedDomains = ["sait.ac.in","saip.ac.in"]

const adminEmails = [
  "kanishkk52@gmail.com",
  "altatrescue@gmail.com",
  "yashadlakpc@gmail.com",
  "biku.patel45@gmail.com"
]

const handleLoginSuccess = async (credentialResponse)=>{

try {

const decoded = jwtDecode(
credentialResponse.credential
)

const email = decoded.email
const domain = email.split("@")[1]

let ring = ""

/* ADMIN */

if(adminEmails.includes(email)){

  ring = "rainbow"

/* DOMAIN USERS */

}else if(allowedDomains.includes(domain)){

  if(domain === "sait.ac.in"){
    ring = "#b55f22"
  }

  if(domain === "saip.ac.in"){
    ring = "blue-600"
  }

}else{

  alert("Only approved emails can login")
  return

}

/* 🔥 IMPORTANT: DO NOT FORCE EMPTY NAME */

const isAdmin = adminEmails.includes(email)

const userData = {

  email: decoded.email,
  picture: decoded.picture,

  domain,
  ring,

  isAdmin

}

/* 🔥 LOGIN USER */

const savedUser = await loginUser(userData)

/* 🔥 FETCH COMPLETE USER */

const freshRes = await fetch(
`http://127.0.0.1:8000/api/users/public/${savedUser.email}/`
)

const freshUser = await freshRes.json()

/* 🔥 FULL USER OBJECT */

const updatedUser = {

  email: freshUser.email,
  name: freshUser.name || "",

  picture: freshUser.picture,

  ring: freshUser.ring,
  domain: freshUser.domain,

  isAdmin: adminEmails.includes(
    freshUser.email
  ),

  saved_posts:
    freshUser.saved_posts || [],

  saved_images:
    freshUser.saved_images || [],

  followers:
    freshUser.followers || [],

  following:
    freshUser.following || [],

  follow_requests:
    freshUser.follow_requests || []

}

/* 🔥 SAVE USER */

localStorage.setItem(
  "pixelUser",
  JSON.stringify(updatedUser)
)

window.dispatchEvent(
  new Event("storage")
)

window.dispatchEvent(
  new Event("userChanged")
)

/* 🔍 DEBUG */

console.log("LOGIN USER:", updatedUser)

/* 🔥 SAFE CHECK */

const isNewUser =
  !freshUser.name ||
  freshUser.name === "" ||
  freshUser.name === null

if (isNewUser) {

  navigate("/username", {
    state: { email: freshUser.email }
  })

} else {

  navigate("/feed", {
    state: { email: freshUser.email }
  })

}

} catch (err) {

console.error("Login error:", err)

alert("Login failed. Try again.")

}

}

return(

<section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-black">

<TeamParticles/>

<div className="
relative z-10
backdrop-blur-2xl
bg-white/20 dark:bg-black/20
border border-white/30 dark:border-white/10
rounded-3xl
px-12 py-14
shadow-xl
flex flex-col items-center text-center
">

<h1 className="text-5xl font-pixel mb-10 text-blue-600">
Pixel
</h1>

<p className="text-black dark:text-gray-400 mb-8">
Your <i>moments</i>, organised <i>beautifully!</i>
</p>

<div className="flex flex-col gap-4 w-[260px]">

<div className="flex justify-center">

<GoogleLogin
onSuccess={handleLoginSuccess}
onError={()=>console.log("Login Failed")}
/>

</div>

<button
onClick={()=>navigate("/feed")}
className="
text-gray-600 dark:text-gray-400
w-full py-3 rounded-xl
hover:bg-white/10 transition
"
>
Browse as Guest
</button>

</div>

</div>

</section>

)

}