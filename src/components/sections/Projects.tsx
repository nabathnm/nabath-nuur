"use client"

import { useLenis } from "@/lib/lenis"
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion"
import Snap from "lenis/snap"
import { useEffect, useId, useRef } from "react"
import CatHeadPointer from "@/components/svg/CatHeadPointer"
import { useProjects } from "../../hooks/useProjects"
import Glass from "../ui/glass"

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
   MARQUEE HEADER
====================================================== */

// `pad` dan `ACCENT` diasumsikan sudah ada di file Anda seperti sebelumnya.

// Pengaturan animasi
const BASE_SPEED = 70; // px/detik, kecepatan otomatis (ke kiri)
const VELOCITY_GAIN = 0.35; // pengaruh kecepatan scroll terhadap marquee
const MAX_VELOCITY = 4000; // batas atas velocity agar tidak ekstrem
const MAX_SKEW = 10; // derajat
const MAX_BLUR = 8; // px (hanya horizontal)

function SelectedWorkHeader({ count }: { count: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const firstGroupRef = useRef<HTMLDivElement>(null);
  const blurNodeRef = useRef<SVGFEGaussianBlurElement>(null);

  // Lebar satu grup (termasuk padding kanan) = periode loop.
  // Disimpan di ref agar tidak memicu re-render.
  const groupWidthRef = useRef(0);

  const reduce = useReducedMotion();
  const inView = useInView(ref, { margin: "100px 0px" });

  // ID unik untuk filter SVG (tanda ":" dari useId dibuang agar valid di url(#...))
  const filterId = `sw-motion-blur-${useId().replace(/:/g, "")}`;

  // Velocity scroll (kompatibel dengan Lenis karena Lenis menggerakkan window scroll)
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  // Posisi horizontal marquee (rentang: -groupWidth < x <= 0)
  const x = useMotionValue(0);

  // Skew mengikuti velocity (nilai di luar rentang otomatis di-clamp)
  const skewX = useTransform(
    smoothVelocity,
    [-3000, 0, 3000],
    [MAX_SKEW, 0, -MAX_SKEW]
  );

  // Motion blur horizontal mengikuti |velocity|
  const blur = useTransform(smoothVelocity, (v) =>
    Math.min(Math.abs(v) / 250, MAX_BLUR)
  );

  // Filter dimatikan total saat blur sangat kecil agar tidak membebani GPU
  const filter = useTransform(blur, (b) =>
    b < 0.4 ? "none" : `url(#${filterId})`
  );

  // Update stdDeviation langsung ke DOM (tanpa re-render React)
  useMotionValueEvent(blur, "change", (v) => {
    blurNodeRef.current?.setAttribute("stdDeviation", `${v.toFixed(2)} 0`);
  });

  // Ukur lebar satu grup untuk loop seamless
  useEffect(() => {
    const element = firstGroupRef.current;
    if (!element) return;

    const update = (width?: number) => {
      // borderBoxSize tidak terpengaruh transform (skew) dan bernilai pecahan
      groupWidthRef.current = width ?? element.offsetWidth;
    };

    update();

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      update(entry?.borderBoxSize?.[0]?.inlineSize);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    const width = groupWidthRef.current;
    if (reduce || !inView || width <= 0) return;

    // Cegah lompatan saat tab kembali aktif setelah lama tidak terlihat
    const dt = Math.min(delta, 64) / 1000;

    const v = Math.max(
      -MAX_VELOCITY,
      Math.min(MAX_VELOCITY, smoothVelocity.get())
    );

    // Scroll ke bawah (v > 0) -> makin cepat ke kiri.
    // Scroll ke atas (v < 0) -> melambat, lalu berbalik ke kanan.
    // Fungsi kontinu: tidak ada threshold/lompatan, kembali halus ke -BASE_SPEED
    // karena spring velocity meluruh ke 0.
    const speed = -BASE_SPEED - v * VELOCITY_GAIN;

    let next = (x.get() + speed * dt) % width; // hasil di (-width, width)
    if (next > 0) next -= width; // normalisasi ke (-width, 0]

    x.set(next);
  });

  const words = Array.from({ length: 4 });

  return (
    <div ref={ref} className="relative z-10 mb-16 md:mb-10">
      {/* Small header */}
      <div className="mx-auto mb-8 flex max-w-[1600px] items-center justify-between px-6 md:px-8 lg:px-12">
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

      {/* Definisi filter motion blur horizontal */}
      <svg
        width="0"
        height="0"
        className="pointer-events-none absolute"
        aria-hidden="true"
        focusable="false"
      >
      </svg>

      {/* Scrolling text */}
      <div className="overflow-hidden">
        {/* Wrapper: skew + motion blur (terpisah dari translate agar origin skew stabil) */}
        <motion.div
          style={reduce ? undefined : { skewX, filter }}
          className="will-change-transform"
          aria-hidden="true"
        >
          {/* Track: hanya translate X */}
          <motion.div
            style={{ x: reduce ? 0 : x }}
            className="flex w-max transform-gpu items-center whitespace-nowrap will-change-transform"
          >
            {words.map((_, index) => (
              <div
                key={index}
                ref={index === 0 ? firstGroupRef : undefined}
                // pr-8 menggantikan gap antar-grup, sehingga lebar grup
                // = periode loop yang tepat (tanpa lompatan 32px)
                className="flex shrink-0 items-center gap-8 pr-8"
              >
                <span className="text-[clamp(3.5rem,13vw,12rem)] font-semibold leading-[0.9] tracking-tighter text-white/90">
                  Selected
                </span>

                <span
                  className="text-[clamp(3.5rem,13vw,12rem)] font-semibold leading-[0.9] tracking-tighter text-transparent"
                  style={{
                    WebkitTextStroke: "1px rgba(255,255,255,0.28)",
                  }}
                >
                  Work
                </span>

                <CatHeadPointer
                  className="h-[clamp(2rem,6vw,5.5rem)] w-[clamp(2rem,6vw,5.5rem)] shrink-0 drop-shadow-[0_2px_12px_rgba(136,192,208,0.25)]"
                />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <h2 className="sr-only">Selected Work</h2>
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

  /*
   * Image reveal progress.
   *
   * Reveal dimulai saat project memasuki viewport dari bawah
   * dan selesai saat bagian atas project mencapai IMAGE_REVEAL_OFFSET.
   */
  const { scrollYProgress: enterRaw } = useScroll({
    target: ref,
    offset: ["start end", `start ${IMAGE_REVEAL_OFFSET}`],
  })

  /*
   * Progress scroll keseluruhan project.
   * Digunakan untuk parallax gambar dan nomor dekoratif.
   */
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
  const radius = useTransform(enter, [0, 1], [48, 32])

  const clipPath = useMotionTemplate`inset(${insetY}% ${insetX}% round ${radius}px)`

  /* ---------- PARALLAX & ZOOM ---------- */

  const imageY = useTransform(full, [0, 1], ["-7%", "7%"])
  const imageScale = useTransform(enter, [0, 1], [1.2, 1.04])
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
      className="relative snap-start snap-always scroll-mt-20 md:scroll-mt-24 lg:scroll-mt-28"
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col justify-center px-6 py-14 md:px-8 md:py-20 lg:px-12 lg:py-24">
        <div className="relative flex flex-col gap-6 lg:block lg:min-h-[78dvh]">
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

            <h3 className="wrap-break-word text-[clamp(2.5rem,6.2vw,6.5rem)] font-bold font-accent leading-[0.92] tracking-[0.04em] text-primary [text-shadow:0_2px_40px_rgba(46,52,64,0.55)]">
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
                        className="flex items-start gap-3 text-[13px] leading-relaxed text-white/55"
                      >
                        <span
                          className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full"
                          style={{
                            backgroundColor: ACCENT,
                            opacity: 0.7,
                          }}
                        />

                        {feature}
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
    <div className="relative z-10 px-2 md:px-25 snap-y snap-proximity">
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

  // Integrasi smooth scroll snap menggunakan lenis/snap
  useEffect(() => {
    if (!lenis || reduce || projects.length === 0) return

    const snap = new Snap(lenis, {
      type: "proximity",
      distanceThreshold: "28%",
      duration: 1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      debounce: 100,
    })

    const section = document.getElementById("projects")
    if (section) {
      const articles = section.querySelectorAll<HTMLElement>("article")
      if (articles.length > 0) {
        snap.addElements(Array.from(articles), { align: "start" })
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
      className="relative overflow-x-clip bg-transparent pb-24 pt-24 text-white md:pt-32 snap-y snap-proximity"
    >
      <SelectedWorkHeader count={projects.length} />

      <ProjectList
        projects={projects}
        reduce={reduce}
      />
    </section>
  )
}