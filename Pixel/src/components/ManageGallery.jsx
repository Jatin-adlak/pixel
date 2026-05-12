import { useState, useEffect } from "react"

export default function ManageGallery(){

const [eventId,setEventId] = useState("1")
const [images,setImages] = useState([])
const [uploading,setUploading] = useState(false)

/* LOAD IMAGES */

const loadImages = async () => {
try{
const res = await fetch(`http://localhost:8000/api/images/?event_id=${eventId}`)
const data = await res.json()
setImages(data)
}catch(err){
console.error(err)
}
}

useEffect(()=>{
loadImages()
},[eventId])

/* UPLOAD MULTIPLE */

const handleUpload = async (e) => {

const files = Array.from(e.target.files)
if(!files.length) return

try{

setUploading(true)

const formData = new FormData()

files.forEach(file=>{
formData.append("images", file)
})

formData.append("event_id", eventId)
formData.append("uploaded_by", "admin")

await fetch("http://localhost:8000/api/images/upload/",{
method:"POST",
body:formData
})

alert("Images uploaded ✅")
loadImages()

}catch(err){
console.error(err)
alert("Upload failed ❌")
}finally{
setUploading(false)
}

}

return(

<div className="space-y-6">

{/* EVENT SELECT */}

<select
value={eventId}
onChange={(e)=>setEventId(e.target.value)}
className="px-4 py-2 border rounded"
>
<option value="1">Photography Club Meetup</option>
<option value="2">Campus Nature Walk</option>
<option value="3">Hackathon Night</option>
</select>

{/* UPLOAD */}

<input type="file" multiple accept="image/*" onChange={handleUpload}/>

{uploading && <p>Uploading...</p>}

{/* GALLERY */}

<div className="grid grid-cols-3 gap-4">

{images.map((img,i)=>(
<img key={i} src={img.url} className="rounded-lg"/>
))}

</div>

</div>

)
}