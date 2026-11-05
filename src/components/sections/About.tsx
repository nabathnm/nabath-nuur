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

/**
 * Helper untuk memastikan URL gambar publik yang valid.
 * Jika pengguna memasukkan URL dashboard console Supabase, fungsi ini
 * otomatis mengubahnya menjadi public object URL yang bisa diakses tag <img>.
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

// Link foto profil publik langsung dari Supabase Storage / hosting eksternal
const PROFILE_IMAGE =
  "https://dgapjusikgybitsessku.supabase.co/storage/v1/object/public/projects/nabati.JPG"

// Pengaturan animasi background marquee (mengikuti gaya title Project)
const BASE_SPEED = 70 // px/detik, kecepatan pergeseran otomatis (ke kiri)
const VELOCITY_GAIN = 0.35 // pengaruh kecepatan scroll terhadap pergeseran marquee
const MAX_VELOCITY = 4000 // batas atas velocity
const MAX_SKEW = 8 // derajat kemiringan dinamis

export default function About() {
  const trackRef = useRef<HTMLDivElement>(null)
  const firstGroupRef = useRef<HTMLDivElement>(null)
  const groupWidthRef = useRef(0)

  const reduce = useReducedMotion() ?? false
  const inView = useInView(trackRef, { margin: "200px 0px" })

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

  // Velocity scroll untuk akselerasi marquee & dynamic skew
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  })

  // Posisi horizontal marquee (looping seamless)
  const x = useMotionValue(0)

  // Skew halus mengikuti scroll velocity
  const skewX = useTransform(
    smoothVelocity,
    [-3000, 0, 3000],
    [MAX_SKEW, 0, -MAX_SKEW]
  )

  // Ukur lebar satu grup untuk loop seamless
  useEffect(() => {
    const element = firstGroupRef.current
    if (!element) return

    const update = (width?: number) => {
      groupWidthRef.current = width ?? element.offsetWidth
    }

    update()

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      update(entry?.borderBoxSize?.[0]?.inlineSize)
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Animasi pergeseran teks kontinu + responsif terhadap scroll velocity
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

  const indicatorOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0])
  // Marquee background terlihat jelas di posisi awal dan memudar saat card expand
  const bgMarqueeOpacity = useTransform(smoothProgress, [0, 0.25], [1, 0])

  /* =====================================================
      SIDE CONTENT (rendered in the sticky stage on lg,
      and as normal blocks around the track on mobile)
  ====================================================== */



  return (
    // NOTE: overflow-x-clip (bukan overflow-hidden) supaya `position: sticky`
    // tetap bekerja sekaligus mencegah horizontal overflow.
    <section
      id="about"
      className="relative overflow-x-clip bg-transparent py-24 text-white"
    >
      {/* =====================================================
          SCROLL TRACK (sticky stage + scroll-driven card)
      ====================================================== */}

      <div ref={trackRef} className="relative z-10 h-[200vh]">
        <div className="sticky -top-20 flex h-dvh w-full items-center justify-center overflow-hidden">
          {/* =====================================================
              SECTION MINI HEADER (Consistent with Projects & Tools)
          ====================================================== */}
          <motion.div
            style={{ opacity: bgMarqueeOpacity }}
            className="pointer-events-none absolute top-8 inset-x-0 z-20"
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

          {/* =====================================================
              BACKGROUND MARQUEE (Teks besar bergeser di posisi awal)
              Terinspirasi dari style title pada section Project
          ====================================================== */}
          <motion.div
            style={{ opacity: bgMarqueeOpacity }}
            className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden select-none"
            aria-hidden="true"
          >
            {/* Wrapper: skew dinamis mengikuti kecepatan scroll */}
            <motion.div
              style={reduce ? undefined : { skewX }}
              className="will-change-transform"
            >
              {/* Track: pergeseran horizontal kontinu (translate X) */}
              <motion.div
                style={{ x: reduce ? 0 : x }}
                className="flex w-max transform-gpu items-center whitespace-nowrap will-change-transform"
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    ref={index === 0 ? firstGroupRef : undefined}
                    className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12 lg:gap-16 lg:pr-16"
                  >
                    <span className="text-[clamp(4.5rem,15vw,13rem)] font-bold tracking-tighter text-white/[0.09] leading-none">
                      About
                    </span>

                    <span
                      className="text-[clamp(4.5rem,15vw,13rem)] font-bold tracking-tighter text-transparent leading-none"
                      style={{
                        WebkitTextStroke: "1.5px rgba(255,255,255,0.22)",
                      }}
                    >
                      Me
                    </span>

                    <CatHeadPointer
                      className="h-[clamp(2.5rem,7vw,6.5rem)] w-[clamp(2.5rem,7vw,6.5rem)] shrink-0 opacity-25 drop-shadow-[0_2px_12px_rgba(136,192,208,0.25)]"
                    />
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* =================================================
              MAIN PROFILE CARD → scroll-driven fullscreen mask
          ================================================== */}

          <ScrollMaskCard
            progress={smoothProgress}
            imageSrc={getDirectImageUrl(PROFILE_IMAGE)}
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
                className="mb-6 flex items-center gap-3" children={undefined}              >
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