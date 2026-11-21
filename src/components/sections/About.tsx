"use client"

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { useRef, type ComponentType, type ReactNode } from "react"
import { Mail } from "lucide-react"
import ScrollMaskCard from "../common/ScrollMaskCard"
import AboutFloatingItems from "../common/AboutFloatingItems"

/* =====================================================
   BRAND ICONS (feather / lucide standard SVG paths)
====================================================== */

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

/* =====================================================
   CONTENT (edit here — no need to touch the JSX)
====================================================== */

interface SocialItem {
  label: string
  href: string
  Icon: ComponentType<{ className?: string }>
}

const PROFILE: {
  name: string
  role: string
  year: string
  status: string
  location: string
  availability: string
  connectLabel: string
  connectNote: string
  image: string
  eyebrow: string
  headline: string
  bio: string
  focus: string[]
  socials: SocialItem[]
} = {
  name: "Nabath Nuur",
  role: "IT Student",
  year: "2026",
  status: "Active",
  location: "Indonesia",
  availability: "Open to internships & collaborations",
  connectLabel: "Let's connect",
  connectNote: "Reply within 24 hours, usually faster.",
  // Public image link (Supabase Storage / external hosting)
  image:
    "https://dgapjusikgybitsessku.supabase.co/storage/v1/object/public/projects/nabati.JPG",
  eyebrow: "Hello, I'm",
  headline: "Building thoughtful things for the web.",
  bio: "An IT student who enjoys turning ideas into clean, fast and accessible interfaces — from the first sketch to the last pixel of polish.",
  focus: ["Frontend", "UI Motion", "Web Performance", "Databases"],
  socials: [
    { label: "GitHub", href: "https://github.com/username", Icon: GithubIcon },
    { label: "Instagram", href: "https://instagram.com/username", Icon: InstagramIcon },
    { label: "LinkedIn", href: "https://linkedin.com/in/username", Icon: LinkedinIcon },
    { label: "Email", href: "mailto:you@email.com", Icon: Mail },
  ],
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
   SIDE REVEAL (scrubbed horizontal slide + fade)
====================================================== */

interface SideRevealProps {
  progress: MotionValue<number>
  range: [number, number]
  from?: number
  className?: string
  children: ReactNode
}

function SideReveal({
  progress,
  range,
  from = 0,
  className,
  children,
}: SideRevealProps) {
  const opacity = useTransform(progress, range, [0, 1])
  const x = useTransform(progress, range, [from, 0])

  return (
    <motion.div style={{ opacity, x }} className={className}>
      {children}
    </motion.div>
  )
}

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

  // Mini header, background text, and floating items fade out as the card expands from center
  const introOpacity = useTransform(progress, [0.22, 0.38], [1, 0])

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
      <div ref={trackRef} className="relative z-10 h-[290vh]">
        <div className="sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden">
          {/* BACKGROUND EDITORIAL HEADLINE */}
          <motion.div
            style={{ opacity: introOpacity }}
            className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center select-none px-6"
            aria-hidden="true"
          >
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-5 md:gap-7 text-center font-bold tracking-tight text-white text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] 2xl:text-[8rem]">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                <span>Everything</span>
                <div className="w-80 bg-white h-20 rounded-full" />
                <span>You</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                <span>Need</span>
                <div className="w-90 bg-white h-20 rounded-full" />
                <span>To</span>
                <span>Build</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                <span>Digital</span>
                <div className="w-20 bg-white h-20 rounded-full" />
                <span>Experiences</span>
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
            cardWidth={330}
            cardHeight={475}
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
            {/* Fullscreen content, revealed progressively (split 3-column layout) */}
            <div className="relative mx-auto flex h-full min-h-dvh w-full max-w-[1600px] flex-col justify-end gap-6 px-6 pt-20 pb-10 sm:pb-12 md:px-8 lg:grid lg:min-h-0 lg:grid-cols-[1fr_minmax(280px,32%)_1fr] lg:items-center lg:gap-12 lg:px-16 lg:py-16">
              {/* ============ KIRI: identitas ============ */}
              <div className="flex flex-col gap-4 text-center sm:gap-5 lg:items-start lg:text-left">
                <SideReveal
                  progress={progress}
                  range={[0.48, 0.58]}
                  from={-48}
                  className="flex items-center justify-center gap-3 lg:justify-start"
                >
                  <span className="h-px w-8 bg-white/40" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#88C0D0]">
                    {PROFILE.eyebrow}
                  </span>
                </SideReveal>

                <SideReveal progress={progress} range={[0.54, 0.66]} from={-64}>
                  <p className="text-3xl font-bold leading-[1.02] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)] sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl">
                    {PROFILE.name}
                  </p>
                  <p className="mt-2.5 text-base font-medium text-[#88C0D0] drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)] sm:text-xl lg:max-w-md lg:text-xl xl:text-2xl">
                    {PROFILE.headline}
                  </p>
                </SideReveal>

                <SideReveal progress={progress} range={[0.6, 0.72]} from={-48}>
                  <p className="mx-auto line-clamp-3 max-w-md text-xs leading-relaxed text-white/80 drop-shadow-[0_1px_12px_rgba(0,0,0,0.6)] sm:text-sm lg:mx-0 lg:line-clamp-none lg:text-base">
                    {PROFILE.bio}
                  </p>
                </SideReveal>

                <SideReveal
                  progress={progress}
                  range={[0.66, 0.78]}
                  from={-32}
                  className="hidden items-center gap-3 text-[10px] font-medium uppercase tracking-[0.25em] text-white/55 lg:flex"
                >
                  <span>{PROFILE.role}</span>
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <span>{PROFILE.location}</span>
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <span>{PROFILE.year}</span>
                </SideReveal>
              </div>

              {/* ============ TENGAH: ruang wajah ============ */}
              <div aria-hidden="true" className="pointer-events-none hidden lg:block" />

              {/* ============ KANAN: kontak ============ */}
              <div className="flex flex-col items-center gap-4 sm:gap-5 lg:items-end lg:text-right">
                <SideReveal
                  progress={progress}
                  range={[0.52, 0.62]}
                  from={48}
                  className="hidden items-center gap-3 sm:flex"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                    {PROFILE.connectLabel}
                  </span>
                  <span className="h-px w-8 bg-white/40" />
                </SideReveal>

                <SideReveal progress={progress} range={[0.58, 0.7]} from={64}>
                  <ul className="flex items-center gap-3 sm:gap-4">
                    {PROFILE.socials.map(({ label, href, Icon }) => (
                      <li key={label}>
                        <a
                          href={href}
                          target={href.startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          aria-label={label}
                          title={label}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white/85 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-[#88C0D0] hover:bg-[#88C0D0] hover:text-[#2E3440] sm:h-12 sm:w-12 lg:h-14 lg:w-14"
                        >
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </SideReveal>

                <SideReveal
                  progress={progress}
                  range={[0.64, 0.76]}
                  from={48}
                  className="flex flex-col items-center gap-2 lg:items-end"
                >
                  <span className="flex items-center gap-2 text-xs font-medium text-white/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.6)] sm:text-sm">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#A3BE8C] opacity-60 motion-safe:animate-ping" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#A3BE8C]" />
                    </span>
                    {PROFILE.availability}
                  </span>
                  <span className="hidden max-w-[16rem] text-xs text-white/55 lg:block">
                    {PROFILE.connectNote}
                  </span>
                </SideReveal>

                <SideReveal
                  progress={progress}
                  range={[0.7, 0.82]}
                  from={32}
                  className="hidden sm:block"
                >
                  <ul className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
                    {PROFILE.focus.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-white/85 backdrop-blur-sm"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </SideReveal>
              </div>
            </div>
          </ScrollMaskCard>
        </div>
      </div>
    </section>
  )
}
