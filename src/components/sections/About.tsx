"use client"

import CatHeadPointer from "@/components/svg/CatHeadPointer"
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion"
import { useEffect, useRef } from "react"
import ScrollMaskCard, { ScrollReveal } from "../common/ScrollMaskCard"

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

/* =====================================================
   MARQUEE SETTINGS (matches the Project section title style)
====================================================== */
const BASE_SPEED = 70 // px/s, automatic drift (to the left)
const VELOCITY_GAIN = 0.35 // how strongly scroll velocity affects the marquee
const MAX_VELOCITY = 4000 // velocity clamp
const MAX_SKEW = 8 // max dynamic skew (deg)
const MARQUEE_COPIES = 5

export default function About() {
  const trackRef = useRef<HTMLDivElement>(null)
  const firstGroupRef = useRef<HTMLDivElement>(null)
  const groupWidthRef = useRef(0)

  const reduce = useReducedMotion() ?? false
  const inView = useInView(trackRef, { margin: "200px 0px" })

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

  // Page scroll velocity → marquee acceleration & dynamic skew
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  })

  // Horizontal marquee position (seamless loop)
  const x = useMotionValue(0)

  const skewX = useTransform(
    smoothVelocity,
    [-3000, 0, 3000],
    [MAX_SKEW, 0, -MAX_SKEW]
  )

  // Measure one marquee group for a seamless loop
  useEffect(() => {
    const element = firstGroupRef.current
    if (!element) return

    const update = (width?: number) => {
      groupWidthRef.current = width ?? element.offsetWidth
    }

    update()

    const observer = new ResizeObserver((entries) => {
      update(entries[0]?.borderBoxSize?.[0]?.inlineSize)
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Continuous drift + scroll-velocity response (paused when off-screen)
  useAnimationFrame((_, delta) => {
    const width = groupWidthRef.current
    if (reduce || !inView || width <= 0) return

    const dt = Math.min(delta, 64) / 1000
    const v = Math.max(
      -MAX_VELOCITY,
      Math.min(MAX_VELOCITY, smoothVelocity.get())
    )

    const speed = -BASE_SPEED - v * VELOCITY_GAIN
    let next = (x.get() + speed * dt) % width
    if (next > 0) next -= width

    x.set(next)
  })

  const indicatorOpacity = useTransform(progress, [0, 0.12], [1, 0])
  // Marquee + mini header are clearly visible at the start and fade as the card expands
  const introOpacity = useTransform(progress, [0, 0.25], [1, 0])

  return (
    // overflow-x-clip (not overflow-hidden) keeps `position: sticky` working
    // while still preventing horizontal overflow.
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative overflow-x-clip bg-transparent text-white"
    >
      {/* The marquee is decorative (aria-hidden), so expose a real heading */}
      <h2 id="about-heading" className="sr-only">
        About me — {PROFILE.name}
      </h2>

      {/* SCROLL TRACK (sticky stage + scroll-driven card) */}
      <div ref={trackRef} className="relative z-10 h-[260vh]">
        <div className="sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden">
          {/* SECTION MINI HEADER */}
          <motion.div
            style={{ opacity: introOpacity }}
            className="pointer-events-none absolute inset-x-0 top-10 z-20"
          >
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 md:px-8 lg:px-16">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-white/30" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                  About
                </span>
              </div>

              <span className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                (01) Biography
              </span>
            </div>
          </motion.div>

          {/* BACKGROUND MARQUEE */}
          <motion.div
            style={{ opacity: introOpacity }}
            className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center overflow-hidden"
            aria-hidden="true"
          >
            {/* Wrapper: dynamic skew follows scroll velocity */}
            <motion.div
              style={reduce ? undefined : { skewX }}
              className="will-change-transform"
            >
              {/* Track: continuous horizontal translate */}
              <motion.div
                style={{ x: reduce ? 0 : x }}
                className="flex w-max transform-gpu items-center whitespace-nowrap will-change-transform"
              >
                {Array.from({ length: MARQUEE_COPIES }).map((_, index) => (
                  <div
                    key={index}
                    ref={index === 0 ? firstGroupRef : undefined}
                    className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12 lg:gap-16 lg:pr-16"
                  >
                    <span className="text-[clamp(4.5rem,15vw,13rem)] font-bold leading-none tracking-tighter text-white/[0.09]">
                      About
                    </span>

                    <span
                      className="text-[clamp(4.5rem,15vw,13rem)] font-bold leading-none tracking-tighter text-transparent"
                      style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.22)" }}
                    >
                      Me
                    </span>

                    <CatHeadPointer className="h-[clamp(2.5rem,7vw,6.5rem)] w-[clamp(2.5rem,7vw,6.5rem)] shrink-0 opacity-25 drop-shadow-[0_2px_12px_rgba(136,192,208,0.25)]" />
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

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