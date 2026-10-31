import { motion } from "framer-motion"

import Navbar from "./components/layout/Navbar"
import About from "./components/sections/About"
import Experiences from "./components/sections/Experiences"
import Footer from "./components/sections/Footer"
import Hero from "./components/sections/Hero"
import Projects from "./components/sections/Projects"
import Services from "./components/sections/Services"
import Tools from "./components/sections/Tools"
import UfoCursor from "./components/ui/UfoCursor"

export function App() {
  return (
    <div className="relative min-h-screen w-full bg-[#2E3440]">
      {/* Global Ambient Background with framer-motion */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/[0.02] blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-32 -bottom-40 h-[28rem] w-[28rem] rounded-full bg-white/[0.01] blur-3xl"
        />
      </div>

      <Navbar />

      <div className="relative z-10">
        <Hero />
        <About />
        <Services />
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
