import Hero from "../components/Hero"
import FilmRoll from "../components/FilmRoll"
import Features from "../components/Features"
import Team from "../components/Team"
import Footer from "../components/Footer"
import About from "../components/About"
import Foundation from "../components/Foundation"

export default function Home(){

return(

<div className="
bg-white
dark:bg-black
text-black
dark:text-white
min-h-screen
">

<Hero/>

<About/>

<FilmRoll/>

<Features/>

<Foundation />

<Team/>

<Footer/>

</div>

)

}