"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";

export interface TextRollProps {
  children: string;
  duration?: number;
  stagger?: number;
  pauseDuration?: number;
  loop?: boolean;
  className?: string;
}

/**
 * TextRoll Component
 * Inspired by @ibelick's Text Roll component on 21st.dev & Motion Primitives.
 * Splits text into words and individual characters, animating each character
 * with a vertical 3D mechanical flip/rotation effect with staggered timing.
 */
export function TextRoll({
  children,
  duration = 0.55,
  stagger = 0.018,
  pauseDuration = 2,
  loop = true,
  className = "",
}: TextRollProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(containerRef, { margin: "100px 0px" });
  const reduceMotion = useReducedMotion();
  const [rollKey, setRollKey] = useState(0);
  const hasTriggeredInitial = useRef(false);

  // Split text into words, then words into characters with global sequential indexing
  const wordData = useMemo(() => {
    let globalIndex = 0;
    return children.split(" ").map((word) => {
      const chars = word.split("").map((char) => ({
        char,
        index: globalIndex++,
      }));
      return { word, chars };
    });
  }, [children]);

  const totalChars = useMemo(() => {
    return wordData.reduce((acc, w) => acc + w.chars.length, 0);
  }, [wordData]);

  // Total duration of a full wave cascade across the entire sentence
  const totalWaveDuration = useMemo(() => {
    return Math.max(0, (totalChars - 1) * stagger) + duration;
  }, [totalChars, stagger, duration]);

  // Initial trigger after scrolling into view
  useEffect(() => {
    if (!inView || reduceMotion) return;

    if (!hasTriggeredInitial.current) {
      hasTriggeredInitial.current = true;
      const initialTimer = setTimeout(() => {
        setRollKey(1);
      }, 700);
      return () => clearTimeout(initialTimer);
    }
  }, [inView, reduceMotion]);

  // Continuous looping interval
  useEffect(() => {
    if (!loop || !inView || reduceMotion || rollKey === 0) return;

    const cycleTime = (totalWaveDuration + pauseDuration) * 1000;
    const timer = setTimeout(() => {
      setRollKey((prev) => prev + 1);
    }, cycleTime);

    return () => clearTimeout(timer);
  }, [loop, inView, reduceMotion, rollKey, totalWaveDuration, pauseDuration]);

  // Fallback for users with reduced motion preference
  if (reduceMotion) {
    return <span className={className}>{children}</span>;
  }

  const isAnimating = rollKey > 0;

  return (
    <span
      ref={containerRef}
      className={`inline ${className}`}
      onMouseEnter={() => {
        if (!reduceMotion) {
          setRollKey((prev) => prev + 1);
        }
      }}
    >
      {wordData.map(({ chars }, wordIdx) => (
        <React.Fragment key={wordIdx}>
          <span className="inline-flex whitespace-nowrap">
            {chars.map(({ char, index }) => (
              <span
                key={`${wordIdx}-${index}`}
                className="relative inline-block overflow-hidden [perspective:800px] select-none py-[0.04em]"
                style={{ verticalAlign: "top" }}
              >
                <motion.span
                  key={rollKey}
                  className="relative flex flex-col [transform-style:preserve-3d]"
                  initial={{ y: "0%" }}
                  animate={isAnimating ? { y: "-100%" } : { y: "0%" }}
                  transition={{
                    duration,
                    delay: isAnimating ? index * stagger : 0,
                    ease: [0.22, 1, 0.36, 1], // Smooth cubic-bezier mechanical easing
                  }}
                >
                  {/* Face 1: Current character rolling up and folding back */}
                  <motion.span
                    className="inline-block [transform-origin:bottom] [backface-visibility:hidden]"
                    initial={{ rotateX: 0, opacity: 1 }}
                    animate={
                      isAnimating
                        ? { rotateX: 90, opacity: 0.15 }
                        : { rotateX: 0, opacity: 1 }
                    }
                    transition={{
                      duration,
                      delay: isAnimating ? index * stagger : 0,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {char}
                  </motion.span>

                  {/* Face 2: Incoming duplicate character rolling up from bottom and unfolding */}
                  <motion.span
                    className="absolute left-0 top-full inline-block [transform-origin:top] [backface-visibility:hidden]"
                    initial={{ rotateX: -90, opacity: 0.15 }}
                    animate={
                      isAnimating
                        ? { rotateX: 0, opacity: 1 }
                        : { rotateX: -90, opacity: 0.15 }
                    }
                    transition={{
                      duration,
                      delay: isAnimating ? index * stagger : 0,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {char}
                  </motion.span>
                </motion.span>
              </span>
            ))}
          </span>

          {/* Space between words */}
          {wordIdx < wordData.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

export default TextRoll;

