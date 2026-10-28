import { motion, type Variants } from "framer-motion"
import Cat from "../svg/Cat"
import HeroContent from "./Hero/HeroContent"

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden pt-28 text-white scroll-mt-28"
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(circle at center, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 0%, transparent 75%)",
        }}
      />

      {/* Stars */}
      <div className="pointer-events-none absolute left-[12%] top-[22%] h-1 w-1 rounded-full bg-white/40" />
      <div className="pointer-events-none absolute left-[24%] top-[38%] h-[3px] w-[3px] rounded-full bg-white/30" />
      <div className="pointer-events-none absolute right-[25%] top-[18%] h-1 w-1 rounded-full bg-white/30" />
      <div className="pointer-events-none absolute right-[12%] top-[43%] h-[3px] w-[3px] rounded-full bg-white/30" />
      <div className="pointer-events-none absolute left-[42%] bottom-[18%] h-[3px] w-[3px] rounded-full bg-white/20" />

      {/* =====================================================
          FLOATING CARDS (MENGELILINGI KONTEN UTAMA)
      ====================================================== */}
      
      {/* Card 1: Kiri Atas */}
      <motion.div
        initial={{ opacity: 0, x: -50, y: 20 }}
        animate={{ 
          opacity: 1, 
          x: 0, 
          y: [0, -10, 0] // Floating effect
        }}
        transition={{
          opacity: { duration: 0.8, delay: 0.2 },
          x: { duration: 0.8, delay: 0.2, type: "spring" },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute left-[5%] top-[25%] z-10 hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-xl backdrop-blur-md md:block lg:left-[10%]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-white/50">Specialized In</p>
            <p className="text-sm font-medium text-white/90">Web Development</p>
          </div>
        </div>
      </motion.div>

      {/* Card 2: Kiri Bawah */}
      <motion.div
        initial={{ opacity: 0, x: -50, y: -20 }}
        animate={{ 
          opacity: 1, 
          x: 0, 
          y: [0, 15, 0] 
        }}
        transition={{
          opacity: { duration: 0.8, delay: 0.4 },
          x: { duration: 0.8, delay: 0.4, type: "spring" },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }
        }}
        className="absolute bottom-[20%] left-[8%] z-10 hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-xl backdrop-blur-md md:block lg:left-[15%]"
      >
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="h-8 w-8 rounded-full border-2 border-[#1a1b26] bg-amber-500/20 flex items-center justify-center text-xs">JS</div>
            <div className="h-8 w-8 rounded-full border-2 border-[#1a1b26] bg-cyan-500/20 flex items-center justify-center text-xs">TS</div>
            <div className="h-8 w-8 rounded-full border-2 border-[#1a1b26] bg-sky-500/20 flex items-center justify-center text-xs">Re</div>
          </div>
          <p className="text-sm font-medium text-white/70">Modern Stack</p>
        </div>
      </motion.div>

      {/* Card 3: Kanan Atas */}
      <motion.div
        initial={{ opacity: 0, x: 50, y: 20 }}
        animate={{ 
          opacity: 1, 
          x: 0, 
          y: [0, -12, 0] 
        }}
        transition={{
          opacity: { duration: 0.8, delay: 0.6 },
          x: { duration: 0.8, delay: 0.6, type: "spring" },
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
        }}
        className="absolute right-[5%] top-[20%] z-10 hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-xl backdrop-blur-md md:block lg:right-[12%]"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-sm font-medium text-white/90">Available for work</p>
        </div>
      </motion.div>

      {/* =====================================================
          HERO CONTENT
      ====================================================== */}
      <div className="relative z-20 flex h-full items-center justify-center">
        <HeroContent />
      </div>

      {/* =====================================================
          CAT
      ====================================================== */}

      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 1,
          delay: 0.8,
          ease: "easeOut",
        }}
        className="pointer-events-none absolute bottom-2 right-2 z-20 w-48 select-none sm:right-5 sm:w-60 md:right-8 md:-bottom-6 md:w-72 lg:right-4 lg:-bottom-8 lg:w-[340px]"
      >
        <Cat />
      </motion.div>

      {/* =====================================================
          BOTTOM DECORATION
      ====================================================== */}
    </section>
  )
}