"use client";

import { useEffect, useRef } from "react";

/** Nord palette — https://www.nordtheme.com/docs/colors-and-palettes */
export const NORD = {
  nord0: "#2E3440",
  nord1: "#3B4252",
  nord2: "#434C5E",
  nord3: "#4C566A",
  nord4: "#D8DEE9",
  nord5: "#E5E9F0",
  nord6: "#ECEFF4",
  nord7: "#8FBCBB",
  nord8: "#88C0D0",
  nord9: "#81A1C1",
  nord10: "#5E81AC",
  nord11: "#BF616A",
  nord12: "#D08770",
  nord13: "#EBCB8B",
  nord14: "#A3BE8C",
  nord15: "#B48EAD",
} as const;

interface AsciiBackgroundProps {
  className?: string;
  charSet?: string;
  cellSize?: number;
  opacity?: number;
  speed?: number;
  interactive?: boolean;
  /** Target FPS. Otomatis turun jika perangkat lambat. */
  fps?: number;
  /** Batas device pixel ratio. 1 = paling hemat, 2 = paling tajam. */
  maxDpr?: number;
  /** Warna ambient dari redup -> terang (Nord Frost) */
  palette?: string[];
  /** Warna hover: [tepi, pusat] */
  highlightColors?: [string, string];
  /** Warna dasar vignette */
  vignetteColor?: string;
}

const DEFAULT_CHARS = " ·:-=+*#%@";
const DEFAULT_PALETTE = [NORD.nord3, NORD.nord10, NORD.nord9, NORD.nord8, NORD.nord7];
// Gold -> Snow: hangat tapi tidak kemerahan
const DEFAULT_HIGHLIGHT: [string, string] = [NORD.nord13, NORD.nord6];

const MOUSE_RADIUS = 140;
const MOUSE_IDLE_MS = 2000;

