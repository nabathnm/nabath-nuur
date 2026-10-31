import { motion, type Variants } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import TechHeading from "./TechHeading";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
}

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
}

// Heading: dua baris, dianimasikan berurutan oleh TechHeading.
const HEADING_LINES = [
  { text: "Transforming Ideas" },
  { text: "into Digital Experiences.", className: "text-white/35" },
]

export default function Hero() {
  return (
    <div className="relative z-20 mx-auto flex min-h-[calc(100vh-7rem)] max-w-7xl items-center px-6 pb-16 md:px-8 lg:pb-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full"
      >
        {/* Main heading */}
        <div className="relative mx-auto max-w-5xl text-center lg:max-w-6xl">
          {/* Decorative orbit — scales with headline */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035] sm:h-[340px] sm:w-[340px] lg:h-[460px] lg:w-[460px]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.02] sm:h-[440px] sm:w-[440px] lg:h-[580px] lg:w-[580px]" />

          <motion.div variants={itemVariants} className="relative z-10">
            <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-white/30 sm:mb-5 sm:text-xs md:text-sm">
              I build digital products
            </p>

            <TechHeading
              as="h1"
              lines={HEADING_LINES}
              className="text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[1] tracking-[-0.04em]"
              accent="#88C0D0"
              introDelay={0.45}
            />
          </motion.div>
        </div>

        {/* Introduction */}
        <motion.div
          variants={itemVariants}
          className="mt-7 flex flex-col items-center sm:mt-8 lg:mt-10"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm sm:gap-3 md:text-base">
            <span className="text-white/40">Hey, I'm</span>
            <span className="font-medium text-white/80">Nabath Nuur</span>
            <span className="text-white/20">—</span>
            <span className="text-white/40">
              I create web & mobile applications
            </span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={itemVariants}
          className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8"
        >
          <a
            href="#projects"
            className="group flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.08] px-5 py-2.5 text-xs font-medium text-white/80 backdrop-blur-xl transition-all duration-300 hover:border-white/25 hover:bg-white/[0.13] sm:px-7 sm:py-3 sm:text-sm"
          >
            View my work
            <ArrowDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5 sm:h-4 sm:w-4" />
          </a>

          <a
            href="#contact"
            className="group flex items-center gap-3 rounded-full border border-white/10 px-5 py-2.5 text-xs text-white/40 transition-all duration-300 hover:border-white/20 hover:text-white/70 sm:px-7 sm:py-3 sm:text-sm"
          >
            Let's talk
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:h-4 sm:w-4" />
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
