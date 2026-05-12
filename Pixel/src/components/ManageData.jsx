import { useState } from "react"
import ManageGallery from "../components/ManageGallery"
import ManageFeed from "../components/ManageFeed"

export default function ManageData(){

const [tab,setTab] = useState("gallery")

return(

<div className="min-h-screen pt-24 px-6 bg-white dark:bg-black text-black dark:text-white font-headersfont">

<h1 className="text-3xl mb-6">Manage Data</h1>

{/* SWITCH */}

<div className="flex gap-4 mb-8 font-buttonsfont">

<button
onClick={()=>setTab("gallery")}
className={`px-4 py-2 rounded-full ${
tab==="gallery" ? "bg-blue-600 text-white" : "border"
}`}
>
Gallery
</button>

<button
onClick={()=>setTab("feed")}
className={`px-4 py-2 rounded-full ${
tab==="feed" ? "bg-blue-600 text-white" : "border"
}`}
>
Feed
</button>

</div>

{/* CONTENT */}

{tab === "gallery" ? <ManageGallery/> : <ManageFeed/>}

</div>

)
}