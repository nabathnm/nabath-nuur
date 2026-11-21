"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import React, { useEffect, useMemo, useRef } from "react";

export interface TextRollProps {
  children: string;
  /** Durasi satu roll (detik) */
  duration?: number;
  /** Jeda antar huruf (detik) */
  stagger?: number;
  /** Lama diam di tiap posisi (detik) */
  pauseDuration?: number;
  className?: string;
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Satu huruf: posisinya dihitung dari jam bersama, tanpa animasi sendiri. */
function RollChar({
  char,
  index,
  time,
  duration,
  stagger,
  pauseDuration,
}: {
  char: string;
  index: number;
  time: MotionValue<number>;
  duration: number;
  stagger: number;
  pauseDuration: number;
}) {
  const cycle = (pauseDuration + duration) * 2;

  const y = useTransform(time, (t) => {
    // Sebelum giliran huruf ini tiba, tetap diam di posisi awal
    const local = Math.max(0, t - index * stagger) % cycle;

    let slot: number; // 0 -> 1 -> 2 (slot 3 = duplikat slot 1)
    if (local < pauseDuration) {
      slot = 0;
    } else if (local < pauseDuration + duration) {
      slot = easeInOutCubic((local - pauseDuration) / duration);
    } else if (local < pauseDuration * 2 + duration) {
      slot = 1;
    } else {
      slot = 1 + easeInOutCubic((local - pauseDuration * 2 - duration) / duration);
    }
    return `${-(slot * 100) / 3}%`;
  });

  return (
    <span
      aria-hidden="true"
      className="relative inline-block h-[1.12em] overflow-hidden align-baseline"
      style={{ verticalAlign: "baseline" }}
    >
      <motion.span
        className="flex flex-col will-change-transform"
        style={{ height: "300%", y }}
      >
        {/* Slot 1 */}
        <span className="flex h-1/3 items-center justify-center">
          <span className="inline-block bg-gradient-to-b from-white via-white/95 to-[#D8DEE9] bg-clip-text text-transparent">
            {char}
          </span>
        </span>

        {/* Slot 2 (aksen ice cyan) */}
        <span className="flex h-1/3 items-center justify-center">
          <span className="inline-block bg-gradient-to-b from-white via-[#ECEFF4] to-[#88C0D0] bg-clip-text text-transparent">
            {char}
          </span>
        </span>

        {/* Slot 3: duplikat slot 1 agar loop mulus */}
        <span className="flex h-1/3 items-center justify-center">
          <span className="inline-block bg-gradient-to-b from-white via-white/95 to-[#D8DEE9] bg-clip-text text-transparent">
            {char}
          </span>
        </span>
      </motion.span>
    </span>
  );
}

/**
 * TextRoll
 * Satu jam (rAF) untuk seluruh teks. Berhenti total saat di luar viewport,
 * lalu melanjutkan dari titik terakhir tanpa lompatan.
 */
export function TextRoll({
  children,
  duration = 0.75,
  stagger = 0.034,
  pauseDuration = 2.2,
  className = "",
}: TextRollProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(containerRef, { margin: "120px 0px" });
  const reduceMotion = useReducedMotion();

  const time = useMotionValue(0);
  const elapsed = useRef(0);

  const wordData = useMemo(() => {
    let globalIndex = 0;
    return children.split(" ").map((word) => ({
      word,
      chars: word.split("").map((char) => ({ char, index: globalIndex++ })),
    }));
  }, [children]);

  useEffect(() => {
    if (!inView || reduceMotion) return;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      // Clamp: setelah tab di-background, waktu tidak melompat jauh
      const dt = Math.min(now - last, 50);
      last = now;
      elapsed.current += dt / 1000;
      time.set(elapsed.current);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduceMotion, time]);

  if (reduceMotion) {
    return (
      <span className={`inline-block ${className}`}>
        <span className="bg-gradient-to-b from-white via-white/95 to-[#D8DEE9] bg-clip-text text-transparent">
          {children}
        </span>
      </span>
    );
  }

  return (
    <span
      ref={containerRef}
      aria-label={children}
      className={`inline-flex select-none flex-wrap items-baseline justify-center ${className}`}
    >
      {wordData.map(({ chars }, wordIdx) => (
        <React.Fragment key={wordIdx}>
          <span aria-hidden="true" className="inline-flex whitespace-nowrap">
            {chars.map(({ char, index }) => (
              <RollChar
                key={`${wordIdx}-${index}`}
                char={char}
                index={index}
                time={time}
                duration={duration}
                stagger={stagger}
                pauseDuration={pauseDuration}
              />
            ))}
          </span>

          {wordIdx < wordData.length - 1 && (
            <span aria-hidden="true" className="inline-block w-[0.28em]">
              &nbsp;
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

export default TextRoll;