"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import React, { useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

export interface BouncingTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Text content as string or children */
  children?: string;
  text?: string;
  /**
   * Amplitude of the bounce:
   * - 'subtle': gentle micro-bounce
   * - 'medium': balanced, expressive rebound (default)
   * - 'strong': energetic leap off the baseline
   */
  intensity?: "subtle" | "medium" | "strong";
  /** Stagger delay between each letter in seconds (default: 0.05s) */
  stagger?: number;
  /** Duration of a single letter bounce in seconds (default: 0.85s) */
  duration?: number;
  /** Pause between continuous looping waves in seconds (default: 1.8s) */
  repeatDelay?: number;
  /** Offset count of previous letters (useful when combining multiple styled words) */
  delayOffset?: number;
  /**
   * Tempo behavior:
   * - 'varied' | 'organic': Every character has its own dynamic speed, tempo, and playful rhythm (default)
   * - 'wave': Progressive tempo wave (accelerating and decelerating smoothly)
   * - 'uniform': Classic uniform tempo
   */
  tempo?: "varied" | "organic" | "wave" | "uniform";
  /**
   * Intensity of tempo variance between characters (0 = uniform, 1 = maximum expressive variation, default: 0.45)
   */
  variation?: number;
  className?: string;
}

const INTENSITY_BASE = {
  subtle: { peak1: 0.22, peak2: 0.09, squash1: 0.92, squash2: 0.96 },
  medium: { peak1: 0.42, peak2: 0.16, squash1: 0.86, squash2: 0.94 },
  strong: { peak1: 0.70, peak2: 0.28, squash1: 0.80, squash2: 0.90 },
};

export function BouncingText({
  children,
  text,
  intensity = "medium",
  stagger = 0.05,
  duration = 0.85,
  repeatDelay = 1.8,
  delayOffset = 0,
  tempo = "varied",
  variation = 0.45,
  className = "",
  style,
  ...props
}: BouncingTextProps) {
  const content = text ?? children ?? "";
  const containerRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(containerRef, { margin: "100px 0px" });
  const reduceMotion = useReducedMotion();

  // Split into words and characters with absolute index for continuous staggering
  const words = useMemo(() => {
    let globalIndex = delayOffset;
    return content.split(" ").map((word, wordIdx) => {
      const chars = word.split("").map((char) => ({
        char,
        index: globalIndex++,
        wordIdx,
      }));
      return chars;
    });
  }, [content, delayOffset]);

  const totalChars = useMemo(
    () => words.reduce((acc, w) => acc + w.length, 0),
    [words]
  );

  // Accessibility: fallback to static text if user prefers reduced motion
  if (reduceMotion) {
    return (
      <span className={cn("inline-block", className)} style={style} {...props}>
        {content}
      </span>
    );
  }

  const baseConfig = INTENSITY_BASE[intensity];

  return (
    <span
      ref={containerRef}
      className={cn("inline-flex flex-wrap items-baseline select-none", className)}
      style={style}
      {...props}
    >
      {words.map((chars, wordIdx) => (
        <React.Fragment key={wordIdx}>
          <span className="inline-flex whitespace-nowrap">
            {chars.map(({ char, index }) => {
              // Deterministic pseudo-randomness based on character index (zero hydration mismatch)
              const seed = Math.abs(
                (Math.sin(index * 12.9898 + (wordIdx + 1) * 78.233) * 43758.5453) % 1
              );
              const seed2 = Math.abs(
                (Math.cos(index * 23.1415 + (wordIdx + 1) * 45.678) * 23421.631) % 1
              );

              let durationMult = 1;
              let delayJitter = 0;
              let repeatDelayJitter = 0;
              let heightFactor = 1;

              if (tempo === "varied" || tempo === "organic") {
                // Tempo variation: some letters bounce quick & springy, others more relaxed
                durationMult = 1 + (seed - 0.5) * 0.55 * variation;
                // Organic syncopation jitter in stagger
                delayJitter = (seed2 - 0.5) * stagger * 0.85 * variation;
                // Polyrhythmic repeat delay so bounces evolve naturally over time
                repeatDelayJitter = (seed - 0.5) * 0.45 * variation;
                // Subtle bounce height personality
                heightFactor = 1 + (seed2 - 0.5) * 0.3 * variation;
              } else if (tempo === "wave") {
                // Progressive tempo wave (accelerating and decelerating)
                const waveVal = Math.sin((index / Math.max(1, totalChars)) * Math.PI);
                durationMult = 0.85 + 0.35 * waveVal * variation;
                heightFactor = 0.9 + 0.25 * waveVal * variation;
              }

              const charDuration = Math.max(0.35, duration * durationMult);
              const charDelay = Math.max(0, index * stagger + delayJitter);
              const charRepeatDelay = Math.max(0.4, repeatDelay + repeatDelayJitter);

              const peak1 = `-${(baseConfig.peak1 * heightFactor).toFixed(3)}em`;
              const peak2 = `-${(baseConfig.peak2 * heightFactor).toFixed(3)}em`;
              const squash1 = Math.max(0.7, 1 - (1 - baseConfig.squash1) * heightFactor);
              const squash2 = Math.max(0.85, 1 - (1 - baseConfig.squash2) * heightFactor);

              return (
                <motion.span
                  key={`${wordIdx}-${index}`}
                  className="inline-block origin-bottom"
                  style={{
                    display: "inline-block",
                    verticalAlign: "baseline",
                  }}
                  animate={
                    inView
                      ? {
                          y: ["0em", peak1, "0em", peak2, "0em", "0em"],
                          scaleY: [1, 1, squash1, 1, squash2, 1],
                        }
                      : {
                          y: "0em",
                          scaleY: 1,
                        }
                  }
                  transition={{
                    duration: charDuration,
                    delay: charDelay,
                    repeat: Infinity,
                    repeatDelay: charRepeatDelay,
                    times: [0, 0.28, 0.52, 0.72, 0.88, 1],
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>

          {/* Preserve space between words */}
          {wordIdx < words.length - 1 && (
            <span className="inline-block whitespace-pre">&nbsp;</span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

export default BouncingText;
