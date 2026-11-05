import { motion, useMotionValue, useSpring, useTransform, type Variants } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import FloatingStickers from "../common/FloatingStickers"
import MagneticHeadline from "../common/MagneticHeadline"
import TerminalModal, { type StickerInfo } from "../common/TerminalModal"

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const [selectedSticker, setSelectedSticker] = useState<StickerInfo | null>(null)

  /* ---- Animated Grid: slow autonomous drift + subtle mouse parallax ---- */
  const GRID_SIZE = 80
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Gentle spring following the cursor for subtle parallax
  const springX = useSpring(mouseX, { damping: 60, stiffness: 30, mass: 1 })
  const springY = useSpring(mouseY, { damping: 60, stiffness: 30, mass: 1 })

  // Map cursor position to small grid shift (±12px range)
  const parallaxX = useTransform(springX, [0, 1], [-12, 12])
  const parallaxY = useTransform(springY, [0, 1], [-12, 12])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth)
      mouseY.set(e.clientY / window.innerHeight)
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

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
      className="relative flex min-h-screen items-center overflow-hidden pt-10 pb-12 sm:pt-10 lg:pt-0 text-white"
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      {/* Slowly drifting grid with mouse parallax */}
      <motion.div
        className="pointer-events-none absolute inset-[-80px] opacity-[0.04]"
        style={{
          x: parallaxX,
          y: parallaxY,
          backgroundImage: `
            linear-gradient(rgba(136,192,208,0.45) 1px, transparent 1px),
            linear-gradient(90deg, rgba(136,192,208,0.45) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }}
      >
        {/* Continuous drift animation via CSS */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(136,192,208,0.45) 1px, transparent 1px),
              linear-gradient(90deg, rgba(136,192,208,0.45) 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          }}
          animate={{
            backgroundPosition: [
              "0px 0px, 0px 0px",
              `${GRID_SIZE}px ${GRID_SIZE}px, ${GRID_SIZE}px ${GRID_SIZE}px`,
            ],
          }}
          transition={{
            duration: 25,
            ease: "linear",
            repeat: Infinity,
          }}
        />
      </motion.div>

      {/* Radial vignette mask over the grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, #2E3440 80%)",
        }}
      />

      {/* =====================================================
          HERO CONTENT (Left Editorial Headline + Right Standby Terminal)
      ====================================================== */}
      <div className="pointer-events-none relative z-10 flex min-h-screen w-full items-center pt-10 pb-16">
        <div className="pointer-events-none relative mx-auto flex w-full max-w-[1600px] px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="pointer-events-none w-full"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 ">
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
        heroRef={heroRef}
        onSelectSticker={(info) => setSelectedSticker(info)}
      />
    </section>
  )
}
