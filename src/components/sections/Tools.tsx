"use client";

import { useTools } from "@/hooks/useTools";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* =====================================================
   TYPES & CONFIG
====================================================== */

type Tool = ReturnType<typeof useTools>["tools"][number];

/** Jarak geser maksimum di luar area tampil (px) — membatasi "infinity". */
const TRAVEL = {
  factor: 0.5, // × ukuran frame
  minX: 160,
  maxX: 480,
  minY: 160,
  maxY: 360,
};

const DOT_PERIOD = 28; // jarak titik latar (px)

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** Hasil di rentang [-period, 0], kontinu → dipakai untuk latar titik. */
function wrap(val: number, period: number): number {
  const mod = val % period;
  return mod <= 0 ? mod : mod - period;
}

interface GridConfig {
  tile: number;
  gap: number;
  pitch: number;
  cols: number; // kolom pola dasar
  rows: number; // baris pola dasar
  boardCols: number; // total kolom board (terbatas)
  boardRows: number;
  boardW: number;
  boardH: number;
}

/**
 * Board berhingga: area tampil + jarak geser terbatas (TRAVEL).
 * Jumlah node DOM = boardCols × boardRows, tidak tumbuh tanpa batas.
 */
function computeGrid(w: number, h: number, toolCount: number): GridConfig {
  const tile = w < 640 ? 56 : w < 1024 ? 64 : 72;
  const gap = w < 640 ? 16 : w < 1024 ? 20 : 24;
  const pitch = tile + gap;

  const cols = clamp(
    Math.ceil(Math.sqrt(toolCount * (w < 640 ? 1.0 : 1.4))),
    3,
    Math.max(toolCount, 3)
  );
  const rows = Math.max(3, Math.ceil(toolCount / cols));

  const travelX = clamp(w * TRAVEL.factor, TRAVEL.minX, TRAVEL.maxX);
  const travelY = clamp(h * TRAVEL.factor, TRAVEL.minY, TRAVEL.maxY);

  const boardCols = Math.ceil((w + travelX) / pitch);
  const boardRows = Math.ceil((h + travelY) / pitch);

  return {
    tile,
    gap,
    pitch,
    cols,
    rows,
    boardCols,
    boardRows,
    boardW: boardCols * pitch,
    boardH: boardRows * pitch,
  };
}

const WHEEL_SPRING = {
  type: "spring" as const,
  stiffness: 240,
  damping: 32,
  mass: 0.7,
};

/* =====================================================
   DRAGGABLE GRID (BERHINGGA, TANPA EFEK HOVER)
====================================================== */

