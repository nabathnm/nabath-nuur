"use client";

import { useTools } from "@/hooks/useTools";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { Code2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

/* =====================================================
   CONFIG
====================================================== */

const ORBIT = {
  tiltDeg: -14, // kemiringan elips (sumbu tetap, hanya ikon yang bergerak)
  ratio: 0.32, // radiusY / radiusX
  duration: 40, // detik per putaran
  maxRadiusX: 390,
  minRadiusX: 110,
  edgePadding: 52, // ruang untuk ikon + tooltip di tepi container
};

const TILT = (ORBIT.tiltDeg * Math.PI) / 180;
const COS_T = Math.cos(TILT);
const SIN_T = Math.sin(TILT);
const TAU = Math.PI * 2;

type Tool = ReturnType<typeof useTools>["tools"][number];

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Titik pada elips miring untuk sudut `angle` (radian). */
function pointOnOrbit(angle: number, rx: number, ry: number) {
  const ex = Math.cos(angle) * rx;
  const ey = Math.sin(angle) * ry;
  return {
    x: ex * COS_T - ey * SIN_T,
    y: ex * SIN_T + ey * COS_T,
  };
}

/* =====================================================
   ORBIT ITEM
====================================================== */

interface OrbitItemProps {
  tool: Tool;
  index: number;
  total: number;
  phase: MotionValue<number>;
  rx: MotionValue<number>;
  ry: MotionValue<number>;
}

function OrbitItem({ tool, index, total, phase, rx, ry }: OrbitItemProps) {
  const [hovered, setHovered] = useState(false);
  const offset = (index / total) * TAU; // tersebar merata

  const x = useTransform([phase, rx, ry], (v: number[]) =>
    pointOnOrbit(v[0] + offset, v[1], v[2]).x
  );
  const y = useTransform([phase, rx, ry], (v: number[]) =>
    pointOnOrbit(v[0] + offset, v[1], v[2]).y
  );

  // Kedalaman semu: ikon di sisi depan (bawah) sedikit lebih besar & terang.
  const depth = useTransform([phase, rx, ry], (v: number[]) => {
    const p = pointOnOrbit(v[0] + offset, v[1], v[2]);
    const extent = v[2] + v[1] * Math.abs(SIN_T) || 1;
    return Math.max(-1, Math.min(1, p.y / extent));
  });
  const scale = useTransform(depth, [-1, 1], [0.88, 1.04]);
  const opacity = useTransform(depth, [-1, 1], [0.7, 1]);
  const zIndex = useTransform(depth, (d: number) => Math.round(20 + d * 10));

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{ x, y, zIndex: hovered ? 100 : zIndex }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Pusatkan ikon pada titik orbit; tidak ikut berputar → selalu tegak */}
      <motion.div
        className="-translate-x-1/2 -translate-y-1/2"
        style={{ scale, opacity }}
      >
        <div
          className="group relative"
          tabIndex={0}
          role="img"
          aria-label={tool.name}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
        >
          {/* Hover glow */}
          <div className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-[#88c0d0]/0 blur-xl transition-all duration-500 group-hover:bg-[#88c0d0]/25 group-focus:bg-[#88c0d0]/25" />

          {/* Glass icon */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#2e3440]/70 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 group-hover:scale-110 group-hover:border-[#88c0d0]/50 group-hover:bg-[#3b4252]/80 group-hover:shadow-[0_0_30px_rgba(136,192,208,0.18)] group-focus:scale-110 group-focus:border-[#88c0d0]/50 sm:h-[68px] sm:w-[68px]">
            <div
              className="h-7 w-7 text-white/80 transition-colors duration-300 group-hover:text-[#88c0d0] group-focus:text-[#88c0d0] sm:h-9 sm:w-9 [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: tool.svg }}
            />
          </div>

          {/* Tooltip */}
          <div className="pointer-events-none absolute left-1/2 top-full mt-3 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg border border-white/10 bg-[#2e3440]/90 px-3 py-1.5 text-xs text-white/75 opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
            {tool.name}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =====================================================
   ORBIT
====================================================== */

function ToolsOrbit({ tools }: { tools: Tool[] }) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);

  // Semua nilai yang berubah-ubah berada di motion value → tanpa re-render.
  const phase = useMotionValue(0);
  const rx = useMotionValue(ORBIT.maxRadiusX);
  const ry = useMotionValue(ORBIT.maxRadiusX * ORBIT.ratio);

  // Responsif: radius mengikuti lebar container.
  useIsoLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const update = () => {
      const r = Math.max(
        ORBIT.minRadiusX,
        Math.min(ORBIT.maxRadiusX, el.clientWidth / 2 - ORBIT.edgePadding)
      );
      rx.set(r);
      ry.set(r * ORBIT.ratio);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [rx, ry]);

  // Gerakan orbit kontinu (dilewati jika reduced motion).
  useEffect(() => {
    if (shouldReduceMotion) {
      phase.set(0);
      return undefined;
    }

    const controls = animate(phase, TAU, {
      duration: ORBIT.duration,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });
    controlsRef.current = controls;

    return () => {
      controls.stop();
      controlsRef.current = null;
    };
  }, [phase, shouldReduceMotion]);

  // Cincin lintasan mengikuti radius responsif (sumbu tetap, miring).
  const ringW = useTransform(rx, (v: number) => v * 2);
  const ringH = useTransform(ry, (v: number) => v * 2);
  const outerW = useTransform(rx, (v: number) => v * 2 + 90);
  const outerH = useTransform(ry, (v: number) => v * 2 + 90);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-[380px] w-full max-w-[1100px] items-center justify-center overflow-visible sm:h-[480px]"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") controlsRef.current?.pause();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") controlsRef.current?.play();
      }}
    >
      {/* Orbit path (elips miring, tetap) */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 rounded-[50%] border border-white/[0.10]"
        style={{ width: ringW, height: ringH, x: "-50%", y: "-50%", rotate: ORBIT.tiltDeg }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 rounded-[50%] border border-white/[0.04]"
        style={{ width: outerW, height: outerH, x: "-50%", y: "-50%", rotate: ORBIT.tiltDeg }}
      />

      {/* Tools (posisi dihitung sepanjang elips) */}
      {tools.map((tool, index) => (
        <OrbitItem
          key={tool.id}
          tool={tool}
          index={index}
          total={tools.length}
          phase={phase}
          rx={rx}
          ry={ry}
        />
      ))}

      {/* Center hub */}
      <div className="relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full border border-white/10 bg-[#2e3440]/80 shadow-[0_0_60px_rgba(136,192,208,0.08)] backdrop-blur-xl sm:h-32 sm:w-32">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[#88c0d0]/20 bg-[#88c0d0]/10 text-[#88c0d0]">
          <Code2 size={22} />
        </div>

        <span className="text-xs font-semibold tracking-[0.2em] text-white/80">
          STACK
        </span>

        <span className="mt-1 text-[10px] text-white/40">
          {tools.length} tools
        </span>
      </div>
    </div>
  );
}

/* =====================================================
   SECTION
====================================================== */

export default function Tools() {
  const { tools, loading, error } = useTools();

  if (loading) {
    return (
      <section className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-white/50">Loading tools...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-red-400">{error}</p>
      </section>
    );
  }

  if (!tools.length) return null;

  return (
    <section className="relative overflow-hidden py-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#88c0d0]/[0.04] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <ToolsOrbit tools={tools} />
      </div>
    </section>
  );
}