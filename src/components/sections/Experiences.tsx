import { useState } from "react";
import {
    BriefcaseBusiness,
    CalendarDays,
    MapPin,
    ArrowUpRight,
} from "lucide-react";
import Glass from "../ui/glass";

type Experience = {
    id: number;
    role: string;
    company: string;
    type: string;
    location: string;
    start: string;
    end: string;
    description: string;
    tasks: string[];
    technologies: string[];
};

const experiences: Experience[] = [
    {
        id: 1,
        role: "Mobile Engineer",
        company: "Raion Community",
        type: "Organization",
        location: "Universitas Brawijaya",
        start: "2026",
        end: "Present",
        description:
            "Developing mobile applications and collaborating with product, UI/UX, and backend teams to deliver functional and responsive experiences.",
        tasks: [
            "Build mobile applications using Flutter",
            "Implement state management using Provider and BLoC",
            "Integrate REST APIs with mobile applications",
            "Translate UI/UX designs into responsive interfaces",
        ],
        technologies: [
            "Flutter",
            "Dart",
            "Provider",
            "BLoC",
            "REST API",
        ],
    },
    {
        id: 2,
        role: "Frontend Developer",
        company: "Raion Community",
        type: "Organization",
        location: "Universitas Brawijaya",
        start: "2026",
        end: "Present",
        description:
            "Working on the Raion web platform by developing frontend interfaces and collaborating with backend, product, and UI/UX teams.",
        tasks: [
            "Develop web interfaces using React and Next.js",
            "Build responsive UI with Tailwind CSS",
            "Integrate frontend with backend APIs",
            "Collaborate with backend and UI/UX teams",
        ],
        technologies: [
            "React",
            "Next.js",
            "TypeScript",
            "Tailwind CSS",
        ],
    },
    {
        id: 3,
        role: "Assistant Practicum",
        company: "Faculty of Computer Science",
        type: "Academic",
        location: "Universitas Brawijaya",
        start: "2026",
        end: "Present",
        description:
            "Assisting students in understanding algorithm and data structure concepts through practical sessions and hands-on programming exercises.",
        tasks: [
            "Explain algorithm and data structure concepts",
            "Guide students during practical sessions",
            "Assist students with programming problems",
            "Prepare and demonstrate programming case studies",
        ],
        technologies: [
            "Java",
            "Data Structures",
            "Algorithms",
            "Problem Solving",
        ],
    },
    {
        id: 4,
        role: "Public Relations Staff",
        company: "UKM Tapak Suci",
        type: "Organization",
        location: "Universitas Brawijaya",
        start: "2025",
        end: "2026",
        description:
            "Contributing to communication and public relations activities within the organization.",
        tasks: [
            "Coordinate internal and external communication",
            "Support organizational events",
            "Assist promotional activities",
        ],
        technologies: [
            "Communication",
            "Public Relations",
            "Event Management",
        ],
    },
];

