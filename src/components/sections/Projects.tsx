"use client"

import { useLenis } from "@/lib/lenis"
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
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

const ACCENT = "#88C0D0"
const MAX_FEATURES = 4

/**
 * Mengatur kapan image reveal selesai.
 *
 * "start end"  = bagian atas project mulai memasuki viewport dari bawah.
 * "start 55%"  = bagian atas project mencapai 55% tinggi viewport.
 *
 * Angka lebih besar membuat reveal selesai lebih cepat.
 * Angka lebih kecil membuat reveal berlangsung lebih lama.
 */
const IMAGE_REVEAL_OFFSET = "10%"

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
      {/* Small header */}
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

      {/* Main Title (Bouncing Text) */}
      <div className="mx-auto flex w-full max-w-[1600px] items-center px-6 md:px-8 lg:px-12 pt-10">
        <h2 className="flex flex-wrap items-center gap-x-4 gap-y-2 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-[12rem]">
          <span className="text-white/90">
            <TextRoll>Selected Project</TextRoll>
          </span>
        </h2>
      </div>
      {/* Divider */}
      <div className="w-full border-b-4 border-white mt-10 max-w-[1500px] mx-auto flex rounded-full" />

      {/* Subtitle */}
      <div className="mx-auto mt-6 flex w-full max-w-[1500px] items-center justify-center px-2 md:px-4 text-center">
        <p className="w-full text-center text-sm leading-relaxed text-white/70 sm:text-base md:text-[2.4rem] font-bold tracking-wider">
          A selection of projects I've built while exploring software engineering.
        </p>
      </div>
    </div>
  );
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

  const enter = useSpring(enterRaw, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  /* ---------- IMAGE MASK REVEAL ---------- */
  const insetY = useTransform(enter, [0, 1], [16, 0])
  const insetX = useTransform(enter, [0, 1], [10, 0])
  const radius = useTransform(enter, [0, 1], [100, 32])

  const clipPath = useMotionTemplate`inset(${insetY}% ${insetX}% round ${radius}px)`
  /* ---------- PARALLAX ---------- */

  const imageY = useTransform(full, [0, 1], ["-7%", "7%"])
  const numberY = useTransform(full, [0, 1], ["12%", "-12%"])

  /* ---------- TEXT REVEAL ---------- */

  const titleOpacity = useTransform(enter, [0.25, 0.75], [0, 1])
  const titleY = useTransform(enter, [0.25, 0.75], [40, 0])

  /* ---------- PROJECT DATA ---------- */

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


          <motion.div
            style={motionOn ? { clipPath } : undefined}
            className={`relative z-10 aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#3B4252] to-[#2E3440] sm:aspect-[16/10] lg:absolute lg:bottom-10 lg:aspect-auto lg:h-[88%] lg:w-[68%] ${sideImage}`}
          >
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

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2E3440]/70 via-[#2E3440]/10 to-[#2E3440]/30" />
          </motion.div>

          {/* Glass info panel */}

          <div
            className={`relative z-20 lg:absolute lg:bottom-[12%] lg:w-[40%] ${sideText}`}
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-2xl backdrop-blur-xl md:p-8 lg:max-h-[56dvh]">
              <Glass rounded="rounded-[2rem]" />

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
                            color: ACCENT,
                            opacity: 0.85,
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
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/45"
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