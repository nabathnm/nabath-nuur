
import Navbar from "./components/layout/Navbar"
import Hero from "./components/sections/Hero"
import HeroAboutDivider from "./components/common/HeroAboutDivider"
import About from "./components/sections/About"
import Experiences from "./components/sections/Experiences"
import Footer from "./components/sections/Footer"
import Projects from "./components/sections/Projects"
import Tools from "./components/sections/Tools"
import UfoCursor from "./components/ui/UfoCursor"

export function App() {
  return (
    <div className="relative min-h-screen w-full bg-[#2E3440]">
      <Navbar />

      <div className="relative z-10">
        <Hero />
        <HeroAboutDivider />
        <About />
        {/* <Services /> */}
        <Tools />
        <Projects />
        <Experiences />
        <Footer />
      </div>

      {/* Smooth Cursor-Following UFO Companion */}
      <UfoCursor />
    </div>
  )
}

export default App