export default function Experiences() {
    const [activeId, setActiveId] = useState(experiences[0].id);

    const activeExperience =
        experiences.find((experience) => experience.id === activeId) ??
        experiences[0];

    return (
        <section
            id="experiences"
            className="relative overflow-hidden bg-[#2E3440] py-24 text-white"
        >
            {/* =====================================================
                AMBIENT BACKGROUND
            ====================================================== */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-white/[0.025] blur-3xl" />

                <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-white/[0.025] blur-3xl" />

                {/* Stars */}
                <div className="absolute left-[8%] top-[18%] h-1 w-1 rounded-full bg-white/20" />
                <div className="absolute left-[88%] top-[22%] h-1 w-1 rounded-full bg-white/20" />
                <div className="absolute left-[20%] bottom-[15%] h-1 w-1 rounded-full bg-white/15" />
                <div className="absolute right-[12%] bottom-[25%] h-1.5 w-1.5 rounded-full bg-white/15" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">

                {/* =====================================================
                    HEADER
                ====================================================== */}
                <div className="mb-16">
                    <div className="mb-5 flex items-center gap-3">
                        <span className="h-px w-8 bg-white/30" />

                        <span className="text-xs uppercase tracking-[0.25em] text-white/40">
                            Experience
                        </span>
                    </div>

                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div>
                            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
                                Where I've
                                <br />
                                <span className="text-white/30">
                                    been building.
                                </span>
                            </h2>
                        </div>

                        <p className="max-w-md text-sm leading-7 text-white/40">
                            A collection of my academic, organizational, and
                            development experiences where I continue to learn,
                            collaborate, and build.
                        </p>
                    </div>
                </div>

                {/* =====================================================
                    EXPERIENCE CONTENT
                ====================================================== */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">

                    {/* =================================================
                        LEFT TIMELINE
                    ================================================== */}
                    <div className="relative">

                        {/* Vertical line */}
                        <div className="absolute left-[15px] top-3 bottom-3 w-px bg-white/10" />

                        <div className="space-y-2">
                            {experiences.map((experience) => {
                                const active =
                                    experience.id === activeId;

                                return (
                                    <button
                                        key={experience.id}
                                        onClick={() =>
                                            setActiveId(experience.id)
                                        }
                                        className={`
                                            group
                                            relative
                                            flex
                                            w-full
                                            items-center
                                            gap-4
                                            rounded-2xl
                                            px-2
                                            py-4
                                            text-left
                                            transition-all
                                            duration-300
                                            ${
                                                active
                                                    ? "bg-white/[0.05]"
                                                    : "hover:bg-white/[0.025]"
                                            }
                                        `}
                                    >
                                        {/* Timeline dot */}
                                        <span
                                            className={`
                                                relative
                                                z-10
                                                flex
                                                h-7
                                                w-7
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                border
                                                transition-all
                                                ${
                                                    active
                                                        ? "border-white/30 bg-white/10"
                                                        : "border-white/10 bg-[#2E3440]"
                                                }
                                            `}
                                        >
                                            <span
                                                className={`
                                                    h-1.5
                                                    w-1.5
                                                    rounded-full
                                                    transition-all
                                                    ${
                                                        active
                                                            ? "bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                                                            : "bg-white/20"
                                                    }
                                                `}
                                            />
                                        </span>

                                        <div className="min-w-0">
                                            <p
                                                className={`
                                                    truncate
                                                    text-sm
                                                    font-medium
                                                    transition
                                                    ${
                                                        active
                                                            ? "text-white"
                                                            : "text-white/40 group-hover:text-white/70"
                                                    }
                                                `}
                                            >
                                                {experience.company}
                                            </p>

                                            <p className="mt-1 text-[11px] text-white/25">
                                                {experience.start} —{" "}
                                                {experience.end}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* =================================================
                        RIGHT EXPERIENCE CARD
                    ================================================== */}
                    <div
                        className="
                            relative
                            min-h-[520px]
                            overflow-hidden
                            rounded-[2rem]
                            border
                            border-white/10
                            bg-white/[0.035]
                            p-7
                            shadow-2xl
                            backdrop-blur-xl
                            md:p-9
                        "
                    >
                        <Glass rounded="rounded-[2rem]" />

                        <div className="relative z-10 flex h-full flex-col">

                            {/* Top */}
                            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">

                                <div>
                                    <div className="mb-4 flex items-center gap-2">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                                            <BriefcaseBusiness
                                                size={15}
                                                className="text-white/50"
                                            />
                                        </span>

                                        <span className="text-xs uppercase tracking-[0.15em] text-white/30">
                                            {activeExperience.type}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                                        {activeExperience.role}
                                    </h3>

                                    <p className="mt-2 text-sm text-white/50">
                                        {activeExperience.company}
                                    </p>
                                </div>

                                {/* Date */}
                                <div className="flex items-center gap-2 text-xs text-white/30">
                                    <CalendarDays size={14} />

                                    <span>
                                        {activeExperience.start} —{" "}
                                        {activeExperience.end}
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="my-8 h-px bg-white/10" />

                            {/* Description */}
                            <div>
                                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/25">
                                    About the role
                                </p>

                                <p className="max-w-2xl text-sm leading-7 text-white/50">
                                    {activeExperience.description}
                                </p>
                            </div>

                            {/* Tasks */}
                            <div className="mt-8">
                                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/25">
                                    Responsibilities
                                </p>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {activeExperience.tasks.map(
                                        (task, index) => (
                                            <div
                                                key={index}
                                                className="
                                                    flex
                                                    gap-3
                                                    rounded-xl
                                                    border
                                                    border-white/[0.06]
                                                    bg-white/[0.025]
                                                    p-3
                                                "
                                            >
                                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/30" />

                                                <p className="text-xs leading-5 text-white/45">
                                                    {task}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Bottom */}
                            <div className="mt-auto pt-8">

                                <div className="mb-4 flex items-center gap-2 text-xs text-white/25">
                                    <MapPin size={13} />

                                    {activeExperience.location}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {activeExperience.technologies.map(
                                        (technology) => (
                                            <span
                                                key={technology}
                                                className="
                                                    rounded-full
                                                    border
                                                    border-white/10
                                                    bg-white/[0.03]
                                                    px-3
                                                    py-1.5
                                                    text-[10px]
                                                    text-white/40
                                                "
                                            >
                                                {technology}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    BOTTOM NAVIGATION
                ====================================================== */}
                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">

                    <p className="text-xs text-white/25">
                        Experience{" "}
                        <span className="text-white/50">
                            0{activeExperience.id}
                        </span>{" "}
                        of{" "}
                        <span className="text-white/50">
                            0{experiences.length}
                        </span>
                    </p>

                    <div className="flex gap-1.5">
                        {experiences.map((experience) => (
                            <button
                                key={experience.id}
                                onClick={() =>
                                    setActiveId(experience.id)
                                }
                                aria-label={`Experience ${experience.id}`}
                                className={`
                                    h-1 rounded-full transition-all duration-300
                                    ${
                                        activeExperience.id ===
                                        experience.id
                                            ? "w-8 bg-white/50"
                                            : "w-2 bg-white/10 hover:bg-white/25"
                                    }
                                `}
                            />
                        ))}
                    </div>

                    <span className="hidden text-xs text-white/25 md:block">
                        Scroll to explore
                        <ArrowUpRight
                            size={12}
                            className="ml-1 inline"
                        />
                    </span>
                </div>
            </div>
        </section>
    );
}