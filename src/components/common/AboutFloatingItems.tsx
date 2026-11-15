"use client";

import CatHeadPointer from "@/components/svg/CatHeadPointer";
import { motion, useReducedMotion, type MotionValue } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Code2,
  Cpu,
  Flame,
  GitBranch,
  Layers,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import React from "react";

// Asset imports
import cvImg from "../sticker/cv.png";
import laptopImg from "../sticker/laptop.png";
import sotoImg from "../sticker/soto_lamongan.png";
import ubImg from "../sticker/ub.png";

interface AboutFloatingItemsProps {
  introOpacity: MotionValue<number>;
}

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  floatY?: number;
  duration?: number;
  rotate?: number;
  delay?: number;
}

function FloatingCard({
  children,
  className = "",
  floatY = 8,
  duration = 5,
  rotate = 0,
  delay = 0,
}: FloatingCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 50 }}
      initial={{ opacity: 0, scale: 0.6, rotate }}
      animate={
        reduceMotion
          ? { opacity: 1, scale: 1, rotate }
          : {
              opacity: 1,
              scale: 1,
              y: [0, -floatY, 0],
              rotate: [rotate, rotate + 1.5, rotate],
            }
      }
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay, type: "spring", stiffness: 240 },
        y: {
          duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay,
        },
        rotate: {
          duration: duration * 1.2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay,
        },
      }}
      className={`pointer-events-auto absolute cursor-default select-none will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function AboutFloatingItems({
  introOpacity,
}: AboutFloatingItemsProps) {
  return (
    <motion.div
      style={{ opacity: introOpacity }}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-hidden"
      aria-hidden="true"
    >
      {/* =========================================================================
          1. TOP-LEFT: Code Craft / Daily Streak Card (Ref: Quality Time / Games Night)
          ========================================================================= */}
      <FloatingCard
        className="hidden lg:block top-[10%] left-[3%] xl:left-[6%]"
        rotate={-3.5}
        floatY={10}
        duration={5.2}
        delay={0.1}
      >
        <div className="flex flex-col gap-1.5 rounded-2xl border border-white/70 bg-[#ECEFF4] p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.18)] text-[#2E3440] min-w-[195px] max-w-[215px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#4C566A]">
              CODE CRAFT
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3BE8C] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A3BE8C]" />
            </span>
          </div>
          <p className="text-xs font-bold leading-tight text-[#2E3440]">
            Daily GitHub Streak
          </p>
          <p className="text-[10px] text-[#4C566A]">420+ commits in 2026</p>
          <div className="mt-1 flex items-center justify-between pt-1.5 border-t border-[#D8DEE9]">
            <div className="flex -space-x-1.5">
              <span className="h-4 w-4 rounded-full bg-[#88C0D0] border border-[#ECEFF4] flex items-center justify-center text-[8px] font-bold text-[#2E3440]">
                R
              </span>
              <span className="h-4 w-4 rounded-full bg-[#81A1C1] border border-[#ECEFF4] flex items-center justify-center text-[8px] font-bold text-white">
                F
              </span>
              <span className="h-4 w-4 rounded-full bg-[#B48EAD] border border-[#ECEFF4] flex items-center justify-center text-[8px] font-bold text-white">
                T
              </span>
            </div>
            <span className="flex items-center gap-1 text-[9px] font-mono font-semibold text-[#5E81AC]">
              <GitBranch className="h-2.5 w-2.5" /> main
            </span>
          </div>
        </div>
      </FloatingCard>

      {/* =========================================================================
          2. TOP-MID LEFT: Goal Complete Lime Pill (Ref: Lime "Goal complete! ✓" pill)
          ========================================================================= */}
      <FloatingCard
        className="hidden md:block top-[12%] left-[24%] xl:left-[27%]"
        rotate={-5}
        floatY={8}
        duration={4.4}
        delay={0.2}
      >
        <div className="flex items-center gap-2 rounded-full border border-[#8FBC8F] bg-[#A3BE8C] px-4 py-2 text-xs font-bold text-[#2E3440] shadow-[0_10px_24px_rgba(163,190,140,0.35)]">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2E3440] text-[#A3BE8C]">
            <Check className="h-2.5 w-2.5 stroke-[3]" />
          </span>
          <span className="tracking-tight">Build successful!</span>
          <Sparkles className="h-3.5 w-3.5 text-[#2E3440]" />
        </div>
      </FloatingCard>

      {/* =========================================================================
          3. TOP-MID RIGHT: Core Stack Squircle Badge (Ref: Food & Nutrition Badge)
          ========================================================================= */}
      <FloatingCard
        className="hidden md:block top-[10%] right-[24%] xl:right-[27%]"
        rotate={4}
        floatY={7}
        duration={4.8}
        delay={0.3}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-[#ECEFF4] p-2.5 px-3.5 text-[#2E3440] shadow-[0_12px_24px_rgba(0,0,0,0.16)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#88C0D0]/20 text-[#5E81AC]">
            <Layers className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#4C566A]">
              CORE STACK
            </span>
            <span className="text-xs font-bold text-[#2E3440]">
              Flutter & React
            </span>
          </div>
        </div>
      </FloatingCard>

      {/* =========================================================================
          4. TOP-RIGHT: Cosmic Terminal Preview (Ref: Lentil Coconut Curry pill)
          ========================================================================= */}
      <FloatingCard
        className="hidden lg:block top-[9%] right-[3%] xl:right-[6%]"
        rotate={2.5}
        floatY={9}
        duration={5.8}
        delay={0.25}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-[#ECEFF4] p-2 pr-4 text-[#2E3440] shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
          <div className="h-10 w-10 overflow-hidden rounded-xl bg-[#2E3440] p-1 flex items-center justify-center">
            <img
              src={laptopImg}
              alt="Cosmic Terminal"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-tight text-[#2E3440]">
              Cosmic Terminal
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[#4C566A]">
              <Star className="h-2.5 w-2.5 fill-[#EBCB8B] text-[#EBCB8B]" />
              <span className="font-semibold text-[#2E3440]">5.0</span>
              <span>• Nord OS</span>
            </span>
          </div>
        </div>
      </FloatingCard>

      {/* =========================================================================
          5. MID-RIGHT (UPPER): Culinary Fuel Preview (Ref: Chilli Broccoli pill)
          ========================================================================= */}

      {/* =========================================================================
          6. MID-LEFT: Coffee Chat / Developer Philosophy (Ref: Speech bubble)
          ========================================================================= */}
      <FloatingCard
        className="hidden md:block top-[34%] left-[2%] xl:left-[4%]"
        rotate={1.5}
        floatY={9}
        duration={6.2}
        delay={0.15}
      >
        <div className="flex flex-col gap-1.5 rounded-2xl rounded-tl-sm border border-white/70 bg-[#ECEFF4] p-4 text-[#2E3440] shadow-[0_14px_32px_rgba(0,0,0,0.2)] max-w-[215px]">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#5E81AC]">
            <span>Nabath Nuur</span>
            <span>•</span>
            <span>Chat ☕</span>
          </div>
          <p className="text-xs font-medium leading-relaxed text-[#2E3440]">
            "Crafting clean, accessible, and delightful digital interfaces."
          </p>
        </div>
      </FloatingCard>

      {/* =========================================================================
          7. BOTTOM-LEFT (UPPER): Campus / UB Milestone Card (Ref: Family Reflection)
          ========================================================================= */}
      <FloatingCard
        className="hidden md:block bottom-[22%] left-[3%] xl:left-[5%]"
        rotate={-3.5}
        floatY={9}
        duration={5.7}
        delay={0.4}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-[#ECEFF4] p-3 pr-4 text-[#2E3440] shadow-[0_14px_30px_rgba(0,0,0,0.18)] max-w-[240px]">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white/70 p-1 flex items-center justify-center border border-white/80">
            <img
              src={ubImg}
              alt="Universitas Brawijaya"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#5E81AC]">
              ACADEMIC
            </span>
            <span className="truncate text-xs font-bold text-[#2E3440]">
              Univ. Brawijaya
            </span>
            <span className="text-[10px] text-[#4C566A]">
              IT Major • Class of '26
            </span>
          </div>
        </div>
      </FloatingCard>

      {/* =========================================================================
          8. BOTTOM-LEFT (LOWER): Cyan Reminder Pill (Ref: Blue "DON'T FORGET" pill)
          ========================================================================= */}
      <FloatingCard
        className="hidden lg:block bottom-[8%] left-[12%] xl:left-[16%]"
        rotate={2.5}
        floatY={7}
        duration={4.6}
        delay={0.5}
      >
        <div className="flex items-center gap-2 rounded-full border border-[#7BB5C5] bg-[#88C0D0] px-4 py-2 text-xs font-bold text-[#2E3440] shadow-[0_10px_24px_rgba(136,192,208,0.35)]">
          <span>Always ship 60fps & tests</span>
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2E3440] text-[#88C0D0]">
            <Check className="h-2 w-2 stroke-[3]" />
          </span>
        </div>
      </FloatingCard>

      {/* =========================================================================
          9. BOTTOM-CENTER: 60 FPS Wave Pill (Ref: "16 MIN WALK" wave pill)
          ========================================================================= */}
      <FloatingCard
        className="hidden md:block bottom-[7%] left-[50%] -translate-x-1/2"
        rotate={0}
        floatY={6}
        duration={4.0}
        delay={0.3}
      >
        <div className="flex items-center gap-3.5 rounded-full border border-white/20 bg-[#2E3440]/90 px-4 py-2 text-white shadow-2xl backdrop-blur-md">
          <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#88C0D0]">
            <Zap className="h-3 w-3 text-[#EBCB8B]" /> 60 FPS MOTION
          </span>
          <span className="h-3.5 w-px bg-white/20" />
          {/* Sinusoidal Wave SVG */}
          <svg
            width="56"
            height="18"
            viewBox="0 0 56 18"
            fill="none"
            className="text-[#88C0D0]"
          >
            <path
              d="M1 9 C 9 0, 18 18, 27 9 C 36 0, 45 18, 54 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="53" cy="9" r="2.5" fill="#A3BE8C" />
          </svg>
        </div>
      </FloatingCard>

      {/* =========================================================================
          10. MID-RIGHT (LOWER): UI Motion Yellow Badge (Ref: Activity & Fitness badge)
          ========================================================================= */}
      <FloatingCard
        className="hidden md:block bottom-[24%] right-[3%] xl:right-[5%]"
        rotate={4.5}
        floatY={8}
        duration={5.3}
        delay={0.45}
      >
        <div className="flex flex-col gap-1 rounded-2xl border border-[#D8A657] bg-[#EBCB8B] p-3.5 text-[#2E3440] shadow-[0_14px_30px_rgba(235,203,139,0.3)] min-w-[175px]">
          <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#7D5A18]">
            PASSION
          </span>
          <span className="text-xs font-bold leading-tight text-[#2E3440]">
            UI Motion & Polish
          </span>
          <div className="mt-1 flex items-center justify-between text-[10px] text-[#7D5A18] font-semibold pt-1 border-t border-[#D8A657]/40">
            <span>Fluid Design</span>
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2E3440] text-[#EBCB8B]">
              <Check className="h-2 w-2 stroke-[3]" />
            </span>
          </div>
        </div>
      </FloatingCard>

      {/* =========================================================================
          11. BOTTOM-RIGHT: CV / Profile Badge
          ========================================================================= */}
      <FloatingCard
        className="hidden lg:block bottom-[9%] right-[14%] xl:right-[17%]"
        rotate={-2.5}
        floatY={8}
        duration={5.1}
        delay={0.5}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-[#ECEFF4] p-2.5 pr-4 text-[#2E3440] shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
          <div className="h-9 w-9 overflow-hidden rounded-xl bg-white p-1 flex items-center justify-center shadow-inner">
            <img
              src={cvImg}
              alt="Curriculum Vitae"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-tight text-[#2E3440]">
              Resume / Profile
            </span>
            <span className="text-[10px] font-semibold text-[#A3BE8C]">
              Open to Opportunities
            </span>
          </div>
        </div>
      </FloatingCard>

      {/* =========================================================================
          12. PLAYFUL DOODLES (Paper airplane, Clapping hands, Cosmo Cat, Sparkles)
          ========================================================================= */}

      {/* Doodled Paper Airplane with Dashed Flight Arc (Ref: Airplane near headline) */}
      <motion.div
        className="pointer-events-none absolute hidden xl:block top-[22%] right-[22%]"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <svg width="120" height="70" viewBox="0 0 120 70" fill="none">
          {/* Dashed wind trail */}
          <path
            d="M 5 60 Q 55 10, 100 25"
            stroke="#88C0D0"
            strokeWidth="1.8"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          {/* Paper airplane */}
          <g transform="translate(95, 18) rotate(15)">
            <polygon
              points="0,0 20,-8 16,12"
              fill="#ECEFF4"
              stroke="#2E3440"
              strokeWidth="1.5"
            />
            <polygon points="0,0 16,12 8,6" fill="#D8DEE9" />
          </g>
        </svg>
      </motion.div>

      {/* Doodled Cat Head Pointer (Bottom Right) */}
      <motion.div
        className="pointer-events-none absolute hidden md:block bottom-[18%] right-[24%] opacity-70"
        animate={{
          rotate: [0, 8, -6, 0],
          y: [0, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <CatHeadPointer className="h-10 w-10 drop-shadow-[0_4px_12px_rgba(136,192,208,0.3)]" />
      </motion.div>

      {/* Clapping Hands Doodle (Bottom Left near UB card) */}
      <motion.div
        className="pointer-events-none absolute hidden xl:block bottom-[34%] left-[18%] opacity-80"
        animate={{
          scale: [1, 1.15, 1],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <span className="text-2xl select-none">🙌</span>
      </motion.div>

      {/* Little Floating Sparkles (Scattered accents) */}
      <motion.span
        className="pointer-events-none absolute hidden lg:block top-[26%] left-[22%] text-sm text-[#EBCB8B] select-none"
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        ✦
      </motion.span>
      <motion.span
        className="pointer-events-none absolute hidden lg:block bottom-[20%] left-[26%] text-xs text-[#88C0D0] select-none"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      >
        ✧
      </motion.span>
      <motion.span
        className="pointer-events-none absolute hidden lg:block top-[18%] right-[19%] text-xs text-[#A3BE8C] select-none"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3.2, repeat: Infinity, delay: 0.8 }}
      >
        ✦
      </motion.span>
    </motion.div>
  );
}
