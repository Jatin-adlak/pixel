import {
useState
} from "react"

import {

likeMoment,
commentMoment

} from "../api/api"

import {
Heart,
MessageCircle,
Share2,
Bookmark,
Download
}
from "lucide-react"

export default function MomentCard({

moment,
user

}){

const [currentMoment,setCurrentMoment]=
useState(moment)

const [play,setPlay]=
useState(false)

const [showComments,setShowComments]=
useState(false)

const [comment,setComment]=
useState("")


const liked=

currentMoment?.likes?.includes(
user?.email
)


const handleLike=async()=>{

const updated=

await likeMoment(

currentMoment._id,

user.email

)

setCurrentMoment(
updated
)

}


const handleComment=async()=>{

if(
!comment.trim()
)return


const updated=

await commentMoment(

currentMoment._id,

user.email,

comment

)

setCurrentMoment(
updated
)

setComment("")

}


/* SHARE */

const handleShare=async()=>{

const shareLink=

`${window.location.origin}/moment/${currentMoment._id}`


try{

if(
navigator.share
){

await navigator.share({

title:
currentMoment.title,

text:
currentMoment.caption,

url:
shareLink

})

}

else{

await navigator.clipboard.writeText(
shareLink
)

alert(
"Link copied ✅"
)

}

}catch(err){

console.log(err)

}

}


/* DOWNLOAD */

const videoUrl=

`http://127.0.0.1:8000${currentMoment.video_url}`


return(

<div className="
bg-white
dark:bg-neutral-900
rounded-3xl
overflow-hidden
shadow-lg
border
border-neutral-200
dark:border-neutral-800
">

{/* VIDEO */}

{

!play

?

(

<div
onClick={()=>
setPlay(true)
}
className="
relative
cursor-pointer
"
>

<img

src={`http://127.0.0.1:8000${currentMoment.cover_url}`}

onError={(e)=>{

e.target.src=
"/fallback.jpg"

}}

className="
w-full
h-[500px]
object-cover
"
/>


<div className="
absolute
inset-0
flex
items-center
justify-center
bg-black/20
">

<div className="
w-20
h-20
rounded-full
bg-white
flex
items-center
justify-center
text-3xl
shadow-lg
">

▶

</div>

</div>

</div>

)

:

(

<video
controls
preload="none"
className="
w-full
max-h-[700px]
bg-black
"
>

<source
src={videoUrl}
type="video/mp4"
/>

</video>

)

}


<div className="p-5">

<h2 className="
font-bold
text-lg
">

{
currentMoment.title
}

</h2>


<p className="
text-gray-500
mt-2
">

{
currentMoment.caption
}

</p>



{/* ACTIONS */}

<div className="
flex
items-center
justify-between
mt-5
">

<div className="
flex
items-center
gap-6
">

{/* LIKE */}

<button
onClick={handleLike}
className="
flex
items-center
gap-2
hover:scale-110
transition
"
>

<Heart

size={22}

fill={
liked
?
"currentColor"
:
"none"
}

className={
liked
?
"text-white"
:
""
}

/>

<span>

{

currentMoment.likes?.length
||0

}

</span>

</button>



{/* COMMENTS */}

<button
onClick={()=>
setShowComments(
!showComments
)
}
className="
flex
items-center
gap-2
hover:scale-110
transition
"
>

<MessageCircle
size={22}
/>

<span>

{

currentMoment.comments?.length
||0

}

</span>

</button>



{/* SHARE */}

<button
onClick={handleShare}
className="
hover:scale-110
transition
"
>

<Share2
size={22}
/>

</button>


{/* DOWNLOAD */}

<a
href={videoUrl}
download={`${currentMoment.title}.mp4`}
className="
hover:scale-110
transition
"
>

<Download
size={22}
/>

</a>

</div>



{/* SAVE */}

<button
className="
hover:scale-110
transition
"
>

<Bookmark
size={22}
/>

</button>

</div>



{/* COMMENTS */}

{

showComments && (

<div className="
mt-6
">

<div className="
space-y-2
mb-4
max-h-48
overflow-y-auto
">

{

currentMoment.comments?.map(

(c,i)=>(

<div
key={i}
className="
bg-neutral-100
dark:bg-neutral-800
p-3
rounded-xl
"
>

<b>

{
c.email.split("@")[0]
}

</b>

{" "}

{
c.text
}

</div>

)

)

}

</div>


<div className="
flex
gap-2
">

<input

value={comment}

onChange={(e)=>
setComment(
e.target.value
)
}

placeholder="
Add comment...
"

className="
flex-1
border
rounded-xl
p-3
dark:text-black
"
/>


<button
onClick={handleComment}
className="
bg-blue-600
text-white
px-5
rounded-xl
"
>

Send

</button>

</div>

</div>

)

}

</div>

</div>

)

}