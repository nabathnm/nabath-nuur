"use client";

import { useTools } from "@/hooks/useTools";
import type { Tool } from "@/models/tool";
import { Cpu } from "lucide-react";
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

const pad = (n: number) => String(n).padStart(2, "0");

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
      className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#2E3440] text-white pt-10 sm:py-10 lg:py-10 select-none"
    >
      {/* =====================================================
          SECTION HEADER (Consistent with Projects section)
      ====================================================== */}
      <div className="relative z-10 mx-auto mb-8 flex w-full max-w-[1600px] items-center justify-between px-6 md:px-8 lg:px-16">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-white/30" />

          <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">
            Tools
          </span>
        </div>

        <span className="text-[10px] uppercase tracking-[0.3em] text-white/25">
          ({pad(tools.length)}) Selected
        </span>
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
     
    </section>
  );
}
