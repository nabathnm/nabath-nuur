import { motion } from "framer-motion";
import {
  Smartphone,
  Globe,
  Layers,
  Cpu,
  Check,
  ArrowUpRight,
} from "lucide-react";
import Glass from "../ui/glass";

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

export default function Services() {
  return (
    <section
      id="services"
      className="relative overflow-x-clip bg-transparent py-24 md:py-32 text-white"
    >
      {/* =====================================================
          AMBIENT BACKGROUND GLOW
      ====================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#88C0D0]/[0.025] blur-[130px]" />
        <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-white/[0.015] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 md:px-8 lg:px-12">
        {/* =====================================================
            SECTION HEADER
        ====================================================== */}
        <div className="mb-14 md:mb-20">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-white/30" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#88C0D0] font-semibold">
              Services
            </span>
          </div>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                What I can do
                <br />
                <span className="text-white/40">for your next project.</span>
              </h2>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-white/50">
              A comprehensive range of mobile and web engineering services to
              turn your ideas into functional, beautifully crafted digital
              experiences.
            </p>
          </div>
        </div>

        {/* =====================================================
            SERVICES GRID
        ====================================================== */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <motion.div
                key={service.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025] p-7 transition-all duration-300 hover:border-[#88C0D0]/40 hover:bg-white/[0.045] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] md:p-9"
              >
                <Glass rounded="rounded-[2rem]" />

                <div className="relative z-10 flex h-full flex-col justify-between">
                  {/* Top: Icon & Number Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#88C0D0] shadow-xs transition-all duration-300 group-hover:border-[#88C0D0]/40 group-hover:bg-[#88C0D0]/10 group-hover:scale-105">
                        <Icon size={22} className="text-[#88C0D0]" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold tracking-widest text-[#88C0D0]/70 group-hover:text-[#88C0D0] transition-colors">
                          {service.number}
                        </span>
                        <ArrowUpRight
                          size={16}
                          className="text-white/20 transition-all duration-300 group-hover:text-[#88C0D0] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#88C0D0]">
                      {service.subtitle}
                    </span>
                    <h3 className="mt-1 text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-white md:text-3xl">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 text-sm leading-relaxed text-white/55">
                      {service.description}
                    </p>

                    {/* Deliverables List */}
                    <div className="mt-6 space-y-2.5">
                      {service.deliverables.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-white/70"
                        >
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#88C0D0]/15 text-[#88C0D0]">
                            <Check size={11} strokeWidth={3} />
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: Tech Stack Pills */}
                  <div className="mt-8 flex flex-wrap gap-2 border-t border-white/[0.08] pt-5">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-white/60 transition-colors group-hover:border-white/20 group-hover:text-white/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

