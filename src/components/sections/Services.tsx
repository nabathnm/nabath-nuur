"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Cpu,
  Globe,
  Layers,
  Smartphone
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ServiceItem {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Smartphone;
  deliverables: string[];
  tags: string[];
}

const services: ServiceItem[] = [
  {
    number: "01",
    title: "Mobile App Development",
    subtitle: "Cross-Platform Android & iOS",
    description:
      "Building high-performance, responsive, and native-feeling mobile applications using Flutter. Focused on clean architecture, scalable state management, and fluid UI experiences.",
    icon: Smartphone,
    deliverables: [
      "Cross-platform iOS & Android apps",
      "State management with BLoC & Provider",
      "Smooth native animations & micro-interactions",
      "Offline caching & local data storage",
    ],
    tags: ["Flutter", "Dart", "BLoC", "Provider", "REST API"],
  },
  {
    number: "02",
    title: "Frontend Web Development",
    subtitle: "Interactive & Performant Web",
    description:
      "Crafting modern, fast, and accessible web interfaces with React, Next.js, and TypeScript. Utilizing Tailwind CSS and Framer Motion to build engaging, responsive digital products.",
    icon: Globe,
    deliverables: [
      "Responsive, modern web applications",
      "Server-side rendering & static generation",
      "Fluid interactive micro-interactions",
      "Performance & SEO optimization",
    ],
    tags: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    number: "03",
    title: "UI/UX to Production Code",
    subtitle: "Pixel-Perfect Implementation",
    description:
      "Translating complex Figma and UI/UX prototypes into clean, modular, and maintainable code with strict attention to typography, spacing, and adaptive behaviors.",
    icon: Layers,
    deliverables: [
      "100% pixel-perfect Figma translations",
      "Modular & reusable component systems",
      "Dark mode & themed design systems",
      "Fully responsive across all screen sizes",
    ],
    tags: ["Figma", "Design Systems", "Component Architecture", "Tailwind CSS"],
  },
  {
    number: "04",
    title: "API & Backend Integration",
    subtitle: "Connected & Scalable Solutions",
    description:
      "Integrating frontend and mobile applications with RESTful APIs, cloud databases (Turso / SQLite), authentication flows, and real-time data synchronization.",
    icon: Cpu,
    deliverables: [
      "RESTful API integration & data fetching",
      "Database integration with Turso / SQLite",
      "Secure authentication & session handling",
      "Robust error handling & loading states",
    ],
    tags: ["REST APIs", "Turso", "LibSQL", "State Management", "Data Sync"],
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

export default function Services() {
  const trackRef = useRef<HTMLDivElement>(null);
  const panelsContainerRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  // Track vertical scroll progress across the pinned stage (0 -> 1)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Spring-smoothed scroll progress for organic, jitter-free horizontal translation
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 24,
    stiffness: 140,
    mass: 0.2,
    restDelta: 0.0005,
  });

  // Dynamically calculate horizontal distance to scroll through all panels
  useEffect(() => {
    const container = panelsContainerRef.current;
    if (!container) return;

    const updateScrollRange = () => {
      const rect = container.getBoundingClientRect();
      const totalWidth = container.scrollWidth;
      const availableWidth = window.innerWidth - Math.max(0, rect.left);
      const rightPadding = window.innerWidth >= 1024 ? 96 : 32;
      const distance = Math.max(0, totalWidth - availableWidth + rightPadding);
      setMaxScroll(distance);
    };

    updateScrollRange();

    const resizeObserver = new ResizeObserver(updateScrollRange);
    resizeObserver.observe(container);
    window.addEventListener("resize", updateScrollRange);

    const timer = setTimeout(updateScrollRange, 150);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollRange);
    };
  }, []);

  // Map scroll progress to horizontal translation
  const x = useTransform(smoothProgress, [0, 1], [0, -maxScroll]);

  // Synchronize active service index based on scroll progress
  useMotionValueEvent(smoothProgress, "change", (v) => {
    if (v < 0.18) {
      setActiveIndex(0);
    } else if (v < 0.5) {
      setActiveIndex(1);
    } else if (v < 0.8) {
      setActiveIndex(2);
    } else {
      setActiveIndex(3);
    }
  });

  const trackHeight = `${services.length * 100}vh`;

  return (
    <section
      id="services"
      className="relative overflow-x-clip bg-[#2E3440] text-white"
    >
      {/* =====================================================
          SCROLL TRACK (Vertical canvas driving horizontal travel)
      ====================================================== */}
      <div
        ref={trackRef}
        style={{ height: trackHeight }}
        className="relative z-10"
      >
        {/* =====================================================
            STICKY STAGE (Locked in viewport)
        ====================================================== */}
        <div className="sticky top-0 flex h-screen min-h-dvh w-full flex-col justify-between overflow-hidden py-6 sm:py-8 lg:py-10">
          {/* =====================================================
              AMBIENT COSMIC BACKGROUND
          ====================================================== */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Subtle background grid */}
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
                `,
                backgroundSize: "90px 90px",
                maskImage:
                  "radial-gradient(circle at 50% 40%, black 0%, transparent 80%)",
                WebkitMaskImage:
                  "radial-gradient(circle at 50% 40%, black 0%, transparent 80%)",
              }}
            />

            {/* Ambient nebulas */}
            <div className="absolute left-1/4 top-1/3 h-125 w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#88C0D0]/[0.035] blur-[140px]" />
            <div className="absolute right-12 bottom-1/4 h-112.5 w-[450px] rounded-full bg-[#81A1C1]/[0.025] blur-[150px]" />

            {/* Subtle star particles */}
            <div className="absolute left-[12%] top-[15%] h-1 w-1 rounded-full bg-white/20" />
            <div className="absolute right-[18%] top-[35%] h-[2px] w-[2px] rounded-full bg-white/30" />
            <div className="absolute left-[24%] bottom-[20%] h-[3px] w-[3px] rounded-full bg-white/15" />
            <div className="absolute right-[8%] bottom-[30%] h-1 w-1 rounded-full bg-white/25" />
          </div>

          <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col justify-between px-6 md:px-8 lg:px-16">
            {/* Top section: Mini header + Headline */}
            <div>
              {/* =====================================================
                  SECTION MINI HEADER (Consistent with Projects & Tools)
              ====================================================== */}
              <div className="mb-4 sm:mb-6 flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-white/30" />

                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                    Services
                  </span>
                </div>

                <span className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                  ({pad(services.length)}) Selected
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl leading-[1.08]">
                What I can do{" "}
                <span className="font-normal text-white/35">
                  for your next project.
                </span>
              </h2>
            </div>
 

            {/* =====================================================
                HORIZONTAL MOVING PANELS STAGE
            ====================================================== */}
            <div className="relative my-auto flex flex-1 items-center overflow-visible py-2 sm:py-4">
              <motion.div
                ref={panelsContainerRef}
                style={{ x }}
                className="flex items-stretch"
              >
                {services.map((service, index) => {
                  const Icon = service.icon;
                  const isActive = activeIndex === index;

                  return (
                    <div
                      key={service.number}
                      className={`group relative flex w-[86vw] sm:w-[74vw] md:w-[64vw] lg:w-[54vw] xl:w-[48vw] max-w-[880px] shrink-0 flex-col justify-between rounded-[2rem] border p-6 sm:p-8 lg:p-10 mr-6 sm:mr-8 lg:mr-10 transition-all duration-500 ${
                        isActive
                          ? "border-white/20 bg-white/2.5 shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
                          : "border-white/10 bg-white/[0.012] hover:border-[#88C0D0]/35 hover:bg-white/[0.022]"
                      }`}
                    >
                      {/* Subtle ambient hover wash */}
                      <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#88C0D0]/[0.03] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      <div className="relative z-10 flex h-full flex-col justify-between">
                        {/* Top: Metadata & Icon */}
                        <div>
                          <div className="mb-4 flex items-center justify-between sm:mb-6">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm sm:text-base font-bold tracking-widest text-[#88C0D0]">
                                /{service.number}
                              </span>
                              <span className="h-px w-6 sm:w-8 bg-[#88C0D0]/30 transition-all duration-300 group-hover:w-12 group-hover:bg-[#88C0D0]" />
                              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#88C0D0]/90">
                                {service.subtitle}
                              </span>
                            </div>

                            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/40 transition-all duration-300 group-hover:border-[#88C0D0]/50 group-hover:bg-[#88C0D0]/10 group-hover:text-[#88C0D0]">
                              <Icon
                                size={18}
                                className="transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>
                          </div>

                          {/* Large Bold Service Title */}
                          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[46px] font-bold tracking-tight text-white leading-[1.08] transition-colors duration-300 group-hover:text-[#88C0D0]">
                            {service.title}
                          </h3>

                          {/* Description */}
                          <p className="mt-3 sm:mt-5 text-sm sm:text-base lg:text-lg leading-relaxed text-white/60 font-normal">
                            {service.description}
                          </p>

                          {/* Deliverables List */}
                          <div className="mt-6 sm:mt-8 space-y-2.5 sm:space-y-3">
                            <span className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-white/35">
                              Deliverables & Scope
                            </span>
                            <ul className="grid grid-cols-1 gap-2 sm:gap-2.5 sm:grid-cols-2">
                              {service.deliverables.map((item, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center gap-2.5 text-xs sm:text-[13px] text-white/75 transition-colors group-hover:text-white/95"
                                >
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#88C0D0]/60 transition-all duration-300 group-hover:scale-125 group-hover:bg-[#88C0D0]" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Bottom: Tech Stack Pills & Arrow */}
                        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4 sm:pt-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="mr-1 hidden text-[11px] font-mono uppercase tracking-wider text-white/30 sm:inline-block">
                              Stack:
                            </span>
                            {service.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1 text-[11px] font-mono text-white/50 transition-all duration-300 group-hover:border-[#88C0D0]/30 group-hover:bg-[#88C0D0]/5 group-hover:text-white/80"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* =====================================================
                STICKY BOTTOM BAR (Progress Bar & Status Indicator)
            ====================================================== */}
            <div className="shrink-0 border-t border-white/[0.08] pt-4 pb-1">
              <div className="flex items-center justify-between text-xs">
                {/* Active Service Counter */}
                <div className="flex items-center gap-3">
               
                  <span className="hidden sm:inline text-white/30">•</span>
                  <span className="hidden sm:inline font-medium text-white/60">
                    {services[activeIndex]?.title}
                  </span>
                </div>

                {/* Progress Bar Track */}
                <div className="flex items-center gap-4">
                  <span className="hidden md:inline font-mono text-[11px] uppercase tracking-wider text-white/35">
                    Scroll to explore
                  </span>
                  <div className="relative h-1 w-28 sm:w-44 md:w-56 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#88C0D0] to-[#81A1C1] rounded-full"
                      style={{
                        scaleX: smoothProgress,
                        transformOrigin: "left",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
