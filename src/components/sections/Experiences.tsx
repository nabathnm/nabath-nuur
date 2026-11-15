import CatHeadPointer from "@/components/svg/CatHeadPointer";
import { useExperiences } from "@/hooks/useExperiences";
import { useLenis } from "@/lib/lenis";
import type { Experience } from "@/models/experience";
import {
    easeInOut,
    motion,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
    type MotionValue,
} from "framer-motion";
import Snap from "lenis/snap";
import { ArrowUpRight, BriefcaseBusiness, CalendarDays } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import BouncingText from "../ui/bouncing-text";

/* =====================================================
   EXPERIENCE THEME VARIATIONS (Matching HeroAboutDivider)
====================================================== */
type ExperienceTheme = "blue" | "dark" | "orange" | "green" | "white";

interface ExperienceThemeConfig {
    container: string;
    eyebrow: string;
    title: string;
    companyPill: string;
    datePill: string;
    divider: string;
    descLabel: string;
    descText: string;
    taskCard: string;
    taskDot: string;
    taskText: string;
    footerPillIcon: string;
    footerPillLabel: string;
    glowColor: string;
}

const THEME_CYCLE: ExperienceTheme[] = ["blue", "dark", "orange", "green", "white"];

const THEMES: Record<ExperienceTheme, ExperienceThemeConfig> = {
    blue: {
        container:
            "bg-gradient-to-br from-[#5E81AC] via-[#507299] to-[#3B4252] text-white border border-[#81A1C1]/40 shadow-[0_24px_50px_rgba(94,129,172,0.35)]",
        eyebrow: "text-[#88C0D0]",
        title: "text-white",
        companyPill: "bg-white/15 border-white/20 text-white",
        datePill: "bg-white/10 border-white/15 text-white/90",
        divider: "border-white/15",
        descLabel: "text-[#88C0D0]",
        descText: "text-white/90",
        taskCard:
            "border-white/15 bg-white/10 hover:bg-white/20 hover:border-white/30 text-white shadow-xs backdrop-blur-md",
        taskDot: "bg-[#88C0D0] shadow-[0_0_8px_rgba(136,192,208,0.8)]",
        taskText: "text-white/95",
        footerPillIcon: "bg-white text-[#2E3440]",
        footerPillLabel: "text-white",
        glowColor: "bg-[#88C0D0]/25",
    },
    dark: {
        container:
            "bg-gradient-to-br from-[#1E222A] via-[#2E3440] to-[#252B36] text-white border border-white/15 shadow-[0_24px_55px_rgba(0,0,0,0.55)]",
        eyebrow: "text-[#88C0D0]",
        title: "text-white",
        companyPill: "bg-[#88C0D0]/15 border-[#88C0D0]/30 text-[#88C0D0]",
        datePill: "bg-white/10 border-white/15 text-white/80",
        divider: "border-white/10",
        descLabel: "text-[#88C0D0]/85",
        descText: "text-white/85",
        taskCard:
            "border-white/10 bg-white/[0.07] hover:bg-white/[0.14] hover:border-[#88C0D0]/30 text-white/90 shadow-xs backdrop-blur-md",
        taskDot: "bg-[#88C0D0] shadow-[0_0_8px_rgba(136,192,208,0.7)]",
        taskText: "text-white/90",
        footerPillIcon: "bg-[#88C0D0] text-[#2E3440]",
        footerPillLabel: "text-[#88C0D0]",
        glowColor: "bg-[#88C0D0]/20",
    },
    orange: {
        container:
            "bg-gradient-to-br from-[#D08770] via-[#C5765F] to-[#BF616A] text-white border border-[#EBCB8B]/30 shadow-[0_24px_50px_rgba(208,135,112,0.35)]",
        eyebrow: "text-[#EBCB8B]",
        title: "text-white",
        companyPill: "bg-white/15 border-white/25 text-white",
        datePill: "bg-white/10 border-white/15 text-white/90",
        divider: "border-white/15",
        descLabel: "text-[#EBCB8B]",
        descText: "text-white/95",
        taskCard:
            "border-white/20 bg-white/15 hover:bg-white/25 hover:border-white/35 text-white shadow-xs backdrop-blur-md",
        taskDot: "bg-[#EBCB8B] shadow-[0_0_8px_rgba(235,203,139,0.8)]",
        taskText: "text-white",
        footerPillIcon: "bg-white text-[#BF616A]",
        footerPillLabel: "text-white",
        glowColor: "bg-[#EBCB8B]/25",
    },
    green: {
        container:
            "bg-gradient-to-br from-[#8FBC8F] via-[#A3BE8C] to-[#4F7942] text-[#2E3440] border border-white/50 shadow-[0_24px_50px_rgba(163,190,140,0.35)]",
        eyebrow: "text-[#2E3440]/75 font-bold",
        title: "text-[#2E3440]",
        companyPill: "bg-[#2E3440]/10 border-[#2E3440]/15 text-[#2E3440]",
        datePill: "bg-white/40 border-white/60 text-[#2E3440]",
        divider: "border-[#2E3440]/15",
        descLabel: "text-[#2E3440]/75 font-semibold",
        descText: "text-[#2E3440]/90",
        taskCard:
            "border-[#2E3440]/15 bg-white/70 hover:bg-white/90 hover:border-[#2E3440]/30 text-[#2E3440] shadow-xs backdrop-blur-md",
        taskDot: "bg-[#2E3440] shadow-[0_0_6px_rgba(46,52,64,0.4)]",
        taskText: "text-[#2E3440] font-medium",
        footerPillIcon: "bg-[#2E3440] text-white",
        footerPillLabel: "text-[#2E3440]",
        glowColor: "bg-white/30",
    },
    white: {
        container:
            "bg-[#ECEFF4] text-[#2E3440] border border-white/90 shadow-[0_22px_45px_rgba(0,0,0,0.28)]",
        eyebrow: "text-[#4C566A]/80 font-bold",
        title: "text-[#2E3440]",
        companyPill: "bg-white border-[#2E3440]/10 text-[#5E81AC]",
        datePill: "bg-white border-[#2E3440]/10 text-[#4C566A]",
        divider: "border-[#2E3440]/10",
        descLabel: "text-[#4C566A]",
        descText: "text-[#3B4252]",
        taskCard:
            "border-[#2E3440]/[0.08] bg-white hover:border-[#5E81AC]/40 text-[#3B4252] shadow-xs",
        taskDot: "bg-[#5E81AC]",
        taskText: "text-[#3B4252] font-medium",
        footerPillIcon: "bg-[#2E3440] text-white",
        footerPillLabel: "text-[#2E3440]",
        glowColor: "bg-[#88C0D0]/20",
    },
};

