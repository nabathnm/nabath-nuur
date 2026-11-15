"use client"

import CatHeadPointer from "@/components/svg/CatHeadPointer"
import { Code2, Sparkles } from "lucide-react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion"
import { useRef } from "react"
import ScrollMaskCard, { ScrollReveal } from "../common/ScrollMaskCard"
import AboutFloatingItems from "../common/AboutFloatingItems"
import AsciiBackground from "../ui/AsciiBackground"

/* =====================================================
   CONTENT (edit here — no need to touch the JSX)
====================================================== */
const PROFILE = {
  name: "Nabath Nuur",
  role: "IT Student",
  year: "2026",
  status: "Active",
  // Public image link (Supabase Storage / external hosting)
  image:
    "https://dgapjusikgybitsessku.supabase.co/storage/v1/object/public/projects/nabati.JPG",
  eyebrow: "Hello, I'm",
  headline: "Building thoughtful things for the web.",
  bio: "An IT student who enjoys turning ideas into clean, fast and accessible interfaces — from the first sketch to the last pixel of polish.",
  focus: ["Frontend", "UI Motion", "Web Performance", "Databases"],
}

/**
 * Ensures the image URL is a valid public URL.
 * If a Supabase dashboard console URL is pasted, it is converted into
 * a public object URL that an <img> tag can load.
 */
function getDirectImageUrl(url: string): string {
  if (!url) return ""

  const dashboardMatch = url.match(
    /supabase\.com\/dashboard\/project\/([^/]+)\/storage\/files\/buckets\/([^/?#]+).*[?&]preview=([^&]+)/
  )
  if (dashboardMatch) {
    const [, projectRef, bucket, fileName] = dashboardMatch
    return `https://${projectRef}.supabase.co/storage/v1/object/public/${bucket}/${fileName}`
  }

  return url
}

// Resolved once at module level instead of on every render
const PROFILE_IMAGE_URL = getDirectImageUrl(PROFILE.image)

export default function About() {
  const trackRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion() ?? false

  // Progress of the sticky track (0 → 1), smoothed with a spring
  // (the spring is skipped when the user prefers reduced motion).
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  })
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })
  const progress = reduce ? scrollYProgress : springProgress

  // Mini header, background text, and floating items fade out as the card expands
  const introOpacity = useTransform(progress, [0, 0.25], [1, 0])

  return (
    // overflow-x-clip (not overflow-hidden) keeps `position: sticky` working
    // while still preventing horizontal overflow.
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative overflow-x-clip bg-transparent text-white"
    >
      {/* The background text is decorative (aria-hidden), so expose a real heading */}
      <h2 id="about-heading" className="sr-only">
        About me — {PROFILE.name}
      </h2>

      {/* SCROLL TRACK (sticky stage + scroll-driven card) */}
      <div ref={trackRef} className="relative z-10 h-[260vh]">
        <div className="sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden">
          {/* ASCII BACKGROUND (shadcn-style interactive matrix) */}
          <AsciiBackground className="z-0" opacity={0.2} />

          {/* BACKGROUND EDITORIAL HEADLINE */}
          <motion.div
            style={{ opacity: introOpacity }}
            className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center select-none px-6"
            aria-hidden="true"
          >
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-5 md:gap-7 text-center font-bold tracking-tight text-white/[0.08] text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] 2xl:text-[7.5rem] leading-none">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                <span>Everything</span>
                <CatHeadPointer className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 opacity-30 drop-shadow-[0_2px_12px_rgba(136,192,208,0.3)]" />
                <span>You</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                <span>Need</span>
                <Sparkles className="h-7 w-7 sm:h-10 sm:w-10 lg:h-14 lg:w-14 text-[#EBCB8B] opacity-35" />
                <span>To</span>
                <span>Build</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                <span>Digital</span>
                <Code2 className="h-7 w-7 sm:h-10 sm:w-10 lg:h-14 lg:w-14 text-[#A3BE8C] opacity-35" />
                <span className="relative inline-block rounded-2xl border border-[#A3BE8C]/30 bg-[#A3BE8C]/15 px-3 py-0.5 sm:px-5 sm:py-1 text-[#A3BE8C] opacity-70">
                  Experiences
                </span>
              </div>
            </div>
          </motion.div>

          {/* FLOATING COMPONENTS (Ref: Umi Landing Page Floating Constellation) */}
          <AboutFloatingItems introOpacity={introOpacity} />
          

          {/* MAIN PROFILE CARD → scroll-driven fullscreen mask */}
          <ScrollMaskCard
            progress={progress}
            imageSrc={PROFILE_IMAGE_URL}
            imageAlt={PROFILE.name}
            idleContent={
              <div className="relative z-10 flex h-full flex-col justify-between p-6">
                {/* Top: status */}
                <div className="flex items-center">
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#A3BE8C] opacity-60 motion-safe:animate-ping" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#A3BE8C]" />
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-white/45">
                      {PROFILE.status}
                    </span>
                  </span>
                </div>

                {/* Bottom: name + meta */}
                <div>
                  <h3 className="text-xl font-medium text-white/90">
                    {PROFILE.name}.
                  </h3>

                  <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                      {PROFILE.role}
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                      {PROFILE.year}
                    </span>
                  </div>
                </div>
              </div>
            }
          >
            {/* Fullscreen content, revealed progressively (staggered) */}
            <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
              <ScrollReveal
                progress={progress}
                range={[0.4, 0.5]}
                className="mb-5 flex items-center gap-3"
              >
                <span className="h-px w-8 bg-white/40" />
                <span className="text-[11px] uppercase tracking-[0.3em] text-white/70">
                  {PROFILE.eyebrow}
                </span>
                <span className="h-px w-8 bg-white/40" />
              </ScrollReveal>

              <ScrollReveal progress={progress} range={[0.46, 0.58]} className="mb-5">
                <p className="text-4xl font-bold leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-7xl">
                  {PROFILE.name}
                </p>
                <p className="mt-3 text-lg font-medium text-[#88C0D0] sm:text-xl lg:text-2xl">
                  {PROFILE.headline}
                </p>
              </ScrollReveal>

              <ScrollReveal progress={progress} range={[0.54, 0.66]} className="mb-8">
                <p className="max-w-xl text-sm leading-relaxed text-white/80 drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)] sm:text-base lg:text-lg">
                  {PROFILE.bio}
                </p>
              </ScrollReveal>

              <ScrollReveal progress={progress} range={[0.62, 0.74]}>
                <ul className="flex flex-wrap items-center justify-center gap-2">
                  {PROFILE.focus.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-white/85 backdrop-blur-sm"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </ScrollMaskCard>
        </div>
      </div>
    </section>
  )
}