import {
  motion,
  useReducedMotion,
  type Easing,
} from "framer-motion"
import { useRef } from "react"
import cvImg from "../sticker/cv.png"
import laptopImg from "../sticker/laptop.png"
import ubImg from "../sticker/ub.png"
import Cat from "../svg/Cat"
import { type StickerInfo } from "./TerminalModal"

export const STICKER_DATA: Record<string, StickerInfo> = {
  ub: {
    id: "academics",
    command: "cat ~/education/universitas-brawijaya.md",
    title: "Universitas Brawijaya (UB)",
    badge: "ACADEMICS",
    badgeColor: "border border-amber-400/30 bg-amber-400/10 text-amber-300",
    description:
      "Pursuing a degree in Information Technology / Computer Science at Universitas Brawijaya. Focused on software engineering, algorithms, mobile architecture, and scalable system design.",
    fields: [
      { label: "Institution", value: "Universitas Brawijaya, Malang" },
      { label: "Faculty / Major", value: "Computer Science / Information Technology" },
      { label: "Key Studies", value: "Mobile Development, Distributed Systems, Software Engineering" },
      { label: "Status", value: "Active Student & Technology Builder" },
    ],
  },
  laptop: {
    id: "workstation",
    command: "neofetch --hardware --developer-profile",
    title: "Developer Workstation",
    badge: "BATTLESTATION",
    badgeColor: "border border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    description:
      "Primary engineering workstation configured for high productivity, clean aesthetics, and rapid iteration across cross-platform mobile apps and web platforms.",
    fields: [
      { label: "Core Tools", value: "VS Code, Android Studio, Figma, Git" },
      { label: "Operating System", value: "Linux / macOS (Nord Theme Aesthetic)" },
      { label: "Shell & Terminal", value: "Zsh + Starship Prompt with modern CLI utilities" },
      { label: "Daily Driver", value: "Tested in high-stress hackathons & production builds" },
    ],
  },
  cat: {
    id: "cosmo-cat",
    command: "cat /proc/copilot/status",
    title: "Cosmo the Astronaut Cat",
    badge: "MISSION CO-PILOT",
    badgeColor: "border border-amber-400/30 bg-amber-400/10 text-amber-300",
    description:
      "Senior Rubber Duck Debugger and Cosmic Navigator. Observes all cursor trajectories with helmet servos and purrs softly when code compiles with zero errors.",
    fields: [
      { label: "Species", value: "Felis catus astronauticus" },
      { label: "Duty", value: "Code inspection & moral support" },
      { label: "Tracking", value: "Active interactive head movement following your pointer" },
      { label: "Favorite Fuel", value: "Tuna & Space Milk 🐟" },
      { label: "Status", value: "Purring in binary • 100% mission readiness" },
    ],
    
  },
  cv: {
    id: "curriculum-vitae",
    command: "cat ~/documents/curriculum-vitae.md",
    title: "Curriculum Vitae (CV)",
    badge: "RESUME / PROFILE",
    badgeColor: "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    description:
      "Comprehensive profile highlighting software engineering background, mobile & frontend development expertise, academic milestones, and project track record.",
    fields: [
      { label: "Full Name", value: "Muhammad Nabath Nuur Maulana" },
      { label: "Role", value: "Mobile & Frontend Engineer" },
      { label: "Key Stack", value: "Flutter, React, TypeScript, Next.js, Tailwind CSS" },
      { label: "Education", value: "Universitas Brawijaya (Informatics)" },
      { label: "Status", value: "Open for Software Engineering opportunities" },
    ],
  },
}

interface FloatingStickersProps {
  heroRef?: React.RefObject<HTMLElement | null>
  onSelectSticker: (info: StickerInfo) => void
}

/* ------------------------------------------------------------------ */
/*  Sticker Wrapper (Positioning + Idle Float + Drag + Tap)           */
/* ------------------------------------------------------------------ */

