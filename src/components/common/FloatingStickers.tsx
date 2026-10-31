import {
  motion,
  useReducedMotion,
  useTransform,
  type Easing,
  type MotionValue,
} from "framer-motion"

interface FloatingStickersProps {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}

/* ------------------------------------------------------------------ */
/*  Shared wrapper — handles entrance, parallax, and floating          */
/* ------------------------------------------------------------------ */

interface StickerProps {
  children: React.ReactNode
  /** Extra Tailwind classes (positioning, visibility, z-index, etc.) */
  className?: string
  /** Entrance delay in seconds */
  delay?: number
  /** Parallax intensity — higher = more movement */
  depth?: number
  /** Continuous float amplitude & period */
  float?: { y?: number; x?: number; rotate?: number; duration?: number }
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  prefersReducedMotion: boolean | null
}

function Sticker({
  children,
  className = "",
  delay = 0.4,
  depth = 10,
  float = { y: 8, duration: 5 },
  mouseX,
  mouseY,
  prefersReducedMotion,
}: StickerProps) {
  // Parallax — driven by cursor MotionValues, applied via `style`
  const px = useTransform(mouseX, [0, 1], [-depth, depth])
  const py = useTransform(mouseY, [0, 1], [-depth, depth])

  const ease: Easing = "easeInOut"

  return (
    // Outer layer: positioning + cursor parallax (style-driven, no animate)
    <motion.div
      className={`pointer-events-none absolute z-10 ${className}`}
      style={prefersReducedMotion ? undefined : { x: px, y: py }}
    >
      {/* Inner layer: entrance + continuous floating animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={
          prefersReducedMotion
            ? { opacity: 1, scale: 1, y: 0 }
            : {
                opacity: 1,
                scale: 1,
                y: float.y ? [0, -(float.y ?? 8)] : 0,
                x: float.x ? [0, float.x] : undefined,
                rotate: float.rotate ? [0, float.rotate] : undefined,
              }
        }
        transition={{
          /* entrance */
          opacity: { duration: prefersReducedMotion ? 0 : 0.6, delay },
          scale: {
            duration: prefersReducedMotion ? 0 : 0.5,
            delay,
            type: "spring",
            stiffness: 260,
            damping: 20,
          },
          /* continuous floating */
          ...(prefersReducedMotion
            ? {}
            : {
                y: float.y
                  ? { repeat: Infinity, repeatType: "mirror" as const, duration: float.duration ?? 5, ease }
                  : undefined,
                x: float.x
                  ? { repeat: Infinity, repeatType: "mirror" as const, duration: (float.duration ?? 5) * 1.15, ease }
                  : undefined,
                rotate: float.rotate
                  ? { repeat: Infinity, repeatType: "mirror" as const, duration: (float.duration ?? 5) * 1.3, ease }
                  : undefined,
              }),
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function FloatingStickers({ mouseX, mouseY }: FloatingStickersProps) {
  const prefersReducedMotion = useReducedMotion()

  const shared = { mouseX, mouseY, prefersReducedMotion }

  return (
    <>
      {/* ─── 1. "Software Developer" pill — top-left ───────────── */}
      <Sticker
        className="left-[4%] top-[12%] hidden lg:block xl:left-[7%]"
        delay={0.5}
        depth={15}
        float={{ y: 10, duration: 5.5 }}
        {...shared}
      >
        <div
          className="-rotate-3 rounded-full bg-[#88C0D0] px-4 py-1.5 shadow-lg shadow-[#88C0D0]/20"
        >
          <span className="text-xs font-bold tracking-wide text-[#2E3440]">
            Software Developer
          </span>
        </div>
      </Sticker>

      {/* ─── 2. "Available for Work" — top-right ─────────────── */}
      <Sticker
        className="right-[4%] top-[10%] sm:right-[6%] sm:top-[11%]"
        delay={0.3}
        depth={8}
        float={{ y: 6, duration: 4 }}
        {...shared}
      >
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 shadow-xl backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-[10px] font-medium text-white/80 sm:text-xs">
            Available for Work
          </span>
        </div>
      </Sticker>

      {/* ─── 3. React icon — left side, slightly below center ── */}
      <Sticker
        className="left-[3%] top-[55%] hidden md:block lg:left-[5%] lg:top-[52%]"
        delay={0.8}
        depth={18}
        float={{ y: 12, x: 4, duration: 6 }}
        {...shared}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#61DAFB] shadow-lg shadow-[#61DAFB]/20">
          <svg
            viewBox="-11 -11 22 22"
            className="h-6 w-6"
            fill="none"
            stroke="#2E3440"
            strokeWidth="1"
          >
            <circle cx="0" cy="0" r="2" fill="#2E3440" stroke="none" />
            <ellipse rx="10" ry="4" />
            <ellipse rx="10" ry="4" transform="rotate(60)" />
            <ellipse rx="10" ry="4" transform="rotate(120)" />
          </svg>
        </div>
      </Sticker>

      {/* ─── 4. TypeScript badge — right side ─────────────────── */}
      <Sticker
        className="right-[3%] top-[50%] hidden xl:block"
        delay={1.0}
        depth={12}
        float={{ y: 7, rotate: 3, duration: 5 }}
        {...shared}
      >
        <div className="rotate-[6deg] rounded-lg bg-[#3178C6] p-2 shadow-lg shadow-[#3178C6]/20">
          <span className="text-xs font-extrabold leading-none text-white">
            TS
          </span>
        </div>
      </Sticker>

      {/* ─── 5. Flutter / Dart badge — bottom-left ──────────── */}
      <Sticker
        className="bottom-[22%] left-[6%] hidden lg:block xl:left-[10%]"
        delay={1.1}
        depth={14}
        float={{ y: 9, x: 3, duration: 6.5 }}
        {...shared}
      >
        <div className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-[#42A5F5] to-[#88C0D0] px-3 py-1.5 shadow-lg">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="white">
            <polygon points="8,0 16,8 8,8 8,0" />
            <polygon points="8,8 16,8 8,16 0,8" opacity="0.7" />
          </svg>
          <span className="text-[10px] font-bold text-white">Flutter</span>
        </div>
      </Sticker>


      {/* ─── 7. Planet sticker — top area ──────────────────── */}
      <Sticker
        className="left-[28%] top-[5%] hidden md:block lg:left-[22%]"
        delay={0.7}
        depth={20}
        float={{ y: 10, rotate: 5, duration: 7 }}
        {...shared}
      >
        <svg viewBox="0 0 36 36" className="h-8 w-8 lg:h-9 lg:w-9" fill="none">
          <defs>
            <linearGradient id="planet-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#B48EAD" />
              <stop offset="100%" stopColor="#88C0D0" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="8" fill="url(#planet-grad)" />
          <ellipse
            cx="18"
            cy="18"
            rx="16"
            ry="5"
            stroke="url(#planet-grad)"
            strokeWidth="1.5"
            transform="rotate(-20 18 18)"
            opacity="0.7"
          />
        </svg>
      </Sticker>

      {/* ─── 8. Star clusters ──────────────────────────────── */}
      {/* Group A — subtle stars, visible on mobile */}
      <Sticker
        className="left-[15%] top-[30%] sm:left-[20%] sm:top-[26%]"
        delay={0.6}
        depth={5}
        float={{ y: 5, duration: 3.5 }}
        {...shared}
      >
        <span className="select-none text-[10px] text-white/25" aria-hidden>
          ✦
        </span>
      </Sticker>

      <Sticker
        className="right-[10%] top-[35%] sm:right-[15%] sm:top-[30%]"
        delay={0.75}
        depth={6}
        float={{ y: 4, x: 2, duration: 4 }}
        {...shared}
      >
        <span className="select-none text-[8px] text-white/20" aria-hidden>
          ✦
        </span>
      </Sticker>

      <Sticker
        className="right-[22%] top-[8%] sm:right-[25%]"
        delay={0.9}
        depth={4}
        float={{ y: 6, duration: 4.8 }}
        {...shared}
      >
        <span className="select-none text-[6px] text-white/20" aria-hidden>
          ✦
        </span>
      </Sticker>

      {/* Group B — bottom-left */}
      <Sticker
        className="bottom-[30%] left-[8%] sm:bottom-[35%] sm:left-[12%]"
        delay={1.0}
        depth={5}
        float={{ y: 5, duration: 3.8 }}
        {...shared}
      >
        <span className="select-none text-[8px] text-white/25" aria-hidden>
          ✦
        </span>
      </Sticker>


      {/* ─── 10. Year badge — bottom-right, above Cat ─────── */}
      <Sticker
        className="bottom-[20%] right-[14%] hidden lg:block"
        delay={1.4}
        depth={8}
        float={{ y: 5, duration: 4.2 }}
        {...shared}
      >
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 shadow-xl backdrop-blur-md">
          <span className="text-[10px] font-semibold tabular-nums text-white/60">
            {new Date().getFullYear()}
          </span>
        </div>
      </Sticker>
    </>
  )
}
