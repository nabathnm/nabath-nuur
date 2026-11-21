"use client"

import { useLenis } from "@/lib/lenis"
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion"
import { useEffect, useRef } from "react"
import Snap from "lenis/snap"
import { useProjects } from "../../hooks/useProjects"
import Glass from "../ui/glass"
import TextRoll from "../ui/text-roll"

/* =====================================================
   TYPES & HELPERS
====================================================== */

// Diturunkan dari hook supaya selalu sinkron dengan tipe project yang ada.
type Project = ReturnType<typeof useProjects>["projects"][number]

const MAX_FEATURES = 4

/** Ambient glow and shadow palettes mirroring Divider Cards aesthetic */
const PROJECT_GLOW_THEMES = [
  {
    border: "border-white/15 hover:border-[#88C0D0]/40",
    shadow:
      "shadow-[0_24px_50px_rgba(0,0,0,0.45),0_0_35px_rgba(136,192,208,0.08)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.55),0_0_45px_rgba(136,192,208,0.22)]",
    orb: "bg-[#88C0D0]/20",
    backglow: "from-[#88C0D0]/12 via-transparent to-[#5E81AC]/10",
    accent: "#88C0D0",
  },
  {
    border: "border-white/15 hover:border-[#A3BE8C]/40",
    shadow:
      "shadow-[0_24px_50px_rgba(0,0,0,0.45),0_0_35px_rgba(163,190,140,0.08)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.55),0_0_45px_rgba(163,190,140,0.22)]",
    orb: "bg-[#A3BE8C]/20",
    backglow: "from-[#A3BE8C]/12 via-transparent to-[#8FBCBB]/10",
    accent: "#A3BE8C",
  },
  {
    border: "border-white/15 hover:border-[#EBCB8B]/40",
    shadow:
      "shadow-[0_24px_50px_rgba(0,0,0,0.45),0_0_35px_rgba(235,203,139,0.08)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.55),0_0_45px_rgba(235,203,139,0.22)]",
    orb: "bg-[#EBCB8B]/20",
    backglow: "from-[#EBCB8B]/12 via-transparent to-[#D08770]/10",
    accent: "#EBCB8B",
  },
  {
    border: "border-white/15 hover:border-[#81A1C1]/40",
    shadow:
      "shadow-[0_24px_50px_rgba(0,0,0,0.45),0_0_35px_rgba(129,161,193,0.08)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.55),0_0_45px_rgba(129,161,193,0.22)]",
    orb: "bg-[#81A1C1]/20",
    backglow: "from-[#81A1C1]/12 via-transparent to-[#5E81AC]/10",
    accent: "#81A1C1",
  },
]

/**
 * Mengatur kapan image reveal & scale selesai.
 *
 * "start end"  = bagian atas project mulai memasuki viewport dari bawah.
 * "start 60%"  = bagian atas project mencapai 60% tinggi viewport (responsif & cepat selesai).
 *
 * Angka lebih besar membuat reveal selesai lebih cepat.
 * Angka lebih kecil membuat reveal berlangsung lebih lama.
 */
const IMAGE_REVEAL_OFFSET = "60%"

const pad = (n: number) => String(n).padStart(2, "0")

/* =====================================================
   GENTLE / LOW-PROXIMITY SNAP CONFIGURATION
   Jangkauan rendah (12%) agar tidak mengganggu scrolling alami user
====================================================== */
const PROJECT_SNAP_CONFIG = {
  // Durasi lebih singkat agar tidak menahan scroll lama-lama
  duration: 0.7,
  // Easing quartic ease-out yang lembut
  easing: (t: number) => 1 - Math.pow(1 - t, 4),
  // Debounce lebih santai agar user leluasa scroll tanpa langsung ter-snap
  debounce: 300,
  // Jangkauan rendah: hanya snap jika scroll berhenti dalam rentang 12% dari target
  distanceThreshold: "12%" as const,
}

/* =====================================================
   PROJECTS HEADER (Bouncing Text)
====================================================== */

