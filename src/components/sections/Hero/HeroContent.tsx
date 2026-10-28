import { Code2, ArrowUpRight, ArrowDown } from "lucide-react";
import { motion, type Variants } from "framer-motion"

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

const floatingVariants: Variants = {
  animate: {
    y: [-8, 8, -8],
    rotate: [-1, 1, -1],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

export default function Hero() {
    return (
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-7rem)] max-w-7xl items-center px-6 pb-20 md:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          {/* Main heading */}
          <div className="relative mx-auto max-w-5xl text-center">
            {/* Decorative orbit */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.02]" />

            <motion.div
              variants={itemVariants}
              className="relative z-10"
            >
              <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/30">
                I build digital products
              </p>

              <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl md:text-7xl lg:text-[58px]">
                Transforming ideas
                <br />
                <span className="text-white/35">
                  into digital experiences.
                </span>
              </h1>
            </motion.div>

            {/* Floating code badge */}
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="absolute -left-2 top-8 hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl backdrop-blur-xl md:block"
            >
              <Code2 className="h-5 w-5 text-white/40" />
            </motion.div>

            {/* Floating arrow badge */}
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="absolute -right-2 bottom-4 hidden h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl md:flex"
              style={{ animationDelay: "1s" }}
            >
              <ArrowUpRight className="h-4 w-4 text-white/40" />
            </motion.div>
          </div>

          {/* Introduction */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col items-center"
          >
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="text-white/40">
                Hey, I'm
              </span>

              <span className="font-medium text-white/80">
                Nabath Nuur
              </span>

              <span className="text-white/20">—</span>

              <span className="text-white/40">
                I create web & mobile applications
              </span>
            </div>


          </motion.div>

          {/* CTA */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#projects"
              className="group flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.08] px-6 py-3 text-xs font-medium text-white/80 backdrop-blur-xl transition-all duration-300 hover:border-white/25 hover:bg-white/[0.13]"
            >
              View my work

              <ArrowDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>

            <a
              href="#contact"
              className="group flex items-center gap-3 rounded-full border border-white/10 px-6 py-3 text-xs text-white/40 transition-all duration-300 hover:border-white/20 hover:text-white/70"
            >
              Let's talk

              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </motion.div>

          {/* Social / tech row */}
        </motion.div>
      </div>
    );
}