interface StickerProps {
  children: React.ReactNode
  info?: StickerInfo
  className?: string
  delay?: number
  float?: { y?: number; x?: number; rotate?: number; duration?: number }
  prefersReducedMotion: boolean | null
  heroRef?: React.RefObject<HTMLElement | null>
  onSelect?: (info: StickerInfo) => void
  isInteractive?: boolean
}

function Sticker({
  children,
  info,
  className = "",
  delay = 0.4,
  float = { y: 8, duration: 5 },
  prefersReducedMotion,
  heroRef,
  onSelect,
  isInteractive = true,
}: StickerProps) {
  const ease: Easing = "easeInOut"

  // Track pointer down coordinates to distinguish between click and drag accurately
  const downCoordsRef = useRef<{ x: number; y: number } | null>(null)
  const isDraggingRef = useRef(false)
  const lastTriggeredRef = useRef(0)

  const triggerSelect = () => {
    const now = performance.now()
    if (now - lastTriggeredRef.current < 250) return // prevent duplicate trigger
    lastTriggeredRef.current = now
    if (info && onSelect) {
      onSelect(info)
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    downCoordsRef.current = { x: e.clientX, y: e.clientY }
    isDraggingRef.current = false
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!downCoordsRef.current) return
    const dx = e.clientX - downCoordsRef.current.x
    const dy = e.clientY - downCoordsRef.current.y
    const distance = Math.hypot(dx, dy)
    downCoordsRef.current = null

    // If pointer moved less than 8px, it is definitively a click!
    if (distance < 8 && !isDraggingRef.current) {
      triggerSelect()
    }
  }

  const handleTap = () => {
    if (!isDraggingRef.current) {
      triggerSelect()
    }
  }

  return (
    // Outer layer: z-30 on top of hero content, pointer-events-none so space between stickers is free
    <div className={`pointer-events-none absolute z-30 ${className}`}>
      {/* Float layer: entrance animation + idle gentle floating */}
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
          opacity: { duration: prefersReducedMotion ? 0 : 0.6, delay },
          scale: {
            duration: prefersReducedMotion ? 0 : 0.5,
            delay,
            type: "spring",
            stiffness: 260,
            damping: 20,
          },
          ...(prefersReducedMotion
            ? {}
            : {
                y: float.y
                  ? {
                      repeat: Infinity,
                      repeatType: "mirror" as const,
                      duration: float.duration ?? 5,
                      ease,
                    }
                  : undefined,
                x: float.x
                  ? {
                      repeat: Infinity,
                      repeatType: "mirror" as const,
                      duration: (float.duration ?? 5) * 1.15,
                      ease,
                    }
                  : undefined,
                rotate: float.rotate
                  ? {
                      repeat: Infinity,
                      repeatType: "mirror" as const,
                      duration: (float.duration ?? 5) * 1.3,
                      ease,
                    }
                  : undefined,
              }),
        }}
      >
        {isInteractive ? (
          // Drag layer: draggable, tactile, clickable to launch terminal
          <motion.div
            drag
            dragConstraints={heroRef}
            dragElastic={0.2}
            dragMomentum={true}
            whileHover={{ scale: 1.08 }}
            whileDrag={{ scale: 1.15, zIndex: 60 }}
            onDragStart={() => {
              isDraggingRef.current = true
            }}
            onDragEnd={() => {
              setTimeout(() => {
                isDraggingRef.current = false
              }, 80)
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onTap={handleTap}
            className="pointer-events-auto cursor-pointer active:cursor-grabbing select-none touch-none"
            title={info ? `Click to inspect ${info.title} (or drag me!)` : undefined}
          >
            {children}
          </motion.div>
        ) : (
          <div className="pointer-events-none select-none">{children}</div>
        )}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Floating Stickers Composition (NO EXTRA STICKERS)           */
/* ------------------------------------------------------------------ */

export default function FloatingStickers({
  heroRef,
  onSelectSticker,
}: FloatingStickersProps) {
  const prefersReducedMotion = useReducedMotion()

  const shared = {
    prefersReducedMotion,
    heroRef,
    onSelect: onSelectSticker,
  }

  return (
    <>
      {/* ─── 1. Universitas Brawijaya (UB) Sticker ──────────────── */}
      <Sticker
        info={STICKER_DATA.ub}
        className="left-[10%] top-[14%] sm:left-[14%] sm:top-[12%] lg:left-[16%] lg:top-[10%]"
        delay={0.6}
        float={{ y: 8, rotate: -3, duration: 6 }}
        {...shared}
      >
        <div className="group/item relative rounded-3xl p-3 sm:p-4 transition-all duration-300 hover:drop-shadow-[0_12px_30px_rgba(235,203,139,0.45)]">
          <img
            src={ubImg}
            alt="Universitas Brawijaya"
            className="h-18 w-18 sm:h-22 sm:w-22 md:h-24 md:w-24 object-contain drop-shadow-md transition-transform duration-300 group-hover/item:scale-105 pointer-events-auto"
            draggable={false}
          />
          <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#2E3440]/90 px-2 py-0.5 text-[10px] font-mono text-[#88C0D0] opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover/item:opacity-100 border border-white/10">
            tap to inspect
          </span>
        </div>
      </Sticker>

      {/* ─── 2. Developer Laptop Sticker ────────────────────── */}
      <Sticker
        info={STICKER_DATA.laptop}
        className="right-[6%] top-[14%] sm:right-[10%] sm:top-[12%] lg:right-[14%] lg:top-[10%]"
        delay={0.8}
        float={{ y: 9, rotate: 4, duration: 6.5 }}
        {...shared}
      >
        <div className="group/item relative rounded-3xl p-3 sm:p-4 transition-all duration-300 hover:drop-shadow-[0_12px_30px_rgba(136,192,208,0.45)]">
          <img
            src={laptopImg}
            alt="Developer Workstation"
            className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 object-contain drop-shadow-md transition-transform duration-300 group-hover/item:scale-105 pointer-events-auto"
            draggable={false}
          />
          <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#2E3440]/90 px-2 py-0.5 text-[10px] font-mono text-[#88C0D0] opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover/item:opacity-100 border border-white/10">
            tap to inspect
          </span>
        </div>
      </Sticker>

      {/* ─── 3. Cosmo the Astronaut Cat Sticker ────────────── */}
      <Sticker
        info={STICKER_DATA.cat}
        className="right-2 bottom-0 sm:right-5 md:right-8 md:-bottom-4 lg:right-6 lg:-bottom-6"
        delay={0.7}
        float={{ y: 6, duration: 4.8 }}
        {...shared}
      >
        <div className="group/cat relative w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80 select-none p-2 transition-transform duration-300 hover:drop-shadow-[0_12px_35px_rgba(136,192,208,0.35)]">
          <Cat className="w-full h-auto drop-shadow-md pointer-events-auto" />
          <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#2E3440]/90 px-2 py-0.5 text-[10px] font-mono text-[#88C0D0] opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover/cat:opacity-100 border border-white/10">
            drag or tap Cosmo
          </span>
        </div>
      </Sticker>

      {/* ─── 4. Curriculum Vitae (CV) Sticker ──────────────── */}
      <Sticker
        info={STICKER_DATA.cv}
        className="left-[6%] bottom-[12%] sm:left-[10%] sm:bottom-[12%] lg:left-[14%] lg:bottom-[14%]"
        delay={0.9}
        float={{ y: 7, rotate: 2.5, duration: 5.8 }}
        {...shared}
      >
        <div className="group/item relative rounded-3xl p-3 sm:p-4 transition-all duration-300 hover:drop-shadow-[0_12px_30px_rgba(163,190,140,0.45)]">
          <img
            src={cvImg}
            alt="Curriculum Vitae"
            className="w-22 sm:w-26 md:w-30 lg:w-32 h-auto object-contain drop-shadow-md transition-transform duration-300 group-hover/item:scale-105 pointer-events-auto"
            draggable={false}
          />
          <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#2E3440]/90 px-2 py-0.5 text-[10px] font-mono text-[#88C0D0] opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover/item:opacity-100 border border-white/10">
            tap to inspect
          </span>
        </div>
      </Sticker>

      
    </>
  )
}
