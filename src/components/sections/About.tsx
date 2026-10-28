"use client"

import { motion, useScroll, useSpring, useTransform, type Variants } from "framer-motion"
import { useRef } from "react"
import {
  ArrowUpRight,
  Smartphone,
  Globe2,
} from "lucide-react"
import ScrollMaskCard, { ScrollReveal } from "../ScrollMaskCard"

// Ganti dengan path foto kamu (mis. di folder /public). Jika file tidak ada,
// card otomatis menampilkan gradient Nord sebagai fallback.
const PROFILE_IMAGE = "/images/profile.jpg"

const floatVariants: Variants = {
  animate: {
    y: [-6, 6, -6],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "Flutter",
  "Dart",
  "REST API",
]

export default function About() {
  const trackRef = useRef<HTMLDivElement>(null)

  // Progress of the sticky scroll track (0 → 1), smoothed with a spring.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  })
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Side content / ambient visuals fade away while the card expands.
  const sideOpacity = useTransform(smoothProgress, [0, 0.18], [1, 0])
  const leftX = useTransform(smoothProgress, [0, 0.18], [0, -48])
  const rightX = useTransform(smoothProgress, [0, 0.18], [0, 48])
  const visualOpacity = useTransform(smoothProgress, [0, 0.3], [1, 0])
  const indicatorOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0])
  const gridPointerEvents = useTransform(
    smoothProgress,
    (v: number): "auto" | "none" => (v > 0.2 ? "none" : "auto")
  )

  /* =====================================================
      SIDE CONTENT (rendered in the sticky stage on lg,
      and as normal blocks around the track on mobile)
  ====================================================== */



  return (
    // NOTE: overflow-x-clip (bukan overflow-hidden) supaya `position: sticky`
    // tetap bekerja sekaligus mencegah horizontal overflow.
    <section
      id="about"
      className="relative overflow-x-clip bg-transparent py-24 text-white scroll-mt-28"
    >
      {/* =====================================================
          AMBIENT BACKGROUND (sticky so it follows the viewport)
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-[100dvh] overflow-hidden">
          {/* Main glow */}
          <div
            className="
              absolute left-1/2 top-1/2
              h-[500px] w-[500px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              bg-white/[0.025]
              blur-[120px]
            "
          />

          {/* Small glow */}
          <div
            className="
              absolute -right-40 top-[20%]
              h-80 w-80
              rounded-full
              bg-[#88C0D0]/[0.02]
              blur-[100px]
            "
          />

          {/* Stars */}
          <div className="absolute left-[8%] top-[18%] h-1 w-1 rounded-full bg-white/25" />
          <div className="absolute left-[18%] top-[65%] h-[3px] w-[3px] rounded-full bg-white/15" />
          <div className="absolute right-[10%] top-[30%] h-1 w-1 rounded-full bg-white/20" />
          <div className="absolute right-[18%] bottom-[20%] h-1.5 w-1.5 rounded-full bg-white/15" />
          <div className="absolute left-[47%] bottom-[12%] h-[3px] w-[3px] rounded-full bg-white/20" />
        </div>
      </div>



      {/* =====================================================
          SCROLL TRACK (sticky stage + scroll-driven card)
      ====================================================== */}

      <div ref={trackRef} className="relative z-10 h-[200vh]">
        <div className="sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden">

          {/* Grid: side columns + orbit/labels (card is rendered separately) */}
          <motion.div
            style={{ pointerEvents: gridPointerEvents }}
            className="relative z-20 mx-auto w-full max-w-7xl px-6 md:px-8"
          >
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr_0.8fr] lg:items-center">

              {/* =================================================
                  LEFT
              ================================================== */}

              <motion.div
                style={{ opacity: sideOpacity, x: leftX }}
                className="hidden lg:block"
              >
              </motion.div>

              {/* =================================================
                  CENTER VISUAL
              ================================================== */}

              <motion.div
                style={{ opacity: visualOpacity }}
                className="relative"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className="relative flex min-h-[540px] items-center justify-center"
                >
                  {/* Orbit */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 35,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="
                      absolute
                      h-[330px] w-[330px]
                      rounded-full
                      border border-white/[0.055]
                    "
                  >
                    {/* Orbit dot */}
                    <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white/25" />
                  </motion.div>

                  <div
                    className="
                      absolute
                      h-[440px] w-[440px]
                      rounded-full
                      border border-white/[0.035]
                    "
                  />

                  {/* Vertical line */}
                  <div className="absolute h-[500px] w-px bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />

                  {/* Floating left label */}
                  <motion.div
                    variants={floatVariants}
                    animate="animate"
                    className="
                      absolute left-[2%] top-[28%]
                      z-30
                      rounded-2xl
                      border border-white/10
                      bg-white/[0.035]
                      px-4 py-3
                      backdrop-blur-xl
                    "
                  >
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-3.5 w-3.5 text-white/30" />

                      <span className="text-[10px] text-white/40">
                        Web
                      </span>
                    </div>
                  </motion.div>

                  {/* Floating right label */}
                  <motion.div
                    variants={floatVariants}
                    animate="animate"
                    className="
                      absolute right-[2%] bottom-[25%]
                      z-30
                      rounded-2xl
                      border border-white/10
                      bg-white/[0.035]
                      px-4 py-3
                      backdrop-blur-xl
                    "
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-3.5 w-3.5 text-white/30" />

                      <span className="text-[10px] text-white/40">
                        Mobile
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* =================================================
                  RIGHT
              ================================================== */}

              <motion.div
                style={{ opacity: sideOpacity, x: rightX }}
                className="hidden lg:block"
              >
              </motion.div>
            </div>
          </motion.div>

          {/* =================================================
              MAIN PROFILE CARD → scroll-driven fullscreen mask
          ================================================== */}

          <ScrollMaskCard
            progress={smoothProgress}
            imageSrc={PROFILE_IMAGE}
            imageAlt="Nabath Nuur"
            idleContent={
              <div className="relative z-10 flex h-full flex-col justify-between p-6">

                {/* Top */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#A3BE8C]" />

                    <span className="text-[9px] uppercase tracking-wider text-white/35">
                      Active
                    </span>
                  </span>
                </div>

                {/* Bottom */}
                <div>

                  <h3 className="mt-2 text-xl font-medium text-white/85">
                    Nabath Nuur.
                  </h3>

                  <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                      IT Student
                    </span>

                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                      2026
                    </span>
                  </div>
                </div>
              </div>
            }
          >
            {/* Fullscreen content, revealed progressively */}
            <div className="flex flex-col items-center text-center">
              <ScrollReveal
                progress={smoothProgress}
                range={[0.38, 0.52]}
                className="mb-6 flex items-center gap-3"
              >
                <span className="h-px w-8 bg-white/30" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                  About Me
                </span>
                <span className="h-px w-8 bg-white/30" />
              </ScrollReveal>

              <ScrollReveal progress={smoothProgress} range={[0.45, 0.62]}>
                <h2 className="text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl md:text-8xl">
                  More than
                  <br />
                  <span className="text-white/40">just code.</span>
                </h2>
              </ScrollReveal>

              <ScrollReveal
                progress={smoothProgress}
                range={[0.55, 0.72]}
                className="mt-8 max-w-xl"
              >
                <p className="text-sm leading-7 text-white/70 md:text-base">
                  Hi! I'm Nabath Nuur, an Information Technology
                  student at the Faculty of Computer Science,
                  Brawijaya University.
                </p>

                <p className="mt-4 text-sm leading-7 text-white/50 md:text-base">
                  I enjoy building interfaces that are simple,
                  functional, and enjoyable to use — with a focus on
                  web development, mobile applications, and software
                  engineering.
                </p>
              </ScrollReveal>

            </div>
          </ScrollMaskCard>

          {/* Scroll indicator */}
          <motion.div
            style={{ opacity: indicatorOpacity }}
            className="pointer-events-none absolute bottom-8 left-0 right-0 z-20 text-center text-[9px] uppercase tracking-[0.3em] text-white/40"
          >
            Scroll to explore
          </motion.div>
        </div>
      </div>
    </section>
  )
}