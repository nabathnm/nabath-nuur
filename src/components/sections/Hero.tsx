import { motion, useMotionValue, useReducedMotion } from "framer-motion"
import { useCallback, useState } from "react"
import FloatingStickers from "../common/FloatingStickers"
import HeroContent from "../common/HeroContent"
import Cat from "../svg/Cat"

export default function Hero() {
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const reducedMotion = useReducedMotion()
  const [isTouchDevice] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reducedMotion || isTouchDevice) return
      const rect = e.currentTarget.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width)
      mouseY.set((e.clientY - rect.top) / rect.height)
    },
    [mouseX, mouseY, reducedMotion, isTouchDevice]
  )

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden pt-28 text-white"
      onMouseMove={handleMouseMove}
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
          FLOATING STICKERS
      ====================================================== */}
      <FloatingStickers mouseX={mouseX} mouseY={mouseY} />

      {/* =====================================================
          HERO CONTENT (z-20 agar di atas stickers z-10)
      ====================================================== */}
      <div className="relative z-20 flex h-full items-center justify-center">
        <HeroContent />
      </div>

      {/* =====================================================
          CAT (z-20, pointer-events-none)
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
    </section>
  )
}