function ProjectsHeader({ count }: { count: number }) {
  return (
    <div className="relative z-10 mb-12 md:mb-16">
      {/* Small header — tidak diubah */}
      <div className="relative z-10 mx-auto mb-8 flex w-full max-w-[1600px] items-center justify-between px-6 md:px-8 lg:px-16">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-white/30" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">
            Projects
          </span>
        </div>

        <span className="text-[10px] uppercase tracking-[0.3em] text-white/25">
          ({pad(count)}) Selected
        </span>
      </div>

      {/* Main Title (TextRoll - 3D Huruf Timbul) */}
      <div className="relative mx-auto flex w-full max-w-[1600px] justify-center px-6 pt-8 md:px-8 md:pt-10 lg:px-16">
        {/* Glow aura halus di belakang judul */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[130%] w-[90%] max-w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#88C0D0]/15 via-[#81A1C1]/25 to-[#88C0D0]/15 blur-3xl"
        />

        <h2 className="text-balance text-center text-[clamp(2.5rem,9.5vw,11rem)] font-black leading-[1.0] tracking-tight drop-shadow-[0_2px_0_rgba(255,255,255,0.45)] drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)] drop-shadow-[0_16px_36px_rgba(0,0,0,0.8)] drop-shadow-[0_0_45px_rgba(136,192,208,0.3)]">
          <TextRoll>Selected Project</TextRoll>
        </h2>
      </div>

      {/* Divider: tetap tegas, tapi memudar di ujung dan ada titik aksen di tengah */}
      <div className="relative mx-auto mt-8 w-full max-w-[1600px] px-6 md:mt-10 md:px-8 lg:px-16">
        <div className="h-[3px] w-full rounded-full bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#88C0D0] shadow-[0_0_12px_#88C0D0]"
        />
      </div>

      {/* Subtitle */}
      <div className="mx-auto mt-6 flex w-full max-w-[1600px] items-center justify-center px-6 text-center md:mt-8 md:px-8 lg:px-16">
        <p className="max-w-4xl text-balance text-[clamp(1rem,2.4vw,2.15rem)] font-semibold leading-snug tracking-wide text-white/70 2xl:max-w-none 2xl:whitespace-nowrap">
          A selection of projects I&apos;ve built while exploring{" "}
          <span className="text-[#88C0D0]">software engineering</span>.
        </p>
      </div>
    </div>
  )
}

/* =====================================================
   PROJECT PANEL
====================================================== */

interface ProjectPanelProps {
  project: Project
  index: number
  total: number
  reduce: boolean
}

function ProjectPanel({
  project,
  index,
  total: _total,
  reduce,
}: ProjectPanelProps) {
  const ref = useRef<HTMLElement>(null)

  const imageLeft = index % 2 === 0
  const motionOn = !reduce

  const { scrollYProgress: enterRaw } = useScroll({
    target: ref,
    offset: ["start end", `start ${IMAGE_REVEAL_OFFSET}`],
  })

  const { scrollYProgress: full } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  /* ---------- IMAGE MASK REVEAL & SCALE (INSTANT / NO-DELAY) ---------- */
  const insetY = useTransform(enterRaw, [0, 1], [16, 0])
  const insetX = useTransform(enterRaw, [0, 1], [10, 0])
  const radius = useTransform(enterRaw, [0, 1], [100, 32])
  const cardScale = useTransform(enterRaw, [0, 1], [0.93, 1])
  const imageScale = useTransform(enterRaw, [0, 1], [1.10, 1])

  const clipPath = useMotionTemplate`inset(${insetY}% ${insetX}% round ${radius}px)`

  /* ---------- PARALLAX ---------- */

  const imageY = useTransform(full, [0, 1], ["-7%", "7%"])
  const numberY = useTransform(full, [0, 1], ["12%", "-12%"])

  /* ---------- TEXT REVEAL ---------- */

  const titleOpacity = useTransform(enterRaw, [0.25, 0.75], [0, 1])
  const titleY = useTransform(enterRaw, [0.25, 0.75], [40, 0])

  /* ---------- PROJECT DATA ---------- */

  const theme = PROJECT_GLOW_THEMES[index % PROJECT_GLOW_THEMES.length]
  const features = (project.features ?? []).slice(0, MAX_FEATURES)
  const techStack = project.techStack ?? []

  const sideImage = imageLeft ? "lg:left-0" : "lg:right-0"
  const sideText = imageLeft ? "lg:right-0" : "lg:left-0"

  return (
    <article
      ref={ref}
      aria-label={project.title ?? `Project ${index + 1}`}
      className="relative scroll-mt-20 md:scroll-mt-24 lg:scroll-mt-24"
    >
      {/* Target anchor snap presisi di bawah floating navbar */}
      <div
        data-project-snap
        className="pointer-events-none absolute -top-16 md:-top-20 lg:-top-24 inset-x-0 h-px"
      />

      <div className="mx-auto flex w-full max-w-[1600px] flex-col justify-center px-6 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
        <div className="relative flex flex-col gap-6 lg:block lg:min-h-[72dvh]">
          {/* Outlined index */}

          <motion.span
            aria-hidden="true"
            style={motionOn ? { y: numberY } : undefined}
            className={`pointer-events-none absolute -top-6 z-0 hidden select-none text-[clamp(8rem,20vw,20rem)] font-semibold leading-none text-transparent lg:block ${sideText}`}
          >
            <span
              style={{
                WebkitTextStroke: "2px rgba(255,255,255,0.07)",
              }}
            >
              {pad(index + 1)}
            </span>
          </motion.span>

          {/* Title block */}

          <motion.div
            style={
              motionOn
                ? {
                    opacity: titleOpacity,
                    y: titleY,
                  }
                : undefined
            }
            className={`relative z-30 lg:absolute lg:top-0 lg:w-[48%] ${sideText}`}
          >

            <h3 className="pt-6 wrap-break-word text-[clamp(2.5rem,6.2vw,10rem)] font-bold font-accent leading-[0.92] tracking-[0.04em] text-primary [text-shadow:0_2px_40px_rgba(46,52,64,0.55)]">
              {project.title}
            </h3>
          </motion.div>

          {/* Subtle Ambient Back-Glow (Ref: Divider Card aesthetic) */}
          <div
            className={`pointer-events-none absolute z-0 rounded-[2.5rem] bg-gradient-to-br ${theme.backglow} blur-3xl opacity-60 transition-opacity duration-500 hidden sm:block lg:bottom-6 lg:h-[92%] lg:w-[70%] ${sideImage}`}
          />

          <motion.div
            style={motionOn ? { clipPath, scale: cardScale } : undefined}
            className={`group/card relative z-10 aspect-[4/5] w-full overflow-hidden rounded-[2rem] border ${theme.border} bg-gradient-to-br from-[#3B4252] to-[#2E3440] ${theme.shadow} transition-[border-color,box-shadow] duration-500 sm:aspect-[16/10] lg:absolute lg:bottom-10 lg:aspect-auto lg:h-[88%] lg:w-[68%] ${sideImage}`}
          >
            {/* Ambient Corner Glow Orbs inside card */}
            <div
              className={`pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full ${theme.orb} blur-3xl transition-opacity duration-500 group-hover/card:opacity-100 opacity-60 z-20`}
            />
            <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-white/5 blur-2xl z-20" />

            {project.imageUrl ? (
              <motion.img
                src={project.imageUrl}
                alt={project.title ?? "Project"}
                loading="lazy"
                draggable={false}
                style={
                  motionOn
                    ? {
                        y: imageY,
                        scale: imageScale,
                      }
                    : undefined
                }
                className="absolute inset-x-0 -top-[8%] h-[116%] w-full object-cover will-change-transform"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-sm text-white/25">
                  No project image
                </span>
              </div>
            )}

            {/* Nord shade */}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2E3440]/70 via-[#2E3440]/10 to-[#2E3440]/30 z-10" />
          </motion.div>

          {/* Glass info panel */}

          <div
            className={`relative z-20 lg:absolute lg:bottom-[12%] lg:w-[40%] ${sideText}`}
          >
            <div
              className={`group/info relative overflow-hidden rounded-[2rem] border ${theme.border} bg-white/[0.04] p-6 ${theme.shadow} backdrop-blur-xl transition-all duration-500 md:p-8 lg:max-h-[56dvh]`}
            >
              <Glass rounded="rounded-[2rem]" />

              {/* Top-corner subtle glow orb */}
              <div
                className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full ${theme.orb} blur-2xl transition-opacity duration-500 group-hover/info:opacity-100 opacity-50 z-0`}
              />

              <div className="relative z-10 flex flex-col gap-6">
                {/* Description */}

                {project.description && (
                  <p className="text-sm leading-relaxed text-white/60 lg:line-clamp-5">
                    {project.description}
                  </p>
                )}

                {/* Features */}

                {features.length > 0 && (
                  <ul className="space-y-2.5 border-t border-white/10 pt-5">
                    {features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-[13px] leading-relaxed text-white/55"
                      >
                        <span
                          className="shrink-0 select-none text-[11px] leading-relaxed"
                          style={{
                            color: theme.accent,
                            opacity: 0.9,
                          }}
                          aria-hidden="true"
                        >
                          ✦
                        </span>

                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Tech stack */}

                {techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 border-t border-white/10 pt-5">
                    {techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-colors px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/45 hover:text-white/70"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

/* =====================================================
   PROJECT LIST
====================================================== */

function ProjectList({
  projects,
  reduce,
}: {
  projects: Project[]
  reduce: boolean
}) {
  return (
    <div className="relative z-10 px-2 md:px-16">
      {projects.map((project, index) => (
        <ProjectPanel
          key={project.id}
          project={project}
          index={index}
          total={projects.length}
          reduce={reduce}
        />
      ))}
    </div>
  )
}

/* =====================================================
   PROJECTS SECTION
====================================================== */

export default function Projects() {
  const { projects, loading, error } = useProjects(3)
  const reduce = useReducedMotion() ?? false
  const lenis = useLenis()

  // Inisialisasi snap dengan jangkauan rendah (subtle proximity snap)
  useEffect(() => {
    if (!lenis || reduce || projects.length === 0) return

    const snap = new Snap(lenis, {
      type: "proximity",
      distanceThreshold: PROJECT_SNAP_CONFIG.distanceThreshold,
      duration: PROJECT_SNAP_CONFIG.duration,
      easing: PROJECT_SNAP_CONFIG.easing,
      debounce: PROJECT_SNAP_CONFIG.debounce,
    })

    const section = document.getElementById("projects")
    if (section) {
      const snapPoints = section.querySelectorAll<HTMLElement>("[data-project-snap]")
      if (snapPoints.length > 0) {
        snap.addElements(Array.from(snapPoints), { align: "start" })
      }
    }

    return () => {
      snap.destroy()
    }
  }, [lenis, reduce, projects])

  if (loading) {
    return (
      <section
        id="projects"
        className="flex min-h-[500px] items-center justify-center bg-transparent text-white"
      >
        <p className="text-white/40">Loading projects...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section
        id="projects"
        className="flex min-h-[500px] items-center justify-center bg-transparent text-white"
      >
        <p className="text-red-300/70">
          Failed to load projects.
        </p>
      </section>
    )
  }

  if (projects.length === 0) {
    return (
      <section
        id="projects"
        className="flex min-h-[500px] items-center justify-center bg-transparent text-white"
      >
        <p className="text-white/40">
          No projects found.
        </p>
      </section>
    )
  }

  return (
    <section
      id="projects"
      className="relative overflow-x-clip bg-transparent pt-24 text-white md:pt-10"
    >
      <ProjectsHeader count={projects.length} />

      <ProjectList
        projects={projects}
        reduce={reduce}
      />
    </section>
  )
}