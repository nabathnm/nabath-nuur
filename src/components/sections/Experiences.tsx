import CatHeadPointer from "@/components/svg/CatHeadPointer";
import { useExperiences } from "@/hooks/useExperiences";
import { useLenis } from "@/lib/lenis";
import type { Experience } from "@/models/experience";
import {
    AnimatePresence,
    easeInOut,
    motion,
    useMotionValueEvent,
    useScroll,
    useSpring,
    useTransform,
    type MotionValue,
} from "framer-motion";
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
    if (total === 4) {
        const presets = [
            {
                input: [0, 0.18, 0.28, 0.44, 0.54, 0.69, 0.79, 1.0],
                y: [0, 0, -14, -14, -26, -26, -36, -36],
                zIndex: 10,
            },
            {
                input: [0, 0.12, 0.28, 0.44, 0.54, 0.69, 0.79, 1.0],
                y: [1000, 1000, 0, 0, -14, -14, -26, -26],
                zIndex: 20,
            },
            {
                input: [0, 0.38, 0.54, 0.69, 0.79, 1.0],
                y: [1000, 1000, 0, 0, -14, -14],
                zIndex: 30,
            },
            {
                input: [0, 0.64, 0.80, 1.0],
                y: [1000, 1000, 0, 0],
                zIndex: 40,
            },
        ];
        return presets[index] ?? presets[0];
    }

    // Dynamic keypoints generation for arbitrary N (pure translation)
    const input: number[] = [0];
    const y: number[] = [];

    if (index > 0) {
        const startEnter = Math.max(0, (index - 0.7) / total);
        const fullyEntered = index / total;

        input.push(startEnter);
        y.push(1000);

        input.push(fullyEntered);
        y.push(0);
    } else {
        y.push(0);
    }

    const activeUntil = (index + 0.7) / total;
    if (activeUntil < 1.0 && index < total - 1) {
        input.push(activeUntil);
        y.push(0);
    }

    for (let j = index + 1; j < total; j++) {
        const coveredAt = (j + 0.15) / total;
        const depth = j - index;
        const targetY = -Math.min(36, depth * 14);

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
            className="absolute inset-0 flex w-full flex-col justify-between overflow-hidden rounded-[2rem] border border-white/80 bg-[#ECEFF4] p-6 sm:p-7 lg:p-8 xl:p-9 shadow-[0_22px_55px_rgba(0,0,0,0.38),0_4px_12px_rgba(0,0,0,0.15),0_-4px_16px_rgba(0,0,0,0.1)]"
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

                    <h3 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-[#2E3440] leading-tight">
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
   MAIN EXPERIENCES COMPONENT
   Connected dynamically to Turso Cloud Database
====================================================== */
export default function Experiences() {
    const { experiences } = useExperiences();
    const lenis = useLenis();
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
        damping: 24,
        stiffness: 160,
        mass: 0.35,
    });

    // Update active experience smoothly on scroll
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (isClickScrollingRef.current || experiences.length === 0) return;

        // Map [0, 1] across the N experiences from Turso
        const rawIndex = Math.floor(latest * experiences.length);
        const index = Math.min(experiences.length - 1, Math.max(0, rawIndex));
        const currentTargetId = experiences[index]?.id;

        if (currentTargetId && currentTargetId !== activeId) {
            setActiveId(currentTargetId);
        }
    });

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

        // Target the center of that experience's scroll segment
        const targetProgress = (targetIndex + 0.5) / experiences.length;
        const targetScrollY = trackTop + totalScrollable * targetProgress;

        if (lenis) {
            lenis.scrollTo(targetScrollY, {
                duration: 0.95,
                // Cubic ease-in-out curve
                easing: (t) =>
                    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
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

    const trackHeight = `${Math.max(2, experiences.length) * 100}vh`;

    return (
        <section
            id="experiences"
            className="relative overflow-x-clip bg-[#2E3440] text-white"
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
                {/* =====================================================
                    STICKY STAGE (Locked in viewport during exploration)
                ====================================================== */}
                <div className="sticky top-0 flex h-screen min-h-dvh w-full flex-col justify-center overflow-hidden py-8 lg:py-12">
                    <div className="relative z-10 w-full px-2 md:px-25">
                        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-8 lg:px-12">
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
                                            className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#88C0D0] ${
                                                active
                                                    ? "border-[#88C0D0]/40 bg-[#88C0D0]/10 text-white"
                                                    : "border-white/10 bg-white/2 text-white/40 hover:text-white/70"
                                            }`}
                                        >
                                            {active && (
                                                <CatHeadPointer className="h-3.5 w-3.5 shrink-0" />
                                            )}
                                            {experience.company}
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
                                    Fully preserved as edited by user
                                ================================================== */}
                                <div
                                    role="tablist"
                                    aria-label="Experiences list"
                                    className="hidden lg:flex lg:col-span-4 flex-col justify-center space-y-4 sm:space-y-6 lg:space-y-8"
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
                                                className="group relative flex items-center text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-[#2E3440] rounded-xl"
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

                                                    <div className="flex flex-col">
                                                        <span
                                                            className={`text-2xl sm:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold transition-all duration-300 ease-in-out leading-10 ${
                                                                active
                                                                    ? "text-white translate-x-2"
                                                                    : "text-white/25 hover:text-white/60 -translate-x-14"
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
                                <div className="lg:col-span-8">
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