export default function AsciiBackground({
  className = "",
  charSet = DEFAULT_CHARS,
  cellSize = 20,
  opacity = 0.5,
  speed = 0.8,
  interactive = true,
  fps = 15,
  maxDpr = 1,
  palette = DEFAULT_PALETTE,
  highlightColors = DEFAULT_HIGHLIGHT,
  vignetteColor = NORD.nord0,
}: AsciiBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ cx: 0, cy: 0, t: -Infinity });

  // Warna dibaca lewat ref: ganti prop (termasuk array inline) TIDAK me-restart animasi
  const paletteRef = useRef(palette);
  const highlightRef = useRef(highlightColors);
  paletteRef.current = palette;
  highlightRef.current = highlightColors;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const chars = Array.from(charSet);
    const charsLen = chars.length;
    const charHeight = cellSize;
    const font = `600 ${Math.floor(
      cellSize * 0.72
    )}px "JetBrains Mono", "Fira Code", ui-monospace, monospace`;

    const lutBucket = new Int8Array(charsLen);
    let bucketRow = new Int8Array(0);
    let colWave = new Float32Array(0);

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let charWidth = Math.max(9, Math.floor(cellSize * 0.58));
    let time = 0;

    let rafId = 0;
    let isVisible = false;
    let pageVisible = !document.hidden;
    let isRunning = false;
    let lastFrameTime = 0;

    const baseInterval = 1000 / Math.max(5, fps);
    let frameInterval = baseInterval;
    const maxInterval = 1000 / 8; // tidak pernah di bawah 8 FPS
    let drawEma = 0;
    let frameCount = 0;

    const setupFont = () => {
      ctx.font = font;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
    };

    /* ---------------------------- draw ---------------------------- */
    const draw = (now: number) => {
      if (width <= 0 || height <= 0) return;

      const pal = paletteRef.current;
      const buckets = pal.length;

      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);
      setupFont();

      // Lookup: index karakter -> bucket warna (spasi = tidak digambar)
      for (let i = 0; i < charsLen; i++) {
        lutBucket[i] =
          chars[i] === " "
            ? -1
            : Math.min(
                buckets - 1,
                Math.floor((i / Math.max(1, charsLen - 1)) * buckets)
              );
      }

      // Gelombang kolom dihitung SEKALI per frame (bukan rows × cols kali)
      for (let c = 0; c < cols; c++) {
        colWave[c] = Math.sin(c * 0.09 + time * 0.85) * 0.25;
      }

      // 1. Ambient: tiap baris = satu string, digambar per "run" warna yang sama
      let lastFill = "";
      for (let r = 0; r < rows; r++) {
        const y = r * charHeight + charHeight / 2;
        const rowBase = (Math.cos(r * 0.09 - time * 0.7) + 2) * 0.25;

        let rowStr = "";
        for (let c = 0; c < cols; c++) {
          const idx = Math.min(
            charsLen - 1,
            Math.max(0, ((colWave[c] + rowBase) * charsLen) | 0)
          );
          rowStr += chars[idx];
          bucketRow[c] = lutBucket[idx];
        }

        let start = 0;
        let cur = bucketRow[0];
        for (let c = 1; c <= cols; c++) {
          const b = c < cols ? bucketRow[c] : -2;
          if (b === cur) continue;
          if (cur >= 0) {
            const fill = pal[cur];
            if (fill !== lastFill) {
              ctx.fillStyle = fill;
              lastFill = fill;
            }
            ctx.fillText(rowStr.slice(start, c), start * charWidth, y);
          }
          start = c;
          cur = b;
        }
      }

      // 2. Hover: hanya sel di sekitar kursor, 2 tier warna tanpa alpha per sel
      const m = mouseRef.current;
      if (interactive && now - m.t < MOUSE_IDLE_MS) {
        const rect = container.getBoundingClientRect();
        const mx = m.cx - rect.left;
        const my = m.cy - rect.top;

        if (mx > -MOUSE_RADIUS && mx < width + MOUSE_RADIUS && my > -MOUSE_RADIUS && my < height + MOUSE_RADIUS) {
          const [outerColor, innerColor] = highlightRef.current;
          const radiusSq = MOUSE_RADIUS * MOUSE_RADIUS;
          const minRow = Math.max(0, Math.floor((my - MOUSE_RADIUS) / charHeight));
          const maxRow = Math.min(rows - 1, Math.ceil((my + MOUSE_RADIUS) / charHeight));
          const minCol = Math.max(0, Math.floor((mx - MOUSE_RADIUS) / charWidth));
          const maxCol = Math.min(cols - 1, Math.ceil((mx + MOUSE_RADIUS) / charWidth));

          for (let tier = 0; tier < 2; tier++) {
            ctx.fillStyle = tier === 0 ? outerColor : innerColor;
            ctx.globalAlpha = tier === 0 ? 0.85 : 1;

            for (let r = minRow; r <= maxRow; r++) {
              const cy = r * charHeight + charHeight / 2;
              const dy = cy - my;
              const dySq = dy * dy;

              for (let c = minCol; c <= maxCol; c++) {
                const dx = c * charWidth + charWidth / 2 - mx;
                const distSq = dx * dx + dySq;
                if (distSq >= radiusSq) continue;

                const proximity = 1 - Math.sqrt(distSq) / MOUSE_RADIUS;
                const ch = chars[Math.min(charsLen - 1, Math.floor((0.4 + proximity * 0.6) * charsLen))];
                if (!ch || ch === " ") continue;

                const isInner = proximity > 0.55;
                if (tier === 0) {
                  // bersihkan karakter ambient agar tidak menumpuk dengan glyph hover
                  ctx.clearRect(c * charWidth, r * charHeight, charWidth, charHeight);
                  if (isInner) continue; // digambar di tier 1
                } else if (!isInner) {
                  continue;
                }
                ctx.fillText(ch, c * charWidth, cy);
              }
            }
          }
          ctx.globalAlpha = 1;
        }
      }
    };

    /* ---------------------------- loop ---------------------------- */
    const shouldRun = () => isVisible && pageVisible && !reducedMotion;

    const render = (now: number) => {
      if (!shouldRun()) {
        isRunning = false;
        return;
      }
      rafId = requestAnimationFrame(render);

      const elapsed = now - lastFrameTime;
      if (elapsed < frameInterval) return;
      lastFrameTime = now - (elapsed % frameInterval);

      time += 0.02 * speed * (frameInterval / (1000 / 24)); // kecepatan visual tetap meski FPS turun

      const t0 = performance.now();
      draw(now);
      drawEma = drawEma * 0.9 + (performance.now() - t0) * 0.1;

      // Adaptive: kalau draw terlalu mahal, turunkan FPS otomatis
      if (++frameCount % 30 === 0) {
        if (drawEma > 6) frameInterval = Math.min(maxInterval, frameInterval * 1.3);
        else if (drawEma < 3 && frameInterval > baseInterval)
          frameInterval = Math.max(baseInterval, frameInterval / 1.15);
      }
    };

    const start = () => {
      if (isRunning || !shouldRun()) return;
      isRunning = true;
      lastFrameTime = performance.now();
      rafId = requestAnimationFrame(render);
    };

    /* --------------------------- resize --------------------------- */
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      if (w <= 0 || h <= 0) return;

      width = w;
      height = h;

      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      setupFont();
      charWidth = ctx.measureText("M").width || charWidth;

      cols = Math.ceil(width / charWidth);
      rows = Math.ceil(height / charHeight);
      bucketRow = new Int8Array(cols);
      colWave = new Float32Array(cols);

      draw(performance.now()); // hindari kedip kosong setelah resize
    };

    handleResize();

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 120); // debounce
    });
    resizeObserver.observe(container);

    /* ---------------------------- input --------------------------- */
    // Hanya simpan koordinat; tidak ada layout read / timer per event
    const handleMouseMove = (e: MouseEvent) => {
      const m = mouseRef.current;
      m.cx = e.clientX;
      m.cy = e.clientY;
      m.t = performance.now();
    };
    const handleMouseLeave = () => {
      mouseRef.current.t = -Infinity;
    };

    if (interactive && !reducedMotion) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      document.addEventListener("mouseleave", handleMouseLeave);
    }

    /* ------------------------- visibility ------------------------- */
    const handleVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) start();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible = entry.isIntersecting;
          if (isVisible) start();
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [charSet, cellSize, speed, interactive, fps, maxDpr]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ contain: "strict" }}
      className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" style={{ opacity }} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 75% 65% at 50% 50%, transparent 0%, ${vignetteColor} 90%)`,
        }}
      />
    </div>
  );
}