"use client";

import { useTools } from "@/hooks/useTools";
import type { Tool } from "@/models/tool";
import { Cpu, Sparkles } from "lucide-react";
import React from "react";

/* =====================================================
   SEPARATOR TYPES
====================================================== */

type SeparatorType = "glyph" | "slash" | "dot" | "badge";

interface Separator {
  type: SeparatorType;
  value: string;
}

const SEPARATORS: Separator[] = [
  { type: "glyph", value: "✦" },
  { type: "dot", value: "●" },
  { type: "glyph", value: "✧" },
];

/* =====================================================
   EDITORIAL TOOL ITEM COMPONENT (CONSISTENT DESIGN & FONTS)
====================================================== */

interface ToolItemProps {
  tool: Tool;
  index: number;
}

function ToolItem({ tool, index }: ToolItemProps) {
  // Rotate through 3 consistent editorial styles (all in Plus Jakarta Sans / font-sans)
  const variant = index % 2;

  if (variant === 0) {
    // Style B: Bold Sans Display with circular icon
    return (
      <div className="group/item relative flex items-center gap-3 px-3 py-1 shrink-0 select-none cursor-default transition-transform duration-300 hover:scale-105">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] p-1.5 text-white/60 transition-all duration-300 group-hover/item:border-[#88C0D0]/50 group-hover/item:bg-[#88C0D0]/10 group-hover/item:text-[#88C0D0]">
          <div
            className="h-full w-full flex items-center justify-center [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: tool.svg }}
          />
        </div>

        <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white transition-colors duration-300 group-hover/item:text-[#88C0D0]">
          {tool.name}
        </span>
      </div>
    );
  }

  // Style C: Outlined Grotesk Headline
  return (
    <div className="group/item relative flex items-center gap-3 px-3 py-1 shrink-0 select-none cursor-default transition-transform duration-300 hover:scale-105">
      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-1.5 text-white/50 transition-all duration-300 group-hover/item:text-[#88C0D0] group-hover/item:border-[#88C0D0]/40">
        <div
          className="h-full w-full flex items-center justify-center [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: tool.svg }}
        />
      </div>

      <span
        className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider text-transparent transition-all duration-300"
        style={{
          WebkitTextStroke: "1.2px rgba(255, 255, 255, 0.4)",
        }}
      >
        {tool.name}
      </span>
    </div>
  );
}

/* =====================================================
   SEPARATOR COMPONENT
====================================================== */

function SeparatorWidget({ separator }: { separator: Separator }) {
  switch (separator.type) {
    case "glyph":
      return (
        <span className="font-mono text-base sm:text-xl text-[#88C0D0]/70 shrink-0 px-2 select-none">
          {separator.value}
        </span>
      );
    case "slash":
      return (
        <span className="font-mono text-xs sm:text-sm tracking-widest text-white/20 shrink-0 px-2 select-none">
          {separator.value}
        </span>
      );
    case "dot":
      return (
        <span className="h-1.5 w-1.5 rounded-full bg-[#88C0D0]/40 shrink-0 mx-2 select-none" />
      );
    case "badge":
      return (
        <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-white/30 uppercase border border-white/10 rounded-full px-2.5 py-0.5 shrink-0 select-none">
          {separator.value}
        </span>
      );
  }
}

/* =====================================================
   MARQUEE ROW TRACK
====================================================== */

interface MarqueeRowProps {
  tools: Tool[];
  direction?: "left" | "right";
  duration?: string;
  rowIndex: number;
}

function MarqueeRow({
  tools,
  direction = "left",
  duration = "40s",
  rowIndex,
}: MarqueeRowProps) {
  if (!tools.length) return null;

  // Build the sequence with intermittent separators
  const sequence: Array<{ kind: "tool"; tool: Tool; index: number } | { kind: "separator"; sep: Separator }> = [];
  tools.forEach((tool, i) => {
    sequence.push({ kind: "tool", tool, index: i });
    const sep = SEPARATORS[(i + rowIndex * 2) % SEPARATORS.length];
    sequence.push({ kind: "separator", sep });
  });

  // Ensure enough items to span wide displays seamlessly (repeat sequence if needed)
  const fullRow = sequence.length < 12
    ? [...sequence, ...sequence, ...sequence]
    : sequence;

  const animClass =
    direction === "left" ? "animate-marquee-left" : "animate-marquee-right";

  return (
    <div className="group relative flex w-full overflow-hidden py-3 sm:py-4 pause-on-hover">
      <div
        className={`${animClass} flex shrink-0 items-center gap-6 sm:gap-8 lg:gap-12`}
        style={{ "--marquee-duration": duration } as React.CSSProperties}
      >
        {/* Set A */}
        {fullRow.map((item, idx) => (
          <React.Fragment key={`a-${idx}`}>
            {item.kind === "tool" ? (
              <ToolItem tool={item.tool} index={item.index} />
            ) : (
              <SeparatorWidget separator={item.sep} />
            )}
          </React.Fragment>
        ))}

        {/* Set B (Infinite duplicate) */}
        {fullRow.map((item, idx) => (
          <React.Fragment key={`b-${idx}`}>
            {item.kind === "tool" ? (
              <ToolItem tool={item.tool} index={item.index} />
            ) : (
              <SeparatorWidget separator={item.sep} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   MAIN REDESIGNED TOOLS SECTION
====================================================== */

export default function Tools() {
  const { tools, loading, error } = useTools();

  // Distribute tools from Turso database evenly across 3 marquee rows
  const { row1, row2, row3 } = React.useMemo(() => {
    if (!tools || tools.length === 0) {
      return { row1: [], row2: [], row3: [] };
    }

    const r1: Tool[] = [];
    const r2: Tool[] = [];
    const r3: Tool[] = [];

    tools.forEach((tool, idx) => {
      if (idx % 3 === 0) r1.push(tool);
      else if (idx % 3 === 1) r2.push(tool);
      else r3.push(tool);
    });

    return { row1: r1, row2: r2, row3: r3 };
  }, [tools]);

  return (
    <section
      id="tools"
      className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#2E3440] text-white py-24 sm:py-28 lg:py-32 select-none"
    >
      {/* =====================================================
          AMBIENT COSMIC BACKGROUND (Consistent with Services & About)
      ====================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Subtle grid */}
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

        {/* Ambient nebulas in Nord cyan & steel */}
        <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#88C0D0]/[0.035] blur-[140px]" />
        <div className="absolute right-12 bottom-1/4 h-[450px] w-[450px] rounded-full bg-[#81A1C1]/[0.025] blur-[150px]" />

        {/* Subtle celestial stars */}
        <div className="absolute left-[12%] top-[15%] h-1 w-1 rounded-full bg-white/20" />
        <div className="absolute right-[18%] top-[35%] h-[2px] w-[2px] rounded-full bg-white/30" />
        <div className="absolute left-[24%] bottom-[20%] h-[3px] w-[3px] rounded-full bg-white/15" />
        <div className="absolute right-[8%] bottom-[30%] h-1 w-1 rounded-full bg-[#88C0D0]/30" />
      </div>

      {/* =====================================================
          SECTION HEADER (Consistent with Services & Projects)
      ====================================================== */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1700px] flex-col justify-between px-6 sm:px-10 lg:px-16 mb-10 sm:mb-14 lg:mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.08] pb-6 sm:pb-8">
          <div>
            {/* Index label */}
            <div className="mb-2.5 flex items-center gap-3">
              <span className="font-mono text-xs font-semibold tracking-widest text-[#88C0D0]">
                ( 03 )
              </span>
              <span className="h-px w-6 bg-[#88C0D0]/40" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
                Tech Arsenal & Ecosystem
              </span>
            </div>

            {/* Consistent Headline matching Services format */}
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl leading-[1.08]">
              Tech Stack &{" "}
              <span className="font-normal text-white/35">
                Development Arsenal.
              </span>
            </h2>
          </div>

          {/* Subtitle / Lead text */}
          <div className="max-w-md text-left md:text-right">
            <p className="text-sm leading-relaxed text-white/60 font-normal">
              A curated suite of modern frameworks, languages, and cloud tooling
              powering high-performance digital products.
            </p>
            <div className="mt-2.5 flex items-center md:justify-end gap-2 text-[10px] font-mono text-[#88C0D0]/80 tracking-wider uppercase">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#88C0D0] animate-pulse" />
              <span>Hover marquee to pause & inspect</span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          INFINITE HORIZONTAL MARQUEE STAGE (Multi-Row)
      ====================================================== */}
      <div
        className="relative z-10 w-full overflow-hidden flex flex-col gap-2 sm:gap-4 my-auto py-2"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        {/* Loading / Error state if fetching from Turso */}
        {loading && !tools.length ? (
          <div className="flex h-64 w-full items-center justify-center font-mono text-xs text-white/40">
            <Cpu className="h-4 w-4 mr-2 animate-spin text-[#88C0D0]" />
            Loading tools from Turso database...
          </div>
        ) : error && !tools.length ? (
          <div className="flex h-64 w-full items-center justify-center font-mono text-xs text-red-400/80">
            {error}
          </div>
        ) : (
          <>
            {/* ROW 1: Direction Left (~40s) */}
            <MarqueeRow
              tools={row1}
              direction="left"
              duration="38s"
              rowIndex={0}
            />

            {/* ROW 2: Direction Right (~46s) */}
            <MarqueeRow
              tools={row2}
              direction="right"
              duration="44s"
              rowIndex={1}
            />

            {/* ROW 3: Direction Left (~42s) */}
            <MarqueeRow
              tools={row3}
              direction="left"
              duration="40s"
              rowIndex={2}
            />
          </>
        )}
      </div>

      {/* =====================================================
          BOTTOM STATUS TELEMETRY BAR (Consistent with Services Footer)
      ====================================================== */}
      <div className="relative z-10 mx-auto w-full max-w-[1700px] px-6 sm:px-10 lg:px-16 mt-10 sm:mt-14">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.08] pt-5 text-xs text-white/40">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-[#88C0D0] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              TURSO_DB
            </span>
            <span className="text-white/30">•</span>
            <span className="font-mono text-[11px] text-white/60">
              {tools.length} TOOLS SYNCED
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] tracking-wider uppercase text-white/35">
            <span className="hidden md:inline">SYS://ORBITAL_ARSENAL</span>
            <span className="text-[#88C0D0]/80">STREAM ONLINE // 60FPS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