function getExperienceTheme(index: number): ExperienceTheme {
    return THEME_CYCLE[index % THEME_CYCLE.length];
}

function getArtType(role: string, index: number): "mobile" | "frontend" | "algorithm" | "network" | "blocks" {
    const r = role.toLowerCase();
    if (r.includes("mobile") || r.includes("flutter") || r.includes("android")) return "mobile";
    if (r.includes("front") || r.includes("web") || r.includes("react")) return "frontend";
    if (r.includes("practicum") || r.includes("algorithm") || r.includes("assistant")) return "algorithm";
    if (r.includes("public") || r.includes("relation") || r.includes("media")) return "network";
    const arts: Array<"mobile" | "frontend" | "algorithm" | "network" | "blocks"> = [
        "mobile",
        "frontend",
        "algorithm",
        "network",
        "blocks",
    ];
    return arts[index % arts.length];
}

/* =====================================================
   3D ARTWORK ACCENTS (Matching HeroAboutDivider aesthetic)
====================================================== */
function ExperienceArtwork({
    type,
}: {
    type: "mobile" | "frontend" | "algorithm" | "network" | "blocks";
}) {
    switch (type) {
        case "mobile":
            return (
                <svg width="105" height="90" viewBox="0 0 110 95" fill="none" className="drop-shadow-[0_16px_24px_rgba(0,0,0,0.32)]">
                    <rect x="25" y="8" width="56" height="80" rx="14" fill="#2E3440" stroke="#88C0D0" strokeWidth="2.5" />
                    <rect x="32" y="18" width="42" height="58" rx="8" fill="#3B4252" />
                    <rect x="36" y="24" width="34" height="12" rx="4" fill="#88C0D0" fillOpacity="0.4" />
                    <rect x="36" y="40" width="20" height="6" rx="2" fill="#81A1C1" />
                    <rect x="36" y="49" width="30" height="6" rx="2" fill="#ECEFF4" fillOpacity="0.6" />
                    <rect x="36" y="58" width="24" height="6" rx="2" fill="#A3BE8C" fillOpacity="0.7" />
                    <circle cx="53" cy="13" r="1.5" fill="#88C0D0" />
                    <rect x="62" y="32" width="34" height="30" rx="8" fill="#5E81AC" stroke="white" strokeWidth="1.5" className="drop-shadow-md" />
                    <circle cx="73" cy="42" r="4" fill="#EBCB8B" />
                    <rect x="70" y="50" width="18" height="4" rx="2" fill="white" fillOpacity="0.8" />
                </svg>
            );
        case "frontend":
            return (
                <svg width="105" height="90" viewBox="0 0 110 95" fill="none" className="drop-shadow-[0_16px_24px_rgba(0,0,0,0.4)]">
                    <rect x="15" y="12" width="76" height="68" rx="12" fill="#1E222A" stroke="#88C0D0" strokeWidth="2" strokeOpacity="0.6" />
                    <rect x="15" y="12" width="76" height="16" rx="12" fill="#2E3440" />
                    <circle cx="25" cy="20" r="2.5" fill="#BF616A" />
                    <circle cx="32" cy="20" r="2.5" fill="#EBCB8B" />
                    <circle cx="39" cy="20" r="2.5" fill="#A3BE8C" />
                    <rect x="24" y="36" width="32" height="5" rx="2" fill="#88C0D0" />
                    <rect x="24" y="46" width="48" height="5" rx="2" fill="#81A1C1" fillOpacity="0.7" />
                    <rect x="32" y="56" width="38" height="5" rx="2" fill="#A3BE8C" fillOpacity="0.8" />
                    <rect x="24" y="66" width="22" height="5" rx="2" fill="#D08770" />
                    <rect x="64" y="24" width="32" height="30" rx="8" fill="#2E3440" stroke="#88C0D0" strokeWidth="1.5" className="drop-shadow-lg" />
                    <path d="M72 39L76 43L72 47M84 39L80 43L84 47" stroke="#88C0D0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case "algorithm":
            return (
                <svg width="105" height="90" viewBox="0 0 110 95" fill="none" className="drop-shadow-[0_16px_24px_rgba(208,135,112,0.35)]">
                    <g transform="translate(18, 10)">
                        <rect x="28" y="4" width="20" height="20" rx="5" fill="#D08770" stroke="#EBCB8B" strokeWidth="2" />
                        <text x="38" y="18" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">01</text>
                        <line x1="28" y1="20" x2="16" y2="34" stroke="#EBCB8B" strokeWidth="2" strokeDasharray="3 2" />
                        <rect x="6" y="34" width="18" height="18" rx="4" fill="#C5765F" stroke="white" strokeWidth="1.5" />
                        <circle cx="15" cy="43" r="3" fill="#EBCB8B" />
                        <line x1="48" y1="20" x2="60" y2="34" stroke="#EBCB8B" strokeWidth="2" strokeDasharray="3 2" />
                        <rect x="52" y="34" width="18" height="18" rx="4" fill="#BF616A" stroke="white" strokeWidth="1.5" />
                        <circle cx="61" cy="43" r="3" fill="white" />
                        <line x1="15" y1="52" x2="36" y2="60" stroke="#EBCB8B" strokeWidth="1.5" />
                        <rect x="28" y="56" width="22" height="16" rx="4" fill="#2E3440" stroke="#EBCB8B" strokeWidth="1.5" />
                        <text x="39" y="68" fill="#EBCB8B" fontSize="9" fontWeight="bold" textAnchor="middle">f(x)</text>
                    </g>
                </svg>
            );
        case "network":
            return (
                <svg width="105" height="90" viewBox="0 0 110 95" fill="none" className="drop-shadow-[0_16px_24px_rgba(163,190,140,0.35)]">
                    <g transform="translate(16, 10)">
                        <circle cx="38" cy="38" r="28" stroke="#2E3440" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
                        <circle cx="38" cy="38" r="16" fill="#8FBC8F" stroke="#2E3440" strokeWidth="2" />
                        <path d="M34 34L42 38L34 42V34Z" fill="#2E3440" />
                        <line x1="38" y1="22" x2="38" y2="6" stroke="#2E3440" strokeWidth="2" />
                        <circle cx="38" cy="6" r="6" fill="#A3BE8C" stroke="#2E3440" strokeWidth="1.5" />
                        <line x1="24" y1="44" x2="10" y2="56" stroke="#2E3440" strokeWidth="2" />
                        <circle cx="10" cy="56" r="6" fill="#EBCB8B" stroke="#2E3440" strokeWidth="1.5" />
                        <line x1="52" y1="44" x2="66" y2="56" stroke="#2E3440" strokeWidth="2" />
                        <circle cx="66" cy="56" r="6" fill="#4F7942" stroke="#2E3440" strokeWidth="1.5" />
                    </g>
                </svg>
            );
        case "blocks":
        default:
            return (
                <svg width="105" height="90" viewBox="0 0 110 95" fill="none" className="drop-shadow-[0_16px_24px_rgba(0,0,0,0.25)]">
                    <g transform="translate(15, 8)">
                        <path d="M40 8L68 24V56L40 72L12 56V24L40 8Z" fill="#5E81AC" fillOpacity="0.25" stroke="#5E81AC" strokeWidth="2" />
                        <path d="M40 8L68 24L40 40L12 24L40 8Z" fill="#88C0D0" fillOpacity="0.8" />
                        <path d="M40 40V72L12 56V24L40 40Z" fill="#5E81AC" />
                        <path d="M40 40L68 24V56L40 72V40Z" fill="#4C566A" />
                    </g>
                </svg>
            );
    }
}

/* =====================================================
   CARD STACK CONFIGURATION
   One generic generator for any N (replaces the 4-card preset,
   which it reproduces exactly: [0, .093, .24, .427, .573, .76, .907, 1]).
   Pure translate-driven stacking.
====================================================== */
const ENTER_Y = 1000;
// Vertical peek (px) of cards buried under the active one, by depth
const STACK_OFFSETS = [0, 14, 26, 36];

function getCardConfig(index: number, total: number) {
    const zIndex = (index + 1) * 10;

    if (total <= 1) {
        return { input: [0, 1], y: [0, 0], zIndex };
    }

    const step = 1 / (total - 1);
    const half = step * 0.22;
    const clamp = (v: number) => Math.min(1, Math.max(0, v));

    // [progress, translateY] pairs — building them together guarantees
    // input/output arrays always have the same length and stay ascending.
    const points: Array<[number, number]> = [];

    if (index === 0) {
        points.push([0, 0]);
    } else {
        const center = (index - 0.5) * step;
        points.push(
            [0, ENTER_Y],
            [clamp(center - half), ENTER_Y],
            [clamp(center + half), 0]
        );
    }

    let currentY = 0;
    for (let j = index + 1; j < total; j++) {
        const center = (j - 0.5) * step;
        const depth = Math.min(j - index, STACK_OFFSETS.length - 1);
        const targetY = -STACK_OFFSETS[depth];

        points.push([clamp(center - half), currentY], [clamp(center + half), targetY]);
        currentY = targetY;
    }

    points.push([1, currentY]);

    return {
        input: points.map(([x]) => x),
        y: points.map(([, v]) => v),
        zIndex,
    };
}

/* =====================================================
   STACK CARD
====================================================== */
function StackCard({
    experience,
    index,
    total,
    isActive,
    scrollYProgress,
}: {
    experience: Experience;
    index: number;
    total: number;
    isActive: boolean;
    scrollYProgress: MotionValue<number>;
}) {
    const config = getCardConfig(index, total);
    const y = useTransform(scrollYProgress, config.input, config.y, { ease: easeInOut });
    const themeName = getExperienceTheme(index);
    const theme = THEMES[themeName];
    const artType = getArtType(experience.role, index);

    return (
        <motion.div
            style={{ y, zIndex: config.zIndex }}
            aria-hidden={!isActive}
            className={`group absolute inset-0 flex w-full flex-col justify-between overflow-hidden rounded-[2.2rem] p-6 will-change-transform sm:p-7 lg:p-8 transition-all duration-300 ${theme.container}`}
        >
            {/* Ambient Corner Reflection (Matching HeroAboutDivider) */}
            <div
                className={`pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl transition-opacity group-hover:opacity-100 opacity-60 ${theme.glowColor}`}
            />
            <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-white/5 blur-2xl" />

            {/* 3D Decorative Art in Top-Right Corner */}
            <div className="pointer-events-none absolute top-4 right-4 sm:top-5 sm:right-6 z-10 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3">
                <ExperienceArtwork type={artType} />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between gap-4 sm:gap-5">
                {/* Header: Company & Date */}
                <div className="pr-20 sm:pr-24">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] border shadow-xs ${theme.companyPill}`}
                        >
                            <BriefcaseBusiness size={12} className="shrink-0" />
                            <span>{experience.company}</span>
                        </span>

                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border shadow-xs ${theme.datePill}`}
                        >
                            <CalendarDays size={12} className="shrink-0 opacity-75" />
                            <span>
                                {experience.start} — {experience.end}
                            </span>
                        </span>
                    </div>

                    <span
                        className={`text-[10px] font-bold uppercase tracking-[0.25em] ${theme.eyebrow}`}
                    >
                        EXPERIENCE #{pad(index + 1)}
                    </span>
                    <h3
                        title={experience.role}
                        className={`mt-0.5 text-xl font-bold leading-tight tracking-tight sm:text-2xl lg:text-3xl xl:text-4xl ${theme.title}`}
                    >
                        {experience.role}
                    </h3>
                </div>

                <div className={`h-px w-full border-t ${theme.divider}`} />

                {/* Description */}
                <div>
                    <p
                        className={`mb-1 text-[11px] font-bold uppercase tracking-[0.2em] ${theme.descLabel}`}
                    >
                        About the role
                    </p>
                    <p
                        className={`text-xs font-normal leading-relaxed sm:text-sm lg:text-[15px] ${theme.descText}`}
                    >
                        {experience.description}
                    </p>
                </div>

                {/* Responsibilities */}
                {experience.tasks && experience.tasks.length > 0 && (
                    <div className="mt-auto">
                        <p
                            className={`mb-2 text-[11px] font-bold uppercase tracking-[0.2em] ${theme.descLabel}`}
                        >
                            Key Responsibilities
                        </p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
                            {experience.tasks.map((task, idx) => (
                                <div
                                    key={`${experience.id}-${idx}`}
                                    className={`flex items-start gap-2.5 rounded-xl border p-2.5 sm:p-3 transition-all duration-300 ${theme.taskCard}`}
                                >
                                    <span
                                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${theme.taskDot}`}
                                    />
                                    <p
                                        className={`text-xs leading-relaxed sm:text-[13px] ${theme.taskText}`}
                                    >
                                        {task}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Card Footer (Matching HeroAboutDivider aesthetic) */}
                <div
                    className={`mt-2 flex items-center justify-between pt-2.5 border-t ${theme.divider}`}
                >
                    <div className="flex items-center gap-2">
                        <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45 shadow-xs ${theme.footerPillIcon}`}
                        >
                            <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                        </span>
                        <span
                            className={`text-[11px] font-bold tracking-[0.16em] uppercase ${theme.footerPillLabel}`}
                        >
                            CAREER STAGE {pad(index + 1)}
                        </span>
                    </div>

                    <span
                        className={`text-[11px] font-mono font-bold tracking-widest uppercase opacity-75 ${theme.eyebrow}`}
                    >
                        {pad(index + 1)} / {pad(total)}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

/* =====================================================
   SNAP TIMING & SPEED CONFIGURATION
====================================================== */
const EXPERIENCE_SNAP_CONFIG = {
    // Snap travel duration (seconds). Higher = slower, calmer.
    duration: 1.35,
    // Quartic ease-out: smooth glide without an aggressive start
    easing: (t: number) => 1 - Math.pow(1 - t, 4),
    // Wait (ms) after the user stops scrolling before snapping
    debounce: 110,
    // Proximity snap reach
    distanceThreshold: "40%" as const,
};

const pad = (n: number) => String(n).padStart(2, "0");

/* =====================================================
   MAIN COMPONENT
====================================================== */
export default function Experiences() {
    const { experiences } = useExperiences();
    const lenis = useLenis();
    const reduce = useReducedMotion() ?? false;
    const trackRef = useRef<HTMLDivElement>(null);
    const isClickScrollingRef = useRef(false);
    const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [activeId, setActiveId] = useState<number>(experiences[0]?.id ?? 1);

    // Keep activeId valid when the experiences array (re)loads
    useEffect(() => {
        if (experiences.length > 0 && !experiences.some((exp) => exp.id === activeId)) {
            setActiveId(experiences[0].id);
        }
    }, [experiences, activeId]);

    const activeIndex = Math.max(
        0,
        experiences.findIndex((exp) => exp.id === activeId)
    );

    // Scroll progress of the sticky track (0 -> 1)
    const { scrollYProgress } = useScroll({
        target: trackRef,
        offset: ["start start", "end end"],
    });

    // Spring smoothing (skipped when the user prefers reduced motion)
    const smoothProgress = useSpring(scrollYProgress, {
        damping: 28,
        stiffness: 90,
        mass: 0.45,
    });
    const stackProgress = reduce ? scrollYProgress : smoothProgress;

    // Release the programmatic-scroll lock (with optional delay), cancelling pending timers
    const releaseClickLock = useCallback((delay = 0) => {
        if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
        if (delay <= 0) {
            isClickScrollingRef.current = false;
            return;
        }
        unlockTimerRef.current = setTimeout(() => {
            isClickScrollingRef.current = false;
        }, delay);
    }, []);

    // Update active experience from scroll position
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (isClickScrollingRef.current || experiences.length === 0) return;

        const index = Math.min(
            experiences.length - 1,
            Math.max(0, Math.round(latest * (experiences.length - 1)))
        );
        const targetId = experiences[index]?.id;

        if (targetId !== undefined && targetId !== activeId) {
            setActiveId(targetId);
        }
    });

    // Lenis proximity snap (CSS scroll-snap classes removed: the section is not
    // a scroll container, so they did nothing and could fight with Lenis).
    useEffect(() => {
        if (!lenis || reduce || experiences.length <= 1) return;

        const snap = new Snap(lenis, {
            type: "proximity",
            distanceThreshold: EXPERIENCE_SNAP_CONFIG.distanceThreshold,
            duration: EXPERIENCE_SNAP_CONFIG.duration,
            easing: EXPERIENCE_SNAP_CONFIG.easing,
            debounce: EXPERIENCE_SNAP_CONFIG.debounce,
        });

        const section = trackRef.current;
        if (section) {
            const snapPoints = section.querySelectorAll<HTMLElement>("[data-experience-snap]");
            if (snapPoints.length > 0) {
                snap.addElements(Array.from(snapPoints), { align: "start" });
            }
        }

        return () => snap.destroy();
    }, [lenis, reduce, experiences]);

    // Cancel programmatic scroll lock on manual wheel / touch; clear timers on unmount
    useEffect(() => {
        const cancel = () => releaseClickLock();

        window.addEventListener("wheel", cancel, { passive: true });
        window.addEventListener("touchstart", cancel, { passive: true });

        return () => {
            window.removeEventListener("wheel", cancel);
            window.removeEventListener("touchstart", cancel);
            if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
        };
    }, [releaseClickLock]);

    // Programmatic scroll to a given experience stage
    const scrollToExperience = (targetIndex: number) => {
        const target = experiences[targetIndex];
        if (!trackRef.current || !target) return;

        isClickScrollingRef.current = true;
        setActiveId(target.id);

        const trackEl = trackRef.current;
        const trackTop = window.scrollY + trackEl.getBoundingClientRect().top;
        const totalScrollable = trackEl.offsetHeight - window.innerHeight;
        const targetProgress = targetIndex / Math.max(1, experiences.length - 1);
        const targetScrollY = trackTop + totalScrollable * targetProgress;

        if (lenis) {
            lenis.scrollTo(targetScrollY, {
                immediate: reduce,
                duration: EXPERIENCE_SNAP_CONFIG.duration,
                easing: EXPERIENCE_SNAP_CONFIG.easing,
                onComplete: () => releaseClickLock(60),
            });
            if (reduce) releaseClickLock(60);
        } else {
            window.scrollTo({ top: targetScrollY, behavior: reduce ? "auto" : "smooth" });
            releaseClickLock(750);
        }
    };

    // Keyboard navigation (arrows + Home/End) with roving focus
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
        const last = experiences.length - 1;
        let next: number | null = null;

        switch (e.key) {
            case "ArrowDown":
            case "ArrowRight":
                next = Math.min(last, index + 1);
                break;
            case "ArrowUp":
            case "ArrowLeft":
                next = Math.max(0, index - 1);
                break;
            case "Home":
                next = 0;
                break;
            case "End":
                next = last;
                break;
        }

        if (next === null) return;
        e.preventDefault();
        scrollToExperience(next);

        // Move focus to the newly selected tab within the same tablist
        const tabs = e.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]');
        tabs?.[next]?.focus();
    };

    if (experiences.length === 0) return null;

    const trackHeight =
        experiences.length <= 1 ? "100vh" : `${(experiences.length - 1) * 70 + 100}vh`;

    return (
        <section
            id="experiences"
            aria-labelledby="experiences-heading"
            className="relative overflow-x-clip bg-[#2E3440] text-white"
        >
            {/* SCROLL TRACK */}
            <div ref={trackRef} style={{ height: trackHeight }} className="relative z-10">
                {/* Snap targets (consumed by Lenis Snap) */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 bottom-[100vh]"
                >
                    {experiences.map((exp, index) => (
                        <div
                            key={`snap-${exp.id}`}
                            data-experience-snap
                            style={{
                                top: `${(index / Math.max(1, experiences.length - 1)) * 100}%`,
                            }}
                            className="absolute inset-x-0 h-px"
                        />
                    ))}
                </div>

                {/* STICKY STAGE */}
                <div className="sticky top-0 flex h-dvh w-full flex-col justify-center overflow-hidden">
                    {/* Mini header */}
                    <div className="pointer-events-none absolute inset-x-0 top-10 z-20">
                        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 md:px-8 lg:px-16">
                            <div className="flex items-center gap-3">
                                <span className="h-px w-8 bg-white/30" />
                                <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                                    Experiences
                                </span>
                            </div>

                            <span className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                                ({pad(experiences.length)}) Selected
                            </span>
                        </div>
                    </div>

                          <div className="relative z-10 mx-auto mb-0 w-full max-w-[1600px] px-6 pt-6 text-3xl font-bold leading-[1.12] text-white md:px-8 md:text-5xl lg:px-16 lg:text-[4.6rem]">
                            <BouncingText intensity="subtle" className="w-240">
                              Technologies used across
                            </BouncingText>
                            <BouncingText intensity="subtle" className="w-240 pt-2">
                              Software Development.
                            </BouncingText>
                          </div>

                    <div className="relative z-10 w-full px-6 md:px-8 lg:px-12">
                        <div className="mx-auto w-full max-w-[1600px]">
                            {/* MOBILE / TABLET TABS (< lg) */}
                            <div
                                role="tablist"
                                aria-label="Experiences navigation tabs"
                                className="no-scrollbar mb-6 flex items-center gap-2 overflow-x-auto pb-1 lg:hidden"
                            >
                                {experiences.map((experience, index) => {
                                    const active = experience.id === activeId;
                                    return (
                                        <button
                                            key={experience.id}
                                            type="button"
                                            role="tab"
                                            aria-selected={active}
                                            aria-label={`Experience ${index + 1}: ${experience.role} at ${experience.company}`}
                                            tabIndex={active ? 0 : -1}
                                            onClick={() => scrollToExperience(index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#88C0D0] ${
                                                active
                                                    ? "border-[#88C0D0]/40 bg-[#88C0D0]/10 text-white"
                                                    : "border-white/10 bg-white/2 text-white/40 hover:text-white/70"
                                            }`}
                                        >
                                            {active && <CatHeadPointer className="h-3.5 w-3.5 shrink-0" />}
                                            <span>{experience.company}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-8 xl:gap-12 2xl:gap-16">
                                {/* LEFT — desktop experience list */}
                                <div
                                    role="tablist"
                                    aria-label="Experiences list"
                                    aria-orientation="vertical"
                                    className="hidden flex-col justify-center border-y border-white/[0.06] lg:col-span-6 lg:flex"
                                >
    {experiences.map((experience, index) => {
        const active = experience.id === activeId;

        return (
            <button
                key={experience.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Experience ${index + 1}: ${experience.role} at ${experience.company}`}
                tabIndex={active ? 0 : -1}
                onClick={() => scrollToExperience(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="group relative flex w-full items-center border-b border-white/[0.06] py-3 text-left transition-colors duration-300 last:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#88C0D0]"
            >
                <div className="flex items-center gap-3">
                    {/* Active indicator */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                        {active && (
                            <motion.div
                                layoutId="activeExperienceIndicator"
                                transition={
                                    reduce
                                        ? { duration: 0 }
                                        : {
                                            type: "spring",
                                            stiffness: 380,
                                            damping: 30,
                                        }
                                }
                            >
                                <CatHeadPointer className="h-8 w-8 drop-shadow-[0_2px_10px_rgba(136,192,208,0.2)]" />
                            </motion.div>
                        )}
                    </div>

                    {/* Company & Role */}
                    <div className="min-w-0">
                        <span
                            className={`block truncate text-xl font-semibold tracking-tight transition-all duration-300 ${
                                active
                                    ? "translate-x-1 text-white"
                                    : "text-white/35 group-hover:text-white/70"
                            }`}
                        >
                            {experience.company}
                        </span>
                        {active && (
                            <span className="block text-xs font-medium text-[#88C0D0] transition-opacity duration-300">
                                {experience.role}
                            </span>
                        )}
                    </div>
                </div>
            </button>
        );
    })}
</div>


                                {/* RIGHT — scroll-driven card stack */}
                                <div className="lg:col-span-6">
                                    <div className="relative w-full pt-9 sm:pt-10">
                                        <div className="relative h-[490px] w-full sm:h-[510px] lg:h-[530px] xl:h-[540px]">
                                            {experiences.map((experience, index) => (
                                                <StackCard
                                                    key={experience.id}
                                                    experience={experience}
                                                    index={index}
                                                    total={experiences.length}
                                                    isActive={index === activeIndex}
                                                    scrollYProgress={stackProgress}
                                                />
                                            ))}
                                        </div>
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