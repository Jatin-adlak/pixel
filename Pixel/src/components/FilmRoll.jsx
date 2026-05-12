import React from "react"
import "../filmroll.css"

const images = [
"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512341/photo5_cdywlo.jpg",   
"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512341/photo2_pflffl.jpg",
"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512341/photo3_qtudet.jpg",
"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512346/photo10_m1fzw9.jpg",
"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512348/photo12_vevers.jpg",
"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512350/photo9_eeyxje.jpg",
"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512352/photo4_gv3o54.jpg",
"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512354/photo6_p5lng5.jpg",
"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512355/photo11_bsnjji.jpg",
"https://res.cloudinary.com/dwk329jcv/image/upload/v1773512357/photo8_osh2md.jpg" 
]

export default function FilmRoll(){

return(

<section id = "filmroll" className="film-section">

<h2 className="film-title font-headersfont" >Captured Moments</h2>

<div className="film-wrapper">

<div className="film-track">

{images.concat(images).map((src,i)=>(
<div className="film-frame" key={i}>
<img src={src} />
</div>
))}

</div>

</div>

</section>

)

}