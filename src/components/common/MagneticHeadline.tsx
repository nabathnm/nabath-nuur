"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface HeadlineWord {
  text: string;
  isHighlight: boolean;
}

interface HeadlineLine {
  words: HeadlineWord[];
}

const HEADLINE_LINES: HeadlineLine[] = [
  {
    words: [
      { text: "Hey", isHighlight: false },
      { text: "Im", isHighlight: false },
      { text: "Nabath", isHighlight: true },
      { text: "Nuur", isHighlight: true },
    ],
  },
  {
    words: [
      { text: "a", isHighlight: false },
      { text: "Tech", isHighlight: true },
      { text: "Enthusiast", isHighlight: false },
    ],
  },
  {
    words: [
      { text: "I", isHighlight: false },
      { text: "Build", isHighlight: false },
      { text: "Digital", isHighlight: true },
      { text: "Product", isHighlight: true },
    ],
  },
  {
    words: [
      { text: "Transforming", isHighlight: true },
      { text: "Ideas", isHighlight: false },
    ],
  },
  {
    words: [
      { text: "into", isHighlight: false },
      { text: "Digital", isHighlight: true },
      { text: "Experiences.", isHighlight: true },
    ],
  },
];

const RADIUS = 110; // Influence radius in pixels
const MAX_REPULSION = 22; // Maximum pixel displacement (subtle & premium)
const MAX_ROTATION = 5; // Maximum degrees of micro-tilt

interface CharController {
  setTarget: (tx: number, ty: number, trot: number) => void;
  getCenter: () => { cx: number; cy: number } | null;
}

interface MagneticCharProps {
  char: string;
  className?: string;
  isDesktop: boolean;
  reducedMotion: boolean | null;
  register: (controller: CharController) => () => void;
}

function MagneticChar({
  char,
  className = "",
  isDesktop,
  reducedMotion,
  register,
}: MagneticCharProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rot = useMotionValue(0);

  // Smooth spring physics for natural avoidance and snap-back
  const springConfig = { stiffness: 240, damping: 20, mass: 0.18 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const springRot = useSpring(rot, springConfig);

  useEffect(() => {
    if (!isDesktop || reducedMotion) return;

    const controller: CharController = {
      setTarget: (tx: number, ty: number, trot: number) => {
        x.set(tx);
        y.set(ty);
        rot.set(trot);
      },
      getCenter: () => {
        const el = spanRef.current;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          cx: rect.left + rect.width / 2,
          cy: rect.top + rect.height / 2,
        };
      },
    };

    return register(controller);
  }, [isDesktop, reducedMotion, register, x, y, rot]);

  if (!isDesktop || reducedMotion) {
    return <span className={`inline-block ${className}`}>{char}</span>;
  }

  return (
    <motion.span
      ref={spanRef}
      style={{
        x: springX,
        y: springY,
        rotate: springRot,
      }}
      className={`inline-block select-none will-change-transform ${className}`}
    >
      {char}
    </motion.span>
  );
}

export default function MagneticHeadline({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  // Controllers registered by each individual character
  const controllersRef = useRef<CharController[]>([]);
  // Cached rest coordinates for high-performance physics calculation
  const cachedCentersRef = useRef<Array<{ cx: number; cy: number }>>([]);
  const hasCachedRef = useRef(false);
  const isRepellingRef = useRef(false);

  // Check desktop and non-touch environment
  useEffect(() => {
    const checkIsDesktop = () => {
      const isCoarse = window.matchMedia("(pointer: coarse)").matches;
      const isWideEnough = window.innerWidth >= 768;
      setIsDesktop(!isCoarse && isWideEnough);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  const registerChar = useRef((controller: CharController) => {
    controllersRef.current.push(controller);
    hasCachedRef.current = false;
    return () => {
      controllersRef.current = controllersRef.current.filter((c) => c !== controller);
      hasCachedRef.current = false;
    };
  }).current;

  // Measure and cache neutral rest coordinates of each character
  const refreshCenters = () => {
    cachedCentersRef.current = controllersRef.current.map((c) => {
      const pos = c.getCenter();
      return pos || { cx: -9999, cy: -9999 };
    });
    hasCachedRef.current = true;
  };

  useEffect(() => {
    if (!isDesktop || reducedMotion) return;

    const handleResize = () => {
      hasCachedRef.current = false;
    };

    const handleScroll = () => {
      hasCachedRef.current = false;
    };

    const resetAll = () => {
      if (isRepellingRef.current) {
        isRepellingRef.current = false;
        controllersRef.current.forEach((c) => c.setTarget(0, 0, 0));
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const margin = RADIUS + 40;

      // Fast AABB pre-check: if pointer is outside container + margin, skip calculation
      if (
        e.clientX < rect.left - margin ||
        e.clientX > rect.right + margin ||
        e.clientY < rect.top - margin ||
        e.clientY > rect.bottom + margin
      ) {
        resetAll();
        return;
      }

      // Cache character neutral positions before repulsion
      if (!hasCachedRef.current) {
        refreshCenters();
      }

      isRepellingRef.current = true;
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const centers = cachedCentersRef.current;
      const controllers = controllersRef.current;

      for (let i = 0; i < controllers.length; i++) {
        const center = centers[i];
        if (!center || center.cx < 0) continue;

        const dx = center.cx - mouseX;
        const dy = center.cy - mouseY;
        const dist = Math.hypot(dx, dy);

        if (dist < RADIUS && dist > 0.001) {
          // Smoothstep falloff curve for seamless boundary transition
          const t = 1 - dist / RADIUS;
          const factor = t * t * (3 - 2 * t);
          const force = factor * MAX_REPULSION;

          const nx = dx / dist;
          const ny = dy / dist;

          const targetX = nx * force;
          const targetY = ny * force;
          // Micro-tilt based on horizontal displacement
          const targetRot = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, nx * force * 0.22));

          controllers[i].setTarget(targetX, targetY, targetRot);
        } else {
          controllers[i].setTarget(0, 0, 0);
        }
      }
    };

    const handlePointerLeave = () => {
      resetAll();
      hasCachedRef.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize);
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
      resetAll();
    };
  }, [isDesktop, reducedMotion]);

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Accessible screen reader full text */}
      <span className="sr-only">
        Hey Im Nabath Nuur, a Tech Enthusiast, I Build Digital Product, Transforming Ideas into Digital Experiences.
      </span>

      {/* Interactive characters with magnetic repulsion across 5 lines */}
      <div aria-hidden="true" className="flex flex-col gap-y-1 sm:gap-y-1.5 md:gap-y-2">
        {HEADLINE_LINES.map((line, lineIdx) => (
          <div
            key={lineIdx}
            className="flex flex-wrap items-baseline gap-x-[0.28em] whitespace-nowrap"
          >
            {line.words.map((wordItem, wordIdx) => {
              const wordColor = wordItem.isHighlight
                ? "text-white font-bold"
                : "text-white/40 font-medium";

              return (
                <span
                  key={`${lineIdx}-${wordIdx}`}
                  className={`inline-block whitespace-nowrap ${wordColor}`}
                >
                  {Array.from(wordItem.text).map((char, charIdx) => (
                    <MagneticChar
                      key={`${lineIdx}-${wordIdx}-${charIdx}`}
                      char={char}
                      className={wordColor}
                      isDesktop={isDesktop}
                      reducedMotion={reducedMotion}
                      register={registerChar}
                    />
                  ))}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
