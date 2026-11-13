"use client";

import { BouncingText } from "@/components/ui/bouncing-text";
import { useTools } from "@/hooks/useTools";
import type { Tool } from "@/models/tool";
import { Cpu } from "lucide-react";
import React, { useEffect, useRef } from "react";

/* =====================================================
   SEPARATOR TYPES
====================================================== */

type SeparatorType = "glyph" | "dot" | "slash";

interface Separator {
  type: SeparatorType;
  value: string;
}

// Reduced to 2 separator types — fewer unique node shapes = faster paint
const SEPARATORS: Separator[] = [
  { type: "glyph", value: "✦" },
  { type: "dot",   value: "●" },
  { type: "glyph", value: "✧" },
];

const pad = (n: number) => String(n).padStart(2, "0");

/* =====================================================
   SEEDED SHUFFLE — Mulberry32 PRNG, deterministic
====================================================== */

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  const rand = mulberry32(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/* =====================================================
   DISTRIBUTE TOOLS
   Each tool appears in exactly 2 of the 6 rows.
   Spread-by-3 so a tool's two rows are maximally apart.
====================================================== */

function distributeTools(tools: Tool[]): Tool[][] {
  const shuffled = seededShuffle(tools, 0xdeadbeef);
  const buckets: Tool[][] = Array.from({ length: 6 }, () => []);
  shuffled.forEach((tool, i) => {
    buckets[i % 6].push(tool);
    buckets[(i + 3) % 6].push(tool);
  });
  return buckets.map((row, idx) => seededShuffle(row, idx * 0x9e3779b9 + 0xbeef));
}

/* =====================================================
   ROW CONFIGS — 6 rows, varied speed & alternating direction
   Prime-ish durations so rows never visually sync.
====================================================== */

const ROW_CONFIGS: { direction: "left" | "right"; duration: string }[] = [
  { direction: "left",  duration: "43s" },
  { direction: "right", duration: "63s" },
  { direction: "left",  duration: "51s" },
  { direction: "right", duration: "37s" },
  { direction: "left",  duration: "71s" },
  { direction: "right", duration: "57s" },
];

/* =====================================================
   TOOL ITEM
   PERF: React.memo prevents re-renders when parent updates.
   PERF: Hover changed from scale (triggers layout) → opacity only.
   PERF: Removed transition-all, use targeted transition-opacity.
====================================================== */

const ToolItem = React.memo(function ToolItem({
  tool,
  index,
}: {
  tool: Tool;
  index: number;
}) {
  if (index % 2 === 0) {
    return (
      <div className="relative flex shrink-0 cursor-default select-none items-center gap-3 px-3 py-1 opacity-100 transition-opacity duration-200 hover:opacity-70">
        {/* Icon: static styles, no hover border/bg transition to avoid repaints */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] p-1.5 text-white/60 sm:h-9 sm:w-9">
          <div
            className="flex h-full w-full items-center justify-center [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: tool.svg }}
          />
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl">
          {tool.name}
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex shrink-0 cursor-default select-none items-center gap-3 px-3 py-1 opacity-100 transition-opacity duration-200 hover:opacity-70">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-1.5 text-white/50 sm:h-9 sm:w-9">
        <div
          className="flex h-full w-full items-center justify-center [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: tool.svg }}
        />
      </div>
      <span
        className="text-2xl font-black uppercase tracking-wider text-transparent sm:text-3xl md:text-4xl"
        style={{ WebkitTextStroke: "1.2px rgba(255,255,255,0.4)" }}
      >
        {tool.name}
      </span>
    </div>
  );
});

/* =====================================================
   SEPARATOR WIDGET
   PERF: React.memo — separators never change
====================================================== */

const SeparatorWidget = React.memo(function SeparatorWidget({
  separator,
}: {
  separator: Separator;
}) {
  switch (separator.type) {
    case "glyph":
      return (
        <span className="shrink-0 select-none px-2 font-mono text-base text-[#88C0D0]/70 sm:text-xl">
          {separator.value}
        </span>
      );
    case "dot":
      return (
        <span className="mx-2 h-1.5 w-1.5 shrink-0 select-none rounded-full bg-[#88C0D0]/40" />
      );
    case "slash":
      return (
        <span className="shrink-0 select-none px-2 font-mono text-xs tracking-widest text-white/20 sm:text-sm">
          {separator.value}
        </span>
      );
  }
});

/* =====================================================
   MARQUEE ROW
   PERF: contain='layout paint' isolates row repaints.
   PERF: will-change only on the single moving wrapper.
   PERF: translateZ(0) promotes wrapper to its own GPU layer.
   PERF: Repetition threshold lowered (< 8), repeat 2× not 3×.
   PERF: Row receives isActive prop to pause when off-screen.
====================================================== */

const MarqueeRow = React.memo(function MarqueeRow({
  tools,
  direction = "left",
  duration = "40s",
  rowIndex,
  paused,
}: {
  tools: Tool[];
  direction?: "left" | "right";
  duration?: string;
  rowIndex: number;
  paused: boolean;
}) {
  if (!tools.length) return null;

  const sequence = tools.flatMap((tool, i) => [
    { kind: "tool" as const, tool, index: i },
    {
      kind: "sep" as const,
      sep: SEPARATORS[(i + rowIndex * 2) % SEPARATORS.length],
    },
  ]);

  // PERF: Only duplicate if truly needed; prefer 2× over 3×
  const fullRow =
    sequence.length < 8
      ? [...sequence, ...sequence, ...sequence]
      : sequence.length < 16
      ? [...sequence, ...sequence]
      : sequence;

  const animClass =
    direction === "left" ? "animate-marquee-left" : "animate-marquee-right";

  const renderSet = (prefix: string, ariaHidden = false) => (
    <div
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center gap-6 pr-6 sm:gap-8 sm:pr-8 lg:gap-10 lg:pr-10"
    >
      {fullRow.map((item, idx) =>
        item.kind === "tool" ? (
          <ToolItem key={`${prefix}-${idx}`} tool={item.tool} index={item.index} />
        ) : (
          <SeparatorWidget key={`${prefix}-${idx}`} separator={item.sep} />
        )
      )}
    </div>
  );

  return (
    // PERF: contain isolates layout & paint to this row only
    <div
      className="relative flex w-full overflow-hidden py-2 sm:py-3"
      style={{ contain: "layout paint" }}
    >
      <div
        className={`${animClass} flex w-max shrink-0`}
        style={{
          "--marquee-duration": duration,
          // PERF: will-change only on the moving container (not each child)
          willChange: "transform",
          // PERF: force GPU compositing layer
          transform: "translateZ(0)",
          // PERF: pause the CSS animation when section is off-screen
          animationPlayState: paused ? "paused" : "running",
        } as React.CSSProperties}
      >
        {renderSet("a")}
        {renderSet("b", true)}
      </div>
    </div>
  );
});

/* =====================================================
   MAIN TOOLS SECTION
====================================================== */

export default function Tools() {
  const { tools, loading, error } = useTools();
  const sectionRef = useRef<HTMLElement>(null);
  // PERF: Track whether section is in viewport to pause animations
  const [isVisible, setIsVisible] = React.useState(false);

  // PERF: IntersectionObserver — pause all marquee animations when
  //       section scrolls off-screen. Zero GPU work while hidden.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      {
        // Start playing slightly before section enters viewport
        rootMargin: "120px 0px 120px 0px",
        threshold: 0,
      }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const rows = React.useMemo<Tool[][]>(() => {
    if (!tools || tools.length === 0)
      return Array.from({ length: 6 }, () => []);
    return distributeTools(tools);
  }, [tools]);

  const paused = !isVisible;

  return (
    <section
      id="tools"
      ref={sectionRef}
      className="relative flex min-h-screen w-full select-none flex-col justify-between overflow-hidden bg-[#2E3440] pt-10 text-white sm:py-10 lg:py-10"
    >
      {/* ── Header ── */}
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

      {/* ── Title ── */}
      <div className="relative z-10 mx-auto mb-6 w-full max-w-[1600px] px-6 pt-4 text-3xl font-bold leading-[1.12] text-white md:px-8 md:text-5xl lg:px-16 lg:text-6xl">
        <BouncingText intensity="subtle">
          Technologies used across software development.
        </BouncingText>
      </div>

      {/* ── Marquee stage ── */}
      <div
        className="relative z-10 my-auto flex w-full flex-col gap-1 overflow-hidden py-2 sm:gap-2"
        style={{
          // PERF: Fade edges via mask (GPU-composited, no paint cost)
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        {loading && !tools.length ? (
          <div className="flex h-64 w-full items-center justify-center font-mono text-xs text-white/40">
            <Cpu className="mr-2 h-4 w-4 animate-spin text-[#88C0D0]" />
            Loading tools…
          </div>
        ) : error && !tools.length ? (
          <div className="flex h-64 w-full items-center justify-center font-mono text-xs text-red-400/80">
            {error}
          </div>
        ) : (
          <>
            {ROW_CONFIGS.map((cfg, i) => (
              <MarqueeRow
                key={i}
                tools={rows[i]}
                direction={cfg.direction}
                duration={cfg.duration}
                rowIndex={i}
                paused={paused}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
}
