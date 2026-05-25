import { useEffect,useState } from "react"

import {
getMoments
} from "../api/api"

import MomentCard from "../components/MomentCard"

export default function Moments(){

const [moments,setMoments]=useState([])
const [loading,setLoading]=useState(true)

const user = JSON.parse(
localStorage.getItem(
"pixelUser"
)
) || {}

useEffect(()=>{

const load=async()=>{

try{

const data = await getMoments()

console.log(
"MOMENTS API:",
data
)


if(
Array.isArray(data)
){

const validMoments=

data.filter(

item=>

item &&
typeof item==="object"

)

setMoments(
validMoments
)

}else{

setMoments([])

}

}catch(err){

console.log(
"MOMENTS LOAD ERROR:",
err
)

setMoments([])

}

setLoading(false)

}

load()

},[])

return(

<div className="
pt-28
min-h-screen
bg-white
dark:bg-black
text-black
dark:text-white
">

<div className="
max-w-2xl
mx-auto
px-4
space-y-8
">

<h1 className="
text-4xl
font-bold
text-center
mb-10
">

Moments

</h1>


{loading ? (

<p className="
text-center
">
Loading...
</p>

)

:

moments.length===0

?

(

<p className="
text-center
text-gray-500
">

No moments available

</p>

)

:

(

moments.map((moment,index)=>(

<MomentCard

key={
moment?._id ||
index
}

moment={
moment || {}
}

user={
user || {}
}

/>

))

)

}

</div>

</div>

)

}