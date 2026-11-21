"use client";

import FloatingStickers from "@/components/common/FloatingStickers";
import MagneticHeadline from "@/components/common/MagneticHeadline";
import ScrollMaskCard, { ScrollReveal } from "@/components/common/ScrollMaskCard";
import TerminalModal, { type StickerInfo } from "@/components/common/TerminalModal";
import CatHeadPointer from "@/components/svg/CatHeadPointer";
import { useLenis } from "@/lib/lenis";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowUpRight, Code2, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import AboutFloatingItems from "@/components/common/AboutFloatingItems";

/* =====================================================
   ABOUT PROFILE DATA
====================================================== */

const PROFILE = {
  name: "Nabath Nuur",
  role: "IT Student",
  year: "2026",
  status: "Active",
  image:
    "https://dgapjusikgybitsessku.supabase.co/storage/v1/object/public/projects/nabati.JPG",
  eyebrow: "Hello, I'm",
  headline: "Building thoughtful things for the web.",
  bio: "An IT student who enjoys turning ideas into clean, fast and accessible interfaces — from the first sketch to the last pixel of polish.",
  focus: ["Frontend", "UI Motion", "Web Performance", "Databases"],
};

function getDirectImageUrl(url: string): string {
  if (!url) return "";
  const match = url.match(
    /supabase\.com\/dashboard\/project\/([^/]+)\/storage\/files\/buckets\/([^/?#]+).*[?&]preview=([^&]+)/
  );
  if (match) {
    const [, projectRef, bucket, fileName] = match;
    return `https://${projectRef}.supabase.co/storage/v1/object/public/${bucket}/${fileName}`;
  }
  return url;
}

const PROFILE_IMAGE_URL = getDirectImageUrl(PROFILE.image);

/* =====================================================
   TRANSITION CARDS DATA (Divider between Hero & About)
====================================================== */

interface TransitionCard {
  id: string;
  category: string;
  title: string;
  theme: "white" | "blue" | "dark" | "orange" | "green";
  artType: "camera" | "notebook" | "darts" | "analytics" | "arrow" | "blocks";
  buttonText?: string;
  targetSection?: string;
}

const TRANSITION_CARDS: TransitionCard[] = [
  {
    id: "card-arrow",
    category: "FOUNDATION",
    title: "Design Systems",
    theme: "orange",
    artType: "arrow",
    buttonText: "LEARN MORE",
    targetSection: "tools",
  },
  {
    id: "card-camera",
    category: "ENGINEERING",
    title: "Mobile Apps",
    theme: "white",
    artType: "camera",
    buttonText: "LEARN MORE",
    targetSection: "projects",
  },
  {
    id: "card-notebook",
    category: "ARCHITECTURE",
    title: "Frontend Craft",
    theme: "blue",
    artType: "notebook",
    buttonText: "LEARN MORE",
    targetSection: "tools",
  },
  {
    id: "card-darts",
    category: "OPTIMIZATION",
    title: "UI Motion & Speed",
    theme: "dark",
    artType: "darts",
    buttonText: "LEARN MORE",
    targetSection: "about",
  },
  {
    id: "card-analytics",
    category: "SYSTEMS",
    title: "Fullstack & APIs",
    theme: "white",
    artType: "analytics",
    buttonText: "LEARN MORE",
    targetSection: "experiences",
  },
  {
    id: "card-blocks",
    category: "STANDARDS",
    title: "Clean Architecture",
    theme: "green",
    artType: "blocks",
    buttonText: "LEARN MORE",
    targetSection: "projects",
  },
];

/* =====================================================
   3D ARTWORK SVGS
====================================================== */

function CardArtwork({ type }: { type: TransitionCard["artType"] }) {
  switch (type) {
    case "camera":
      return (
        <div className="relative flex h-36 w-full items-center justify-center">
          <svg width="150" height="130" viewBox="0 0 150 130" fill="none" className="drop-shadow-[0_16px_24px_rgba(0,0,0,0.22)]">
            <circle cx="52" cy="42" r="28" fill="#2E3440" />
            <circle cx="52" cy="42" r="24" fill="#3B4252" />
            <circle cx="52" cy="42" r="8" fill="#88C0D0" />
            <circle cx="40" cy="34" r="3.5" fill="#4C566A" />
            <circle cx="64" cy="34" r="3.5" fill="#4C566A" />
            <circle cx="52" cy="54" r="3.5" fill="#4C566A" />

            <circle cx="98" cy="42" r="28" fill="#1E222A" />
            <circle cx="98" cy="42" r="24" fill="#2E3440" />
            <circle cx="98" cy="42" r="8" fill="#81A1C1" />
            <circle cx="86" cy="34" r="3.5" fill="#3B4252" />
            <circle cx="110" cy="34" r="3.5" fill="#3B4252" />
            <circle cx="98" cy="54" r="3.5" fill="#3B4252" />

            <rect x="36" y="58" width="80" height="52" rx="14" fill="#2E3440" />
            <rect x="42" y="64" width="68" height="40" rx="10" fill="#3B4252" />
            <circle cx="76" cy="84" r="14" fill="#434C5E" stroke="#88C0D0" strokeWidth="2.5" />
            <circle cx="76" cy="84" r="7" fill="#88C0D0" />

            <path d="M116 72 L138 60 L138 98 L116 86 Z" fill="#2E3440" />
            <path d="M120 74 L134 65 L134 93 L120 84 Z" fill="#5E81AC" opacity="0.8" />
            <rect x="22" y="76" width="14" height="16" rx="4" fill="#BF616A" />
          </svg>
        </div>
      );

    case "notebook":
      return (
        <div className="relative flex h-36 w-full items-center justify-center">
          <svg width="150" height="130" viewBox="0 0 150 130" fill="none" className="drop-shadow-[0_16px_28px_rgba(0,0,0,0.3)]">
            <g transform="rotate(-6 75 65)">
              <rect x="30" y="22" width="90" height="96" rx="14" fill="#ECEFF4" />
              <rect x="34" y="26" width="82" height="88" rx="10" fill="#E5E9F0" />
              <rect x="44" y="44" width="46" height="6" rx="3" fill="#81A1C1" opacity="0.6" />
              <rect x="44" y="56" width="62" height="4" rx="2" fill="#D8DEE9" />
              <rect x="44" y="66" width="54" height="4" rx="2" fill="#D8DEE9" />
              <rect x="44" y="76" width="58" height="4" rx="2" fill="#D8DEE9" />
              <rect x="44" y="86" width="38" height="4" rx="2" fill="#D8DEE9" />

              {[34, 48, 62, 76, 90, 104].map((y, i) => (
                <ellipse
                  key={i}
                  cx="32"
                  cy={y}
                  rx="6"
                  ry="4"
                  fill="none"
                  stroke="#4C566A"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ))}
            </g>

            <g transform="translate(100, 20) rotate(24)">
              <rect x="0" y="0" width="10" height="90" rx="5" fill="#88C0D0" stroke="#ECEFF4" strokeWidth="2" />
              <polygon points="0,90 10,90 5,104" fill="#2E3440" />
              <circle cx="5" cy="10" r="2" fill="#ECEFF4" />
            </g>
          </svg>
        </div>
      );

    case "darts":
      return (
        <div className="relative flex h-36 w-full items-center justify-center">
          <svg width="150" height="130" viewBox="0 0 150 130" fill="none" className="drop-shadow-[0_18px_32px_rgba(0,0,0,0.4)]">
            <ellipse cx="65" cy="72" rx="46" ry="38" fill="#ECEFF4" />
            <ellipse cx="65" cy="72" rx="36" ry="30" fill="#2E3440" />
            <ellipse cx="65" cy="72" rx="26" ry="22" fill="#88C0D0" />
            <ellipse cx="65" cy="72" rx="16" ry="14" fill="#BF616A" />
            <ellipse cx="65" cy="72" rx="7" ry="6" fill="#ECEFF4" />

            <g transform="translate(65, 72) rotate(-35)">
              <line x1="0" y1="0" x2="0" y2="-55" stroke="#ECEFF4" strokeWidth="3" />
              <polygon points="-12,-55 0,-45 0,-62" fill="#BF616A" />
              <polygon points="12,-55 0,-45 0,-62" fill="#BF616A" />
              <polygon points="0,-40 6,-55 -6,-55" fill="#D08770" />
            </g>

            <g transform="translate(82, 58) rotate(-45)">
              <line x1="0" y1="0" x2="0" y2="-50" stroke="#ECEFF4" strokeWidth="2.5" />
              <polygon points="-10,-50 0,-42 0,-56" fill="#D08770" />
              <polygon points="10,-50 0,-42 0,-56" fill="#D08770" />
            </g>

            <g transform="translate(54, 88) rotate(-20)">
              <line x1="0" y1="0" x2="0" y2="-48" stroke="#ECEFF4" strokeWidth="2.5" />
              <polygon points="-10,-48 0,-40 0,-54" fill="#BF616A" />
              <polygon points="10,-48 0,-40 0,-54" fill="#BF616A" />
            </g>
          </svg>
        </div>
      );

    case "analytics":
      return (
        <div className="relative flex h-36 w-full items-center justify-center">
          <svg width="150" height="130" viewBox="0 0 150 130" fill="none" className="drop-shadow-[0_16px_26px_rgba(0,0,0,0.22)]">
            <g transform="translate(42, 60)">
              <path d="M0,15 C0,25 24,25 24,15 L24,40 C24,50 0,50 0,40 Z" fill="#88C0D0" opacity="0.8" />
              <ellipse cx="12" cy="15" rx="12" ry="7" fill="#ECEFF4" />
            </g>
            <g transform="translate(70, 42)">
              <path d="M0,18 C0,30 28,30 28,18 L28,52 C28,64 0,64 0,52 Z" fill="#5E81AC" />
              <ellipse cx="14" cy="18" rx="14" ry="8" fill="#81A1C1" />
            </g>
            <g transform="translate(102, 28)">
              <path d="M0,20 C0,34 32,34 32,20 L32,70 C32,84 0,84 0,70 Z" fill="#2E3440" />
              <ellipse cx="16" cy="20" rx="16" ry="9" fill="#A3BE8C" />
            </g>

            <path
              d="M 28 85 Q 70 65, 118 36"
              stroke="#A3BE8C"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="118" cy="36" r="6" fill="#A3BE8C" stroke="#ECEFF4" strokeWidth="2.5" />
          </svg>
        </div>
      );

    case "arrow":
      return (
        <div className="relative flex h-36 w-full items-center justify-center">
          <svg width="150" height="130" viewBox="0 0 150 130" fill="none" className="drop-shadow-[0_16px_28px_rgba(0,0,0,0.28)]">
            <g transform="translate(75, 65) rotate(-28)">
              <path d="M0 -38 L38 28 L0 16 L-38 28 Z" fill="#BF616A" transform="translate(0, 10)" />
              <path d="M0 -38 L38 28 L0 16 L-38 28 Z" fill="#ECEFF4" />
              <path d="M0 -38 L38 28 L0 16 Z" fill="#E5E9F0" />
              <path d="M0 -18 L18 18 L0 12 L-18 18 Z" fill="#D08770" opacity="0.6" />
            </g>
          </svg>
        </div>
      );

    case "blocks":
      return (
        <div className="relative flex h-36 w-full items-center justify-center">
          <svg width="150" height="130" viewBox="0 0 150 130" fill="none" className="drop-shadow-[0_16px_26px_rgba(0,0,0,0.25)]">
            <g transform="translate(75, 48)">
              <polygon points="0,-16 26,-2 0,12 -26,-2" fill="#ECEFF4" />
              <polygon points="-26,-2 0,12 0,42 -26,28" fill="#88C0D0" />
              <polygon points="0,12 26,-2 26,28 0,42" fill="#5E81AC" />
            </g>
            <g transform="translate(48, 76)">
              <polygon points="0,-14 22,-2 0,10 -22,-2" fill="#ECEFF4" />
              <polygon points="-22,-2 0,10 0,34 -22,22" fill="#A3BE8C" />
              <polygon points="0,10 22,-2 22,22 0,34" fill="#4C566A" />
            </g>
            <g transform="translate(102, 76)">
              <polygon points="0,-14 22,-2 0,10 -22,-2" fill="#EBCB8B" />
              <polygon points="-22,-2 0,10 0,34 -22,22" fill="#D08770" />
              <polygon points="0,10 22,-2 22,22 0,34" fill="#2E3440" />
            </g>
          </svg>
        </div>
      );
  }
}

function TransitionCardItem({
  card,
  onNavigate,
}: {
  card: TransitionCard;
  onNavigate: (sectionId: string) => void;
}) {
  const getThemeClasses = () => {
    switch (card.theme) {
      case "white":
        return {
          container: "bg-[#ECEFF4] text-[#2E3440] border border-white/80 shadow-[0_22px_45px_rgba(0,0,0,0.28)]",
          eyebrow: "text-[#4C566A]/75",
          title: "text-[#2E3440]",
          buttonIcon: "bg-[#2E3440] text-white",
          buttonLabel: "text-[#2E3440]",
        };
      case "blue":
        return {
          container: "bg-gradient-to-br from-[#5E81AC] via-[#507299] to-[#3B4252] text-white border border-[#81A1C1]/40 shadow-[0_24px_50px_rgba(94,129,172,0.35)]",
          eyebrow: "text-white/70",
          title: "text-white",
          buttonIcon: "bg-white text-[#2E3440]",
          buttonLabel: "text-white",
        };
      case "dark":
        return {
          container: "bg-gradient-to-br from-[#1E222A] via-[#2E3440] to-[#252B36] text-white border border-white/12 shadow-[0_24px_55px_rgba(0,0,0,0.45)]",
          eyebrow: "text-[#88C0D0]",
          title: "text-white",
          buttonIcon: "bg-white text-[#2E3440]",
          buttonLabel: "text-white/90",
        };
      case "orange":
        return {
          container: "bg-gradient-to-br from-[#D08770] via-[#C5765F] to-[#BF616A] text-white border border-[#EBCB8B]/30 shadow-[0_24px_50px_rgba(208,135,112,0.35)]",
          eyebrow: "text-white/80",
          title: "text-white",
          buttonIcon: "bg-white text-[#2E3440]",
          buttonLabel: "text-white",
        };
      case "green":
        return {
          container: "bg-gradient-to-br from-[#8FBC8F] via-[#A3BE8C] to-[#4F7942] text-[#2E3440] border border-white/40 shadow-[0_24px_50px_rgba(163,190,140,0.35)]",
          eyebrow: "text-[#2E3440]/70 font-bold",
          title: "text-[#2E3440]",
          buttonIcon: "bg-[#2E3440] text-white",
          buttonLabel: "text-[#2E3440]",
        };
    }
  };

  const themeStyle = getThemeClasses();

  return (
    <div
      onClick={() => card.targetSection && onNavigate(card.targetSection)}
      className={`group relative flex h-[340px] w-[230px] sm:h-[375px] sm:w-[265px] shrink-0 cursor-pointer flex-col justify-between rounded-[2.2rem] p-6 transition-all duration-300 transform -rotate-[10deg] sm:-rotate-[12deg] hover:-rotate-2 hover:-translate-y-6 hover:scale-[1.05] hover:!z-50 hover:shadow-[0_30px_60px_rgba(0,0,0,0.45)] select-none ${themeStyle.container}`}
    >
      <div className="relative z-10 w-full pt-2">
        <CardArtwork type={card.artType} />
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-[0.25em] ${themeStyle.eyebrow}`}>
            {card.category}
          </span>
          <h3 className={`mt-0.5 text-xl sm:text-2xl font-bold leading-tight tracking-tight ${themeStyle.title}`}>
            {card.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45 ${themeStyle.buttonIcon}`}
          >
            <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
          </span>
          <span className={`text-[11px] font-bold tracking-[0.16em] uppercase ${themeStyle.buttonLabel}`}>
            {card.buttonText || "LEARN MORE"}
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-60" />
    </div>
  );
}

/* =====================================================
   UNIFIED HERO + DIVIDER + ABOUT SECTION
====================================================== */

export default function HeroAboutSection() {
  const lenis = useLenis();
  const reduce = useReducedMotion() ?? false;

  /* ---------- HERO LOGIC ---------- */
  const heroRef = useRef<HTMLElement>(null);
  const [selectedSticker, setSelectedSticker] = useState<StickerInfo | null>(null);

  const heroContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const heroItemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  /* ---------- DIVIDER LOGIC ---------- */
  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;

    if (lenis) {
      lenis.scrollTo(el, {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  /* ---------- ABOUT LOGIC ---------- */
  const aboutTrackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: aboutTrackRef,
    offset: ["start start", "end end"],
  });
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const aboutProgress = reduce ? scrollYProgress : springProgress;

  const introOpacity = useTransform(aboutProgress, [0.22, 0.38], [1, 0]);

  return (
    <div className="relative w-full overflow-x-clip bg-transparent text-white">
      {/* =====================================================
          1. HERO SECTION (#home)
          ====================================================== */}
      <section
        id="home"
        ref={heroRef}
        className="relative flex min-h-screen items-center pt-10 pb-12 sm:pt-10 lg:pt-0"
      >
        {/* Ambient background glow (pure CSS, lightweight) */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#88C0D0]/[0.04] blur-3xl" />
          <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-[#5E81AC]/[0.04] blur-3xl" />
        </div>

        {/* Hero Content Grid */}
        <div className="pointer-events-none relative z-10 flex min-h-screen w-full items-center pt-10 pb-16">
          <div className="pointer-events-none relative mx-auto flex w-full max-w-[1600px] px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20">
            <motion.div
              variants={heroContainerVariants}
              initial="hidden"
              animate="visible"
              className="pointer-events-none w-full"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14">
                {/* Left: Magnetic Headline */}
                <div className="lg:col-span-7 xl:col-span-7 text-left">
                  <motion.div variants={heroItemVariants} className="pointer-events-none relative z-10">
                    <div className="pointer-events-auto inline-block">
                      <MagneticHeadline className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl leading-[1.08] tracking-[-0.03em]" />
                    </div>
                  </motion.div>
                </div>

                {/* Right: Terminal Modal Console */}
                <div className="lg:col-span-5 xl:col-span-5 w-full">
                  <motion.div variants={heroItemVariants} className="pointer-events-auto relative z-20 w-full">
                    <TerminalModal
                      sticker={selectedSticker}
                      onClose={() => setSelectedSticker(null)}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Draggable Stickers */}
        <FloatingStickers
          heroRef={heroRef}
          onSelectSticker={(info) => setSelectedSticker(info)}
        />
      </section>

      {/* =====================================================
          2. TRANSITION CARDS DIVIDER (Stationary Tilted Deck)
          ====================================================== */}
      <div
        role="region"
        aria-label="Capabilities Transition Divider"
        className="relative z-20 w-full select-none overflow-x-clip overflow-y-visible bg-transparent -mt-24 sm:-mt-32 md:-mt-40 lg:-mt-48 xl:-mt-64 -mb-24 sm:-mb-32 md:-mb-40 lg:-mb-48 xl:-mb-56"
      >
        {/* Radial ambient lighting */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(136,192,208,0.06),transparent_70%)]" />

        {/* Mobile Edge Gradient Indicators */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#2E3440] to-transparent z-30 lg:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#2E3440] to-transparent z-30 lg:hidden" />

        {/* Stationary Cards Stage: generous vertical headroom to prevent any clipping */}
        <div className="relative z-10 w-full overflow-visible no-scrollbar pt-12 pb-16 sm:pt-16 sm:pb-20 flex items-center justify-center px-6 sm:px-10 lg:px-14">
          <div className="flex shrink-0 items-center -space-x-10 sm:-space-x-14 md:-space-x-16 lg:-space-x-20 xl:space-x-12 py-4">
            {TRANSITION_CARDS.map((card, idx) => (
              <div
                key={card.id}
                className="relative transition-all duration-300"
                style={{ zIndex: idx + 1 }}
              >
                <TransitionCardItem
                  card={card}
                  onNavigate={handleNavigate}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================
          3. ABOUT SECTION (#about)
          ====================================================== */}
      <section
        id="about"
        aria-labelledby="about-heading"
        className="relative bg-transparent text-white"
      >
        <h2 id="about-heading" className="sr-only">
          About me — {PROFILE.name}
        </h2>

        {/* SCROLL TRACK (sticky stage + scroll-driven card) */}
        <div ref={aboutTrackRef} className="relative z-10 h-[290vh]">
          <div className="sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden">
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
              progress={aboutProgress}
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
              {/* Fullscreen content, revealed progressively (staggered) */}
              <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
                <ScrollReveal
                  progress={aboutProgress}
                  range={[0.48, 0.58]}
                  className="mb-5 flex items-center gap-3"
                >
                  <span className="h-px w-8 bg-white/40" />
                  <span className="text-[11px] uppercase tracking-[0.3em] text-white/70">
                    {PROFILE.eyebrow}
                  </span>
                  <span className="h-px w-8 bg-white/40" />
                </ScrollReveal>

                <ScrollReveal progress={aboutProgress} range={[0.54, 0.66]} className="mb-5">
                  <p className="text-4xl font-bold leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-7xl">
                    {PROFILE.name}
                  </p>
                  <p className="mt-3 text-lg font-medium text-[#88C0D0] sm:text-xl lg:text-2xl">
                    {PROFILE.headline}
                  </p>
                </ScrollReveal>

                <ScrollReveal progress={aboutProgress} range={[0.62, 0.74]} className="mb-8">
                  <p className="max-w-xl text-sm leading-relaxed text-white/80 drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)] sm:text-base lg:text-lg">
                    {PROFILE.bio}
                  </p>
                </ScrollReveal>

                <ScrollReveal progress={aboutProgress} range={[0.70, 0.82]}>
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
    </div>
  );
}
