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
import { BriefcaseBusiness, CalendarDays, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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

    return (
        <motion.div
            style={{ y, zIndex: config.zIndex }}
            aria-hidden={!isActive}
            className="absolute inset-0 flex w-full flex-col justify-between overflow-hidden rounded-[2rem] border border-white/80 bg-[#ECEFF4] p-6 will-change-transform sm:p-7 lg:p-8"
        >
            <div className="relative z-10 flex h-full flex-col justify-between gap-5 sm:gap-6">
                {/* Header */}
                <div>
                    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#2E3440]/10 bg-white shadow-xs">
                                <BriefcaseBusiness size={14} className="text-[#5E81AC]" />
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#5E81AC]">
                                {experience.company}
                            </span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#2E3440]/10 bg-white px-3 py-1 text-xs font-medium text-[#4C566A] shadow-xs">
                            <CalendarDays size={13} className="text-[#5E81AC]" />
                            <span>
                                {experience.start} — {experience.end}
                            </span>
                        </div>
                    </div>

                    <h3
                        title={experience.role}
                        className="truncate whitespace-nowrap text-xl font-bold leading-tight tracking-tight text-[#2E3440] sm:text-2xl lg:text-3xl xl:text-4xl"
                    >
                        {experience.role}
                    </h3>
                </div>

                <div className="h-px w-full bg-[#2E3440]/10" />

                {/* Description */}
                <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#4C566A]">
                        About the role
                    </p>
                    <p className="text-xs font-normal leading-relaxed text-[#3B4252] sm:text-sm lg:text-base">
                        {experience.description}
                    </p>
                </div>

                {/* Responsibilities */}
                {experience.tasks && experience.tasks.length > 0 && (
                    <div className="mt-auto">
                        <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#4C566A]">
                            Responsibilities
                        </p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
                            {experience.tasks.map((task, idx) => (
                                <div
                                    key={`${experience.id}-${idx}`}
                                    className="flex items-start gap-2.5 rounded-xl border border-[#2E3440]/[0.08] bg-white p-2.5 shadow-xs transition-colors hover:border-[#5E81AC]/40 sm:p-3"
                                >
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5E81AC]" />
                                    <p className="text-xs font-medium leading-relaxed text-[#3B4252] sm:text-[13px]">
                                        {task}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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

                    <h2
                        id="experiences-heading"
                        className="relative z-10 mx-auto mb-6 w-full max-w-[1600px] px-6 pt-16 text-3xl font-bold text-white/50 sm:text-4xl sm:pt-10 md:px-8 lg:px-12 lg:pt-4 lg:text-5xl xl:text-6xl"
                    >
                        My Journey Through the Tech Landscape.
                    </h2>

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

                    {/* Company */}
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