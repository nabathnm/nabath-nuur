import CatHeadPointer from "@/components/svg/CatHeadPointer";
import { useExperiences } from "@/hooks/useExperiences";
import { useLenis } from "@/lib/lenis";
import type { Experience } from "@/models/experience";
import {
    AnimatePresence,
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
import { BriefcaseBusiness, CalendarDays, ChevronDown, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* =====================================================
   DYNAMIC CARD STACK CONFIGURATION GENERATOR
   Supports any total number of experiences loaded from Turso
   Pure translate-driven stacking (no opacity/scale fade)
====================================================== */
function getCardConfig(index: number, total: number) {
    const zIndex = (index + 1) * 10;

    if (total <= 1) {
        return {
            input: [0, 1],
            y: [0, 0],
            zIndex,
        };
    }

    // High-precision tuned preset for 4 experiences (pure scroll translation)
    // Symmetrically aligned with Lenis snap targets at [0.0, 0.333, 0.667, 1.0]
    if (total === 4) {
        const presets = [
            {
                input: [0, 0.10, 0.23, 0.43, 0.57, 0.77, 0.90, 1.0],
                y: [0, 0, -14, -14, -26, -26, -36, -36],
                zIndex: 10,
            },
            {
                input: [0, 0.10, 0.23, 0.43, 0.57, 0.77, 0.90, 1.0],
                y: [1000, 1000, 0, 0, -14, -14, -26, -26],
                zIndex: 20,
            },
            {
                input: [0, 0.43, 0.57, 0.77, 0.90, 1.0],
                y: [1000, 1000, 0, 0, -14, -14],
                zIndex: 30,
            },
            {
                input: [0, 0.77, 0.90, 1.0],
                y: [1000, 1000, 0, 0],
                zIndex: 40,
            },
        ];
        return presets[index] ?? presets[0];
    }

    // Dynamic keypoints generation for arbitrary N (pure translation)
    const maxIdx = Math.max(1, total - 1);
    const step = 1 / maxIdx;
    const transitionHalf = step * 0.22;

    const input: number[] = [0];
    const y: number[] = [];

    if (index > 0) {
        const startEnter = Math.max(0, (index - 0.5) * step - transitionHalf);
        const fullyEntered = (index - 0.5) * step + transitionHalf;

        input.push(startEnter);
        y.push(1000);

        input.push(fullyEntered);
        y.push(0);
    } else {
        y.push(0);
    }

    const activeUntil = (index + 0.5) * step - transitionHalf;
    if (activeUntil < 1.0 && index < total - 1) {
        input.push(activeUntil);
        y.push(0);
    }

    for (let j = index + 1; j < total; j++) {
        const coveredAt = (j - 0.5) * step + transitionHalf;
        const depth = j - index;
        const targetY = -Math.min(36, depth * 12);

        input.push(Math.min(1.0, coveredAt));
        y.push(targetY);
    }

    if (input[input.length - 1] < 1.0) {
        input.push(1.0);
        y.push(y[y.length - 1]);
    }

    return { input, y, zIndex };
}

/* =====================================================
   STACK CARD COMPONENT (SOLID LIGHT MODE FOR HIGH CONTRAST)
   Renders an individual solid card within the layered card stack
====================================================== */
function StackCard({
    experience,
    index,
    total,
    scrollYProgress,
}: {
    experience: Experience;
    index: number;
    total: number;
    scrollYProgress: MotionValue<number>;
}) {
    const config = getCardConfig(index, total);

    // Smooth scroll-driven translation with ease-in-out curve
    const y = useTransform(scrollYProgress, config.input, config.y, { ease: easeInOut });

    return (
        <motion.div
            style={{
                y,
                zIndex: config.zIndex,
            }}
            className="absolute inset-0 flex w-full flex-col justify-between overflow-hidden rounded-[2rem] border border-white/80 bg-[#ECEFF4] p-6 sm:p-7 lg:p-8"
        >
            <div className="relative z-10 flex h-full flex-col justify-between gap-5 sm:gap-6">
                {/* Header: Company Badge, Role, Period */}
                <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#2E3440]/10 bg-white shadow-xs">
                                <BriefcaseBusiness
                                    size={14}
                                    className="text-[#5E81AC]"
                                />
                            </span>
                            <span className="text-xs uppercase tracking-[0.18em] font-bold text-[#5E81AC]">
                                {experience.company}
                            </span>
                            <span className="text-[#2E3440]/30">•</span>
                            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#4C566A]">
                                {experience.type}
                            </span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#2E3440]/10 bg-white px-3 py-1 text-xs font-medium text-[#4C566A] shadow-xs">
                            <CalendarDays
                                size={13}
                                className="text-[#5E81AC]"
                            />
                            <span>
                                {experience.start} — {experience.end}
                            </span>
                        </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-[#2E3440] leading-tight whitespace-nowrap truncate">
                        {experience.role}
                    </h3>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-[#2E3440]/10" />

                {/* Description */}
                <div>
                    <p className="mb-1.5 text-xs uppercase tracking-[0.2em] text-[#4C566A] font-semibold">
                        About the role
                    </p>
                    <p className="text-xs sm:text-sm lg:text-base leading-relaxed text-[#3B4252] font-normal">
                        {experience.description}
                    </p>
                </div>

                {/* Responsibilities */}
                {experience.tasks && experience.tasks.length > 0 && (
                    <div>
                        <p className="mb-2.5 text-xs uppercase tracking-[0.2em] text-[#4C566A] font-semibold">
                            Responsibilities
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                            {experience.tasks.map((task, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2.5 rounded-xl border border-[#2E3440]/[0.08] bg-white p-2.5 sm:p-3 shadow-xs transition-colors hover:border-[#5E81AC]/40"
                                >
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5E81AC]" />
                                    <p className="text-xs sm:text-[13px] leading-relaxed text-[#3B4252] font-medium">
                                        {task}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bottom: Location */}
                <div className="pt-2 flex items-center justify-between border-t border-[#2E3440]/10 mt-auto text-xs text-[#4C566A] font-medium">
                    <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#5E81AC]" />
                        <span>{experience.location}</span>
                    </div>

                    <span className="text-[11px] uppercase tracking-wider text-[#4C566A]/70 font-semibold">
                        {experience.type}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

/* =====================================================
   EXPERIENCE SNAP TIMING & SPEED CONFIGURATION
   Kontrol kecepatan, kurva easing, dan durasi pergerakan snap
====================================================== */
const EXPERIENCE_SNAP_CONFIG = {
    // Durasi pergerakan snap dalam detik (naikkan untuk gerakan lebih lambat & santai)
    duration: 1.35,
    // Easing curve: Quartic ease-out menghasilkan glide halus tanpa sentakan awal yang agresif
    easing: (t: number) => 1 - Math.pow(1 - t, 4),
    // Waktu tunggu (ms) setelah user berhenti scrolling sebelum snap bekerja
    debounce: 110,
    // Jarak jangkauan proximity snap
    distanceThreshold: "40%" as const,
};

const pad = (n: number) => String(n).padStart(2, "0");

/* =====================================================
   MAIN EXPERIENCES COMPONENT
   Connected dynamically to Turso Cloud Database
====================================================== */
export default function Experiences() {
    const { experiences } = useExperiences();
    const lenis = useLenis();
    const reduce = useReducedMotion() ?? false;
    const trackRef = useRef<HTMLDivElement>(null);
    const isClickScrollingRef = useRef(false);

    const [activeId, setActiveId] = useState<number>(experiences[0]?.id ?? 1);

    // Keep activeId synchronized whenever experiences array loads
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

    // Spring interpolation to smooth out scroll ticks and create fluid organic motion
    const smoothProgress = useSpring(scrollYProgress, {
        damping: 28,
        stiffness: 90,
        mass: 0.45,
    });

    // Update active experience smoothly on scroll (aligned with snap stage thresholds)
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (isClickScrollingRef.current || experiences.length === 0) return;

        // Map [0, 1] across the N experiences from Turso
        const index = Math.min(
            experiences.length - 1,
            Math.max(0, Math.round(latest * (experiences.length - 1)))
        );
        const currentTargetId = experiences[index]?.id;

        if (currentTargetId && currentTargetId !== activeId) {
            setActiveId(currentTargetId);
        }
    });

    // Smooth scroll snap using lenis/snap with controlled gentle timing
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

        return () => {
            snap.destroy();
        };
    }, [lenis, reduce, experiences]);

    // Cancel programmatic scroll lock if user intervenes with manual wheel/touch
    useEffect(() => {
        const cancelClickScroll = () => {
            isClickScrollingRef.current = false;
        };

        window.addEventListener("wheel", cancelClickScroll, { passive: true });
        window.addEventListener("touchstart", cancelClickScroll, { passive: true });

        return () => {
            window.removeEventListener("wheel", cancelClickScroll);
            window.removeEventListener("touchstart", cancelClickScroll);
        };
    }, []);

    // Smooth programmatic scroll directly to the selected experience stage
    const scrollToExperience = (targetIndex: number) => {
        if (!trackRef.current || experiences.length === 0) return;

        isClickScrollingRef.current = true;
        setActiveId(experiences[targetIndex].id);

        const trackEl = trackRef.current;
        const rect = trackEl.getBoundingClientRect();
        const trackTop = window.scrollY + rect.top;
        const totalScrollable = trackEl.offsetHeight - window.innerHeight;

        // Target the exact snap position for this experience
        const targetProgress = targetIndex / Math.max(1, experiences.length - 1);
        const targetScrollY = trackTop + totalScrollable * targetProgress;

        if (lenis) {
            lenis.scrollTo(targetScrollY, {
                duration: EXPERIENCE_SNAP_CONFIG.duration,
                easing: EXPERIENCE_SNAP_CONFIG.easing,
                onComplete: () => {
                    setTimeout(() => {
                        isClickScrollingRef.current = false;
                    }, 60);
                },
            });
        } else {
            window.scrollTo({
                top: targetScrollY,
                behavior: "smooth",
            });
            setTimeout(() => {
                isClickScrollingRef.current = false;
            }, 750);
        }
    };

    // Accessible keyboard arrow key navigation
    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            const nextIndex = Math.min(experiences.length - 1, index + 1);
            scrollToExperience(nextIndex);
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            const prevIndex = Math.max(0, index - 1);
            scrollToExperience(prevIndex);
        }
    };

    // Compact track height so user doesn't need to scroll excessively to shift between cards
    const trackHeight =
        experiences.length <= 1
            ? "100vh"
            : `${(experiences.length - 1) * 70 + 100}vh`;

    return (
        <section
            id="experiences"
            className="relative overflow-x-clip bg-[#2E3440] text-white snap-y snap-proximity"
        >
            {/* =====================================================
                SCROLL TRACK (Multi-stage scroll canvas)
                Height dynamically calculated from total Turso records
            ====================================================== */}
            <div
                ref={trackRef}
                style={{ height: trackHeight }}
                className="relative z-10"
            >
                {/* Snap step targets for Lenis Snap & CSS scroll-snap */}
                <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[100vh]">
                    {experiences.map((exp, index) => (
                        <div
                            key={`snap-${exp.id}`}
                            data-experience-snap
                            style={{
                                top: `${(index / Math.max(1, experiences.length - 1)) * 100}%`,
                            }}
                            className="absolute inset-x-0 h-px snap-start snap-always"
                        />
                    ))}
                </div>
                {/* =====================================================
                    STICKY STAGE (Locked in viewport during exploration)
                ====================================================== */}
                <div className="relative sticky top-0 flex h-screen min-h-dvh w-full flex-col justify-center overflow-hidden">
                    {/* =====================================================
                        SECTION MINI HEADER (Consistent with Projects & Tools)
                    ====================================================== */}
                    <div className="pointer-events-none absolute top-10 inset-x-0 z-20">
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

                    <div className="relative z-10 text-6xl font-bold pt-4 mx-auto mb-6 w-full max-w-[1600px] px-6 md:px-8 lg:px-16 text-white/50">
                        My Journey Through the Tech Landscape.
                    </div>
                    <div className="relative z-10 w-full px-6 md:px-8 lg:px-16 pt-12 sm:pt-8 lg:pt-0">
                        <div className="mx-auto w-full max-w-[1600px]">
                            {/* =====================================================
                                MOBILE / TABLET EXPERIENCE TABS (< lg)
                            ====================================================== */}
                            <div
                                role="tablist"
                                aria-label="Experiences navigation tabs"
                                className="mb-6 flex lg:hidden items-center gap-2 overflow-x-auto no-scrollbar pb-1"
                            >
                                {experiences.map((experience, index) => {
                                    const active = experience.id === activeId;
                                    return (
                                        <button
                                            key={experience.id}
                                            aria-selected={active}
                                            aria-label={`Experience ${index + 1}: ${experience.role} at ${experience.company}`}
                                            onClick={() => scrollToExperience(index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium whitespace-nowrap transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#88C0D0] ${
                                                active
                                                    ? "border-[#88C0D0]/40 bg-[#88C0D0]/10 text-white"
                                                    : "border-white/10 bg-white/2 text-white/40 hover:text-white/70"
                                            }`}
                                        >
                                            {active && (
                                                <CatHeadPointer className="h-3.5 w-3.5 shrink-0" />
                                            )}
                                            <span className="whitespace-nowrap">{experience.company}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* =====================================================
                                SHOWCASE COMPOSITION (2-COLUMN ON LG)
                                1. Left: Experience List (Desktop vertical list preserved)
                                2. Right: Scroll-Driven Card Stack (Dynamic Turso Stack)
                            ====================================================== */}
                            <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-8 xl:gap-12 2xl:gap-16 items-center">
                                {/* =================================================
                                    LEFT COLUMN — EXPERIENCE LIST (DESKTOP)
                                    Fully preserved as edited by user with horizontal grid lines
                                ================================================== */}
                                <div
                                    role="tablist"
                                    aria-label="Experiences list"
                                    className="hidden lg:flex lg:col-span-5 flex-col justify-center divide-y divide-white/10 border-y border-white/10"
                                >
                                    {experiences.map((experience, index) => {
                                        const active = experience.id === activeId;
                                        const experienceNumber = index + 1;

                                        return (
                                            <button
                                                key={experience.id}
                                                role="tab"
                                                aria-selected={active}
                                                aria-label={`Experience ${experienceNumber}: ${experience.role} at ${experience.company}`}
                                                tabIndex={active ? 0 : -1}
                                                onClick={() => scrollToExperience(index)}
                                                onKeyDown={(e) => handleKeyDown(e, index)}
                                                className="group relative flex w-full items-center text-left py-3.5 sm:py-4 lg:py-5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-[#2E3440]"
                                            >
                                                <div className="relative flex items-center gap-3 lg:gap-4">
                                                    {/* Cat Head Pointer Active Indicator */}
                                                    <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 lg:h-14 lg:w-14 shrink-0 items-center justify-center">
                                                        {active && (
                                                            <motion.div
                                                                layoutId="activeExperienceIndicator"
                                                                className="flex items-center justify-center"
                                                                transition={{
                                                                    type: "spring",
                                                                    stiffness: 380,
                                                                    damping: 30,
                                                                }}
                                                            >
                                                                <CatHeadPointer className="h-8 w-8 sm:h-9 sm:w-9 lg:h-14 lg:w-14 drop-shadow-[0_2px_12px_rgba(136,192,208,0.25)]" />
                                                            </motion.div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col min-w-0">
                                                        <span
                                                            className={`whitespace-nowrap text-xl sm:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold transition-all duration-300 ease-in-out leading-tight ${
                                                                active
                                                                    ? "text-white translate-x-2"
                                                                    : "text-white/25 group-hover:text-white/60 -translate-x-14"
                                                            }`}
                                                        >
                                                            {experience.company}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* =================================================
                                    RIGHT COLUMN — SCROLL-DRIVEN CARD STACK
                                    Dynamic Stack Cards from Turso
                                ================================================== */}
                                <div className="lg:col-span-7">
                                    {/* Stable card stack container with reserved top space for stacking tabs */}
                                    <div className="relative w-full pt-9 sm:pt-10">
                                        <div className="relative w-full h-[490px] sm:h-[510px] lg:h-[530px] xl:h-[540px]">
                                            {experiences.map((experience, index) => (
                                                <StackCard
                                                    key={experience.id}
                                                    experience={experience}
                                                    index={index}
                                                    total={experiences.length}
                                                    scrollYProgress={smoothProgress}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subtle Scroll Down Indicator on First Experience (Absolute positioned to prevent layout shift) */}
                            <div className="pointer-events-none absolute bottom-4 sm:bottom-6 left-6 md:left-8 lg:left-12 z-20">
                                <AnimatePresence>
                                    {activeIndex === 0 && experiences.length > 1 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.3 }}
                                            className="hidden lg:flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/25"
                                        >
                                            <span>Scroll to explore timeline</span>
                                            <ChevronDown size={13} className="animate-bounce text-[#88C0D0]/70" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}