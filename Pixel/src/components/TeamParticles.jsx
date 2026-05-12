import { useEffect, useRef } from "react"

export default function TeamParticles(){

const canvasRef = useRef(null)

useEffect(()=>{

const canvas = canvasRef.current
const ctx = canvas.getContext("2d")

let particles = []
let animationId

function resize(){
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight
}

resize()
window.addEventListener("resize", resize)

const colors = [
"#ff4d4d",
"#ffcc00",
"#00d4ff",
"#7cffcb",
"#ff7cf0",
]

class Particle{

constructor(){

this.x = Math.random()*canvas.width
this.y = Math.random()*canvas.height

this.size = Math.random()*2 + 1

this.vx = (Math.random()-0.5)*0.25
this.vy = (Math.random()-0.5)*0.25

this.color = colors[Math.floor(Math.random()*colors.length)]

}

update(){

this.x += this.vx
this.y += this.vy

if(this.x < 0 || this.x > canvas.width) this.vx *= -1
if(this.y < 0 || this.y > canvas.height) this.vy *= -1

}

draw(){

ctx.beginPath()
ctx.arc(this.x,this.y,this.size,0,Math.PI*2)

ctx.fillStyle = this.color

ctx.shadowBlur = 6
ctx.shadowColor = this.color

ctx.fill()

ctx.shadowBlur = 0

}

}

for(let i=0;i<90;i++){
particles.push(new Particle())
}

function connectParticles(){

for(let a=0;a<particles.length;a++){

for(let b=a+1;b<particles.length;b++){

let dx = particles[a].x - particles[b].x
let dy = particles[a].y - particles[b].y

let distance = dx*dx + dy*dy

if(distance < 10000){ // ~100px

ctx.strokeStyle = "rgba(200,200,200,0.15)"
ctx.lineWidth = 1

ctx.beginPath()
ctx.moveTo(particles[a].x,particles[a].y)
ctx.lineTo(particles[b].x,particles[b].y)
ctx.stroke()

}

}

}

}

function animate(){

ctx.clearRect(0,0,canvas.width,canvas.height)

particles.forEach(p=>{
p.update()
p.draw()
})

connectParticles()

animationId = requestAnimationFrame(animate)

}

animate()

return ()=>{
cancelAnimationFrame(animationId)
window.removeEventListener("resize", resize)
}

},[])

return(

<canvas
ref={canvasRef}
className="absolute inset-0 w-full h-full pointer-events-none"
/>

)

}