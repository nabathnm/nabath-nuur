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
import Glass from "../ui/glass"


/* =====================================================
   CONSTANTS & HELPERS
====================================================== */

export const DEFAULT_CARD_W = 330
export const DEFAULT_CARD_H = 475
const CARD_RADIUS = 32

/** Progress milestones for the 3-phase scroll choreography:
 * Phase 1 (0.00 -> 0.22): Card emerges from bottom up to the center of the viewport.
 * Phase 2 (0.22 -> 0.34): Card stays centered at rest (user can inspect the profile card).
 * Phase 3 (0.34 -> 0.72): Card expands from center to fullscreen with scroll mask.
 * Phase 4 (0.72 -> 1.00): Fullscreen content hold.
 */
const ENTRY_START = 0.0
const ENTRY_END = 0.22
const EXPAND_START = 0.34
const EXPAND_END = 0.72

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

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
  /** Resting card dimensions before scroll expansion (default: 330x475) */
  cardWidth?: number
  cardHeight?: number
  /** Shown while the card is still small (fades out as it grows). */
  idleContent?: ReactNode
  /** Fullscreen content (revealed with <ScrollReveal />). */
  children?: ReactNode
}

export default function ScrollMaskCard({
  progress,
  imageSrc,
  imageAlt = "",
  cardWidth = DEFAULT_CARD_W,
  cardHeight = DEFAULT_CARD_H,
  idleContent,
  children,
}: ScrollMaskCardProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const baseSize = (fW: number, fH: number) => {
    const width = Math.min(
      cardWidth,
      fW * 0.85,
      (fH * 0.78 * cardWidth) / cardHeight
    )
    return { width, height: (width * cardHeight) / cardWidth }
  }

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

  // Phase 1: Card emerges from bottom up to the vertical center of the screen
  const entryY = useTransform([progress, frameH], (latest: number[]) => {
    const [p, h] = latest
    if (reduceMotion) return 0
    if (p <= ENTRY_START) return h * 0.85
    if (p >= ENTRY_END) return 0
    const t = (p - ENTRY_START) / (ENTRY_END - ENTRY_START)
    // easeOutCubic for a smooth deceleration into center stage
    const eased = 1 - Math.pow(1 - t, 3)
    return (h * 0.85) * (1 - eased)
  })

  // Phase 3: Card expands from center to fullscreen with mask effect
  const expand = useTransform(progress, [EXPAND_START, EXPAND_END], [0, 1], {
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

  // Vertical position combines entry rise + gentle idle float in center
  const y = useTransform([entryY, float, expand], (latest: number[]) => {
    const [ey, f, e] = latest
    const settle = ey < 80 ? Math.max(0, 1 - ey / 80) : 0
    const expandFade = Math.max(0, 1 - e)
    return ey + f * settle * expandFade
  })

  // Rotation: starts slightly tilted like the divider deck, straightens as it reaches center, then straightens to 0 on expand
  const rotate = useTransform([progress, float, expand], (latest: number[]) => {
    const [p, f, e] = latest
    if (reduceMotion) return 0
    let baseRot = -2.5
    if (p < ENTRY_END) {
      const t = Math.max(0, p / ENTRY_END)
      baseRot = 6 * (1 - t) + (-2.5) * t
    }
    return (baseRot + (f + 5) / 15) * (1 - e)
  })

  const idleOpacity = useTransform(expand, [0, 0.35], [1, 0])
  const glassOpacity = useTransform(expand, [0, 0.5], [1, 0])
  const dimOpacity = useTransform(expand, [0.25, 0.75], [0, 0.6])

  const contentPointerEvents = useTransform(
    progress,
    (v: number): "auto" | "none" => (v > 0.75 ? "auto" : "none")
  )

  return (
    <div
      ref={frameRef}
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
    >
      <motion.div
        style={{
          width,
          height,
          borderRadius,
          borderColor,
          y,
          rotate,
        }}
        className="
          pointer-events-auto
          relative shrink-0
          overflow-hidden
          border
          bg-gradient-to-br from-[#3B4252] to-[#2E3440]
          shadow-2xl
        "
      >
        {/* Image (object-cover, static) */}
        <div className="absolute inset-0">
          {imageSrc && (
            <img
              src={imageSrc}
              alt={imageAlt}
              draggable={false}
              loading="eager"
              crossOrigin="anonymous"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          )}
        </div>

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
            className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden"
          >
            <div className="flex h-full w-full items-center justify-center">
              {children}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}