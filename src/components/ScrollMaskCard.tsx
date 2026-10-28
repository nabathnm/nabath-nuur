"use client"

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react"
import Glass from "./ui/glass"


/* =====================================================
   CONSTANTS & HELPERS
====================================================== */

const CARD_W = 270
const CARD_H = 390
const CARD_RADIUS = 32

/** Card finishes expanding at this scroll progress; the rest is "hold" time. */
const EXPAND_END = 0.65

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

/** Resting size of the card, kept proportional and safe on small screens. */
function baseSize(frameW: number, frameH: number) {
  const width = Math.min(
    CARD_W,
    frameW * 0.8,
    (frameH * 0.75 * CARD_W) / CARD_H
  )
  return { width, height: (width * CARD_H) / CARD_W }
}

/* =====================================================
   SCROLL REVEAL (scrubbed fade + rise tied to progress)
====================================================== */

interface ScrollRevealProps {
  progress: MotionValue<number>
  range: [number, number]
  className?: string
  children: ReactNode
}

export function ScrollReveal({
  progress,
  range,
  className,
  children,
}: ScrollRevealProps) {
  const opacity = useTransform(progress, range, [0, 1])
  const y = useTransform(progress, range, [28, 0])

  return (
    <motion.div style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  )
}

/* =====================================================
   SCROLL MASK CARD
====================================================== */

interface ScrollMaskCardProps {
  /** Scroll progress (0 → 1) of the sticky track. */
  progress: MotionValue<number>
  imageSrc?: string
  imageAlt?: string
  /** Shown while the card is still small (fades out as it grows). */
  idleContent?: ReactNode
  /** Fullscreen content (revealed with <ScrollReveal />). */
  children?: ReactNode
}

export default function ScrollMaskCard({
  progress,
  imageSrc,
  imageAlt = "",
  idleContent,
  children,
}: ScrollMaskCardProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  // Frame size lives in motion values -> no React re-render on resize/scroll.
  const frameW = useMotionValue(1280)
  const frameH = useMotionValue(800)

  useIsoLayoutEffect(() => {
    const el = frameRef.current
    if (!el) return undefined

    const update = () => {
      frameW.set(el.clientWidth)
      frameH.set(el.clientHeight)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [frameW, frameH])

  // Idle floating motion (fades out as the card expands).
  const float = useMotionValue(-5)

  useEffect(() => {
    if (reduceMotion) {
      float.set(0)
      return undefined
    }

    const controls = animate(float, [-5, 5, -5], {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    })
    return () => controls.stop()
  }, [float, reduceMotion])

  /* ---------- scroll-driven values ---------- */

  const expand = useTransform(progress, [0, EXPAND_END], [0, 1], {
    ease: easeInOutSine,
  })

  const width = useTransform(
    [expand, frameW, frameH],
    (latest: number[]) => {
      const [e, w, h] = latest
      return lerp(baseSize(w, h).width, w, e)
    }
  )

  const height = useTransform(
    [expand, frameW, frameH],
    (latest: number[]) => {
      const [e, w, h] = latest
      return lerp(baseSize(w, h).height, h, e)
    }
  )

  const borderRadius = useTransform(expand, [0, 1], [CARD_RADIUS, 0])

  const borderColor = useTransform(
    expand,
    [0, 0.6],
    ["rgba(255,255,255,0.1)", "rgba(255,255,255,0)"]
  )

  const y = useTransform([float, expand], (latest: number[]) => {
    const [f, e] = latest
    return f * (1 - e)
  })

  const rotate = useTransform([float, expand], (latest: number[]) => {
    const [f, e] = latest
    return (-3 + (f + 5) / 10) * (1 - e)
  })

  const imageScale = useTransform(progress, [0, 0.8], [1.25, 1])
  const idleOpacity = useTransform(expand, [0, 0.3], [1, 0])
  const glassOpacity = useTransform(expand, [0, 0.5], [1, 0])
  const dimOpacity = useTransform(progress, [0.3, 0.7], [0, 0.6])

  const contentPointerEvents = useTransform(
    progress,
    (v: number): "auto" | "none" => (v > 0.85 ? "auto" : "none")
  )

  return (
    <div
      ref={frameRef}
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
    >
      <motion.div
        style={{ width, height, borderRadius, borderColor, y, rotate }}
        className="
          pointer-events-auto
          relative shrink-0
          overflow-hidden
          border
          bg-gradient-to-br from-[#3B4252] to-[#2E3440]
          shadow-2xl
        "
      >
        {/* Image (object-cover, subtle zoom-out) */}
        <motion.div
          style={{ scale: imageScale }}
          className="absolute inset-0 will-change-transform"
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt={imageAlt}
              draggable={false}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          )}
        </motion.div>

        {/* Nord gradient overlay */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-b
            from-[#2E3440]/10
            via-transparent
            to-[#2E3440]/90
          "
        />

        {/* Extra dimming for fullscreen text legibility */}
        <motion.div
          style={{ opacity: dimOpacity }}
          className="absolute inset-0 bg-[#2E3440]"
        />

        {/* Glass layer (fades out when fullscreen) */}
        <motion.div
          style={{ opacity: glassOpacity }}
          className="absolute inset-0 rounded-[inherit]"
        >
          <Glass rounded="rounded-[inherit]" />
        </motion.div>

        {/* Idle card content */}
        {idleContent && (
          <motion.div
            style={{ opacity: idleOpacity }}
            className="absolute inset-0 z-10"
          >
            {idleContent}
          </motion.div>
        )}

        {/* Fullscreen content */}
        {children && (
          <motion.div
            style={{ pointerEvents: contentPointerEvents }}
            className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden px-6 md:px-8"
          >
            <div className="mx-auto w-full max-w-4xl">{children}</div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}