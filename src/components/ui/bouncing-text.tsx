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
  className?: string;
}

const INTENSITY_MAP = {
  subtle: {
    y: ["0em", "-0.22em", "0em", "-0.09em", "0em", "0em"],
    scaleY: [1, 1, 0.92, 1, 0.96, 1],
  },
  medium: {
    y: ["0em", "-0.42em", "0em", "-0.16em", "0em", "0em"],
    scaleY: [1, 1, 0.86, 1, 0.94, 1],
  },
  strong: {
    y: ["0em", "-0.70em", "0em", "-0.28em", "0em", "0em"],
    scaleY: [1, 1, 0.80, 1, 0.90, 1],
  },
};

export function BouncingText({
  children,
  text,
  intensity = "medium",
  stagger = 0.05,
  duration = 0.85,
  repeatDelay = 1.8,
  delayOffset = 0,
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
    return content.split(" ").map((word) => {
      const chars = word.split("").map((char) => ({
        char,
        index: globalIndex++,
      }));
      return chars;
    });
  }, [content, delayOffset]);

  // Accessibility: fallback to static text if user prefers reduced motion
  if (reduceMotion) {
    return (
      <span className={cn("inline-block", className)} style={style} {...props}>
        {content}
      </span>
    );
  }

  const config = INTENSITY_MAP[intensity];

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
            {chars.map(({ char, index }) => (
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
                        y: config.y,
                        scaleY: config.scaleY,
                      }
                    : {
                        y: "0em",
                        scaleY: 1,
                      }
                }
                transition={{
                  duration,
                  delay: index * stagger,
                  repeat: Infinity,
                  repeatDelay,
                  times: [0, 0.28, 0.52, 0.72, 0.88, 1],
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {char}
              </motion.span>
            ))}
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
