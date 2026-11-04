import { motion, useMotionValue, useReducedMotion, type Variants } from "framer-motion"
import { useCallback, useRef, useState } from "react"
import FloatingStickers from "../common/FloatingStickers"
import MagneticHeadline from "../common/MagneticHeadline"
import TerminalModal, { type StickerInfo } from "../common/TerminalModal"

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const [selectedSticker, setSelectedSticker] = useState<StickerInfo | null>(null)

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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 24,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  }

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative flex min-h-screen items-center overflow-hidden pt-20 pb-12 sm:pt-24 lg:pt-28 text-white"
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

      {/* =====================================================
          HERO CONTENT (Left Editorial Headline + Right Standby Terminal)
      ====================================================== */}
      <div className="pointer-events-none relative z-10 flex min-h-screen w-full items-center pt-24 pb-16 sm:pt-28">
        <div className="pointer-events-none relative mx-auto flex w-full max-w-[1600px] items-center px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="pointer-events-none w-full"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
              {/* Left Column: Interactive Editorial Typography */}
              <div className="lg:col-span-7 xl:col-span-7 text-left">
                <motion.div
                  variants={itemVariants}
                  className="pointer-events-none relative z-10"
                >
                  {/* Interactive headline with magnetic cursor avoidance */}
                  <div className="pointer-events-auto inline-block">
                    <MagneticHeadline className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl leading-[1.08] tracking-[-0.03em]" />
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Standby Terminal Console (Docked next to text) */}
              <div className="lg:col-span-5 xl:col-span-5 w-full">
                <motion.div
                  variants={itemVariants}
                  className="pointer-events-auto relative z-20 w-full"
                >
                  <TerminalModal
                    sticker={selectedSticker}
                    onClose={() => setSelectedSticker(null)}
                    onSelectSticker={(info) => setSelectedSticker(info)}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* =====================================================
          FLOATING & DRAGGABLE STICKERS (z-30 on top of empty space)
      ====================================================== */}
      <FloatingStickers
        mouseX={mouseX}
        mouseY={mouseY}
        heroRef={heroRef}
        onSelectSticker={(info) => setSelectedSticker(info)}
      />
    </section>
  )
}