function ToolsGrid({ tools }: { tools: Tool[] }) {
  const reduce = useReducedMotion() ?? false;
  const frameRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  // Satu-satunya state: ukuran frame (berubah hanya saat resize).
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Posisi board — motion value, tanpa re-render saat drag / wheel.
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const draggingRef = useRef(false);
  const currentTileRef = useRef<HTMLElement | null>(null);
  const boundsRef = useRef({ minX: 0, minY: 0 });
  const wheelRef = useRef({ x: 0, t: 0 });
  const ctrlRef = useRef<{
    x?: AnimationPlaybackControls;
    y?: AnimationPlaybackControls;
  }>({});
  const initializedRef = useRef(false);

  const grid = useMemo(
    () =>
      size.w > 0 && tools.length > 0
        ? computeGrid(size.w, size.h, tools.length)
        : null,
    [size.w, size.h, tools.length]
  );

  const minX = grid ? -(grid.boardW - size.w) : 0;
  const minY = grid ? -(grid.boardH - size.h) : 0;

  // Latar titik: digeser lewat transform (compositor), bukan background-position.
  const dotsX = useTransform(x, (v: number) => wrap(v * 0.35, DOT_PERIOD));
  const dotsY = useTransform(y, (v: number) => wrap(v * 0.35, DOT_PERIOD));

  /* ---------- ukuran frame ---------- */
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return undefined;

    const update = () => {
      const w = Math.round(el.clientWidth);
      const h = Math.round(el.clientHeight);
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ---------- batas & posisi awal (board di tengah) ---------- */
  useEffect(() => {
    if (!grid) return;
    boundsRef.current = { minX, minY };

    if (!initializedRef.current) {
      initializedRef.current = true;
      x.set(minX / 2);
      y.set(minY / 2);
    } else {
      x.set(clamp(x.get(), minX, 0));
      y.set(clamp(y.get(), minY, 0));
    }
  }, [grid, minX, minY, x, y]);

  const stopAnimations = useCallback(() => {
    ctrlRef.current.x?.stop();
    ctrlRef.current.y?.stop();
    x.stop();
    y.stop();
  }, [x, y]);

  /* ---------- wheel / trackpad (horizontal) ---------- */
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return undefined;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;

      let dx = e.deltaX;
      let dy = e.deltaY;
      if (e.shiftKey && dx === 0) {
        dx = dy;
        dy = 0;
      }
      if (e.deltaMode === 1) dx *= 16;

      // Scroll vertikal dibiarkan untuk halaman.
      if (Math.abs(dx) <= Math.abs(dy)) return;
      e.preventDefault();

      hideTip();

      const now = performance.now();
      const w = wheelRef.current;
      if (now - w.t > 160) {
        stopAnimations();
        w.x = x.get();
      }
      w.t = now;
      w.x = clamp(w.x - dx, boundsRef.current.minX, 0);

      if (reduce) {
        x.set(w.x);
        return;
      }
      ctrlRef.current.x?.stop();
      ctrlRef.current.x = animate(x, w.x, WHEEL_SPRING);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [x, reduce, stopAnimations]);

  /* ---------- tooltip imperatif (tanpa state / re-render) ---------- */
  function hideTip() {
    currentTileRef.current = null;
    if (tipRef.current) tipRef.current.style.opacity = "0";
  }

  function showTip(el: HTMLElement) {
    const tip = tipRef.current;
    const frame = frameRef.current;
    if (!tip || !frame || currentTileRef.current === el) return;
    currentTileRef.current = el;

    tip.textContent = el.dataset.name ?? "";

    const f = frame.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const half = tip.offsetWidth / 2;
    const left = clamp(r.left + r.width / 2 - f.left, half + 8, f.width - half - 8);
    const above = r.top - f.top > 44;

    tip.style.left = `${left}px`;
    tip.style.top = `${above ? r.top - f.top - 10 : r.bottom - f.top + 10}px`;
    tip.style.transform = above ? "translate(-50%,-100%)" : "translate(-50%,0)";
    tip.style.opacity = "1";
  }

  const tileFrom = (target: EventTarget | null) =>
    (target as HTMLElement | null)?.closest<HTMLElement>("[data-name]") ?? null;

  const onPointerOver = (e: React.PointerEvent) => {
    if (draggingRef.current || e.pointerType === "touch") return;
    const tile = tileFrom(e.target);
    if (tile) showTip(tile);
  };

  const onPointerOut = (e: React.PointerEvent) => {
    const next = tileFrom(e.relatedTarget);
    if (next !== currentTileRef.current) hideTip();
  };

  const onFocus = (e: React.FocusEvent) => {
    const tile = tileFrom(e.target);
    if (!tile) return;
    showTip(tile);

    // Pan ke ikon hanya untuk navigasi keyboard.
    if (!tile.matches(":focus-visible")) return;
    const tx = clamp(size.w / 2 - (tile.offsetLeft + tile.offsetWidth / 2), minX, 0);
    const ty = clamp(size.h / 2 - (tile.offsetTop + tile.offsetHeight / 2), minY, 0);
    stopAnimations();
    if (reduce) {
      x.set(tx);
      y.set(ty);
      return;
    }
    ctrlRef.current.x = animate(x, tx, WHEEL_SPRING);
    ctrlRef.current.y = animate(y, ty, WHEEL_SPRING);
  };

  /* ---------- tile (statis, dibuat sekali per layout) ---------- */
  const tiles = useMemo(() => {
    if (!grid) return [];
    const n = tools.length;
    const list = [];

    for (let r = 0; r < grid.boardRows; r++) {
      for (let c = 0; c < grid.boardCols; c++) {
        const idx = ((r % grid.rows) * grid.cols + (c % grid.cols)) % n;
        const tool = tools[idx];
        // Hanya satu salinan per tool yang fokus/terbaca screen reader.
        const primary = r < grid.rows && c < grid.cols && r * grid.cols + c < n;

        list.push(
          <div
            key={`${r}-${c}`}
            data-name={tool.name}
            tabIndex={primary ? 0 : -1}
            role={primary ? "img" : undefined}
            aria-label={primary ? tool.name : undefined}
            aria-hidden={primary ? undefined : true}
            className="absolute flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] outline-none focus-visible:ring-2 focus-visible:ring-[#88C0D0]"
            style={{
              left: c * grid.pitch + grid.gap / 2,
              top: r * grid.pitch + grid.gap / 2,
              width: grid.tile,
              height: grid.tile,
            }}
          >
            <div
              className="h-1/2 w-1/2 text-white/75 [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: tool.svg }}
            />
          </div>
        );
      }
    }
    return list;
  }, [grid, tools]);

  return (
    <div className="flex flex-1 min-h-0 w-full flex-col">
      <div
        ref={frameRef}
        className="relative flex-1 min-h-[380px] w-full touch-none select-none overflow-hidden border-y border-white/10"
        style={{ cursor: "grab" }}
      >
        {/* Latar titik berparalaks (hanya transform) */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-14 will-change-transform"
          style={{
            x: dotsX,
            y: dotsY,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1.4px)",
            backgroundSize: `${DOT_PERIOD}px ${DOT_PERIOD}px`,
          }}
        />

        {/* Board berhingga: drag bawaan Framer (momentum + edge resistance) */}
        {grid && (
          <motion.div
            drag
            dragConstraints={{ left: minX, right: 0, top: minY, bottom: 0 }}
            dragElastic={reduce ? 0 : 0.12}
            dragMomentum={!reduce}
            dragTransition={{
              power: 0.4,
              timeConstant: 320,
              bounceStiffness: 260,
              bounceDamping: 32,
            }}
            onPointerDown={() => {
              ctrlRef.current.x?.stop();
              ctrlRef.current.y?.stop();
            }}
            onDragStart={() => {
              draggingRef.current = true;
              hideTip();
              if (frameRef.current) frameRef.current.style.cursor = "grabbing";
            }}
            onDragEnd={() => {
              draggingRef.current = false;
              if (frameRef.current) frameRef.current.style.cursor = "grab";
            }}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
            onFocus={onFocus}
            onBlur={hideTip}
            className="absolute left-0 top-0 transform-gpu will-change-transform"
            style={{ x, y, width: grid.boardW, height: grid.boardH }}
          >
            {tiles}
          </motion.div>
        )}

        {/* Satu tooltip untuk semua ikon */}
        <div
          ref={tipRef}
          aria-hidden="true"
          className="pointer-events-none absolute z-30 whitespace-nowrap rounded-lg border border-white/15 bg-[#2E3440] px-3 py-1.5 text-xs font-medium text-white transition-opacity duration-150"
          style={{ opacity: 0 }}
        />
      </div>
    </div>
  );
}

/* =====================================================
   MAIN SECTION COMPONENT (1 FULL PAGE WEB)
====================================================== */

export default function Tools() {
  const { tools, loading, error } = useTools();

  if (loading) {
    return (
      <section
        id="tools"
        className="flex h-screen min-h-dvh w-full items-center justify-center bg-transparent text-white"
      >
        <p className="text-sm text-white/50">Loading tools...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="tools"
        className="flex h-screen min-h-dvh w-full items-center justify-center bg-transparent text-white"
      >
        <p className="text-sm text-red-400">{error}</p>
      </section>
    );
  }

  if (!tools.length) return null;

  return (
    <section
      id="tools"
      className="relative flex h-screen min-h-dvh w-full flex-col justify-between overflow-hidden bg-[#2E3440] text-white"
    >
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[900px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#88c0d0]/[0.03] blur-[140px]" />

      {/* Full-width draggable canvas with outline border */}
      <div className="relative z-10 flex flex-1 min-h-0 w-full flex-col">
        <ToolsGrid tools={tools} />
      </div>
    </section>
  );
}