import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"

export default function FaceSetup(){

const navigate = useNavigate()
const videoRef = useRef(null)
const canvasRef = useRef(null)
const streamRef = useRef(null)

const [image,setImage] = useState(null)
const [cameraOn,setCameraOn] = useState(false)
const [isReady,setIsReady] = useState(false)
const [error,setError] = useState("")

/* START CAMERA */

const startCamera = async () => {
try {

const stream = await navigator.mediaDevices.getUserMedia({
video: { facingMode: "user" }
})

streamRef.current = stream

setCameraOn(true)

/* wait for DOM to render video */
setTimeout(() => {

const video = videoRef.current
if(!video) return

video.srcObject = stream

video.onloadedmetadata = () => {
video.play()

setTimeout(()=>{
setIsReady(true)
},500)
}

},100)

} catch (err) {
console.error(err)
setError("Camera access failed")
}
}

/* CAPTURE */

const capture = () => {

const video = videoRef.current
const canvas = canvasRef.current

if(!video || !canvas) return

const width = video.videoWidth
const height = video.videoHeight

if(!width || !height){
alert("Camera still loading...")
return
}

canvas.width = width
canvas.height = height

const ctx = canvas.getContext("2d")
ctx.drawImage(video,0,0,width,height)

const data = canvas.toDataURL("image/png")
setImage(data)

/* stop camera safely */
if(streamRef.current){
streamRef.current.getTracks().forEach(track=>track.stop())
}

setCameraOn(false)
setIsReady(false)
}

/* SAVE */

const handleSave = () => {
if(!image) return

localStorage.setItem("faceData", image)
navigate("/feed")
}

/* SKIP */

const handleSkip = () => {
navigate("/feed")
}

return(

<div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white dark:bg-black text-black dark:text-white">

<h1 className="text-3xl mb-4 text-center font-headersfont">
Set Up Face Recognition
</h1>

<p className="text-gray-500 text-center max-w-md mb-8 font-buttonsfont">
Capture your face so we can find your photos later. You can skip this.
</p>

<div className="w-full max-w-md">

{error && (
<p className="text-red-500 text-sm mb-3">{error}</p>
)}

{!image ? (

<div className="space-y-4">

{/* VIDEO */}

{cameraOn ? (
<video
ref={videoRef}
autoPlay
playsInline
muted
className="rounded-xl w-full h-64 object-cover bg-black"
/>
) : (
<div className="h-64 flex items-center justify-center border rounded-xl border-neutral-300 dark:border-neutral-700">
<span className="opacity-60 font-buttonsfont">Camera Preview</span>
</div>
)}

<canvas ref={canvasRef} className="hidden"/>

{/* BUTTONS */}

<div className="flex gap-3">

{!cameraOn ? (
<button
onClick={startCamera}
className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-buttonsfont"
>
Start Camera
</button>
) : (
<button
onClick={capture}
disabled={!isReady}
className={`flex-1 py-2 rounded-xl text-white ${
isReady ? "bg-green-600" : "bg-gray-400"
}`}
>
{isReady ? "Capture" : "Preparing..."}
</button>
)}

<button
onClick={handleSkip}
className="flex-1 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 font-buttonsfont"
>
Skip
</button>

</div>

</div>

) : (

<div className="space-y-4">

<img src={image} className="rounded-xl"/>

<div className="flex gap-3">

<button
onClick={handleSave}
className="flex-1 py-2 rounded-xl bg-blue-600 text-white"
>
Save Face
</button>

<button
onClick={()=>setImage(null)}
className="flex-1 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700"
>
Retake
</button>

</div>

<button
onClick={handleSkip}
className="w-full py-2 text-sm text-gray-500"
>
Skip for now
</button>

</div>

)}

</div>

</div>

)

}