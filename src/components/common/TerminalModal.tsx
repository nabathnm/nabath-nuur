"use client";

import Glass from "@/components/ui/glass";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Copy, RefreshCw, Sparkles, Terminal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface StickerInfo {
  id: string;
  command: string;
  title: string;
  badge: string;
  badgeColor?: string;
  description: string;
  fields?: Array<{ label: string; value: string }>;
  accent?: string;
}

export interface TerminalModalProps {
  sticker: StickerInfo | null;
  onClose: () => void;
  className?: string;
}

const STANDBY_DATA: StickerInfo = {
  id: "portfolio",
  command: "systemctl status cosmic-terminal.service",
  title: "Nabath Nuur • Dev Console",
  badge: "SYSTEM STANDBY",
  badgeColor: "border border-[#88C0D0]/30 bg-[#88C0D0]/10 text-[#88C0D0]",
  description:
    "Interactive terminal console online. Click or drag any floating sticker on the screen (UB, Laptop, Cat, CV) to inspect live telemetry and specs.",
  fields: [
    { label: "User", value: "nabath@cosmic-os (Nord Edition)" },
    { label: "Specialization", value: "Mobile & Frontend Engineer" },
    { label: "Core Tech", value: "Flutter • React • TypeScript • Next.js" },
    { label: "Interactive", value: "4 Telemetry Satellites Ready" },
  ],
};

export default function TerminalModal({
  sticker,
  onClose,
  className = "",
}: TerminalModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const targetInfo = sticker || STANDBY_DATA;
  const targetCommand = targetInfo.command;

  const [copied, setCopied] = useState(false);
  const [displayedCommand, setDisplayedCommand] = useState("");
  const [activeInfo, setActiveInfo] = useState<StickerInfo>(targetInfo);
  const [showOutput, setShowOutput] = useState(false);
  const [terminalStatus, setTerminalStatus] = useState<"idle" | "typing" | "deleting">("typing");

  const currentTextRef = useRef("");
  const lastExecutedCommandRef = useRef<string | null>(null);

  // Typing and backspacing execution effect
  useEffect(() => {
    // If current target command is already executed and showing output, do not re-run
    if (lastExecutedCommandRef.current === targetCommand && showOutput) {
      return;
    }

    // Accessibility: instant display if reduced motion is requested
    if (prefersReducedMotion) {
      currentTextRef.current = targetCommand;
      setDisplayedCommand(targetCommand);
      setActiveInfo(targetInfo);
      setShowOutput(true);
      setTerminalStatus("idle");
      lastExecutedCommandRef.current = targetCommand;
      return;
    }

    let isCancelled = false;
    let timer: number | null = null;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, ms);
      });

    const runTerminalSequence = async () => {
      lastExecutedCommandRef.current = targetCommand;

      // 1. Immediately hide previous command's output
      setShowOutput(false);

      // 2. Backspace delete current displayed command down to empty string
      if (currentTextRef.current.length > 0) {
        setTerminalStatus("deleting");
        while (currentTextRef.current.length > 0) {
          if (isCancelled) return;
          currentTextRef.current = currentTextRef.current.slice(0, -1);
          setDisplayedCommand(currentTextRef.current);
          await sleep(12);
        }
      }

      if (isCancelled) return;

      // 3. Brief pause at empty prompt before writing the new command
      await sleep(80);
      if (isCancelled) return;

      // 4. Update the active info for header and specs
      setActiveInfo(targetInfo);
      setTerminalStatus("typing");

      // 5. Type out targetCommand character by character
      const target = targetCommand;
      for (let i = 1; i <= target.length; i++) {
        if (isCancelled) return;
        currentTextRef.current = target.slice(0, i);
        setDisplayedCommand(currentTextRef.current);
        await sleep(20);
      }

      if (isCancelled) return;

      // 6. Simulate brief execution pause (like pressing Enter)
      await sleep(160);
      if (isCancelled) return;

      // 7. Reveal command output and return to idle state
      setShowOutput(true);
      setTerminalStatus("idle");
    };

    runTerminalSequence();

    return () => {
      isCancelled = true;
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [targetCommand, targetInfo, prefersReducedMotion]);

  // Reset to standby on Escape key press if a sticker is currently active
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sticker) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sticker, onClose]);

  const handleCopy = () => {
    const textToCopy = `${activeInfo.title}\n${activeInfo.description}\n` +
      (activeInfo.fields?.map((f) => `${f.label}: ${f.value}`).join("\n") || "");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isStandby = !sticker;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-white/[0.12] bg-[#242933]/65 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.45),0_0_40px_rgba(136,192,208,0.06)] font-mono text-xs sm:text-sm text-[#D8DEE9] select-none ${className}`}
    >
      {/* Specular glass bevel & highlight border layer */}
      <Glass rounded="rounded-2xl" />

      {/* Terminal Window Header Bar (Frosted translucent) */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] bg-[#2E3440]/60 backdrop-blur-md px-4 py-3 select-none">
        {/* Traffic light window controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            title={isStandby ? "Terminal Standby" : "Reset to Standby (ESC)"}
            aria-label="Reset or close inspection"
            className="group relative flex h-3 w-3 items-center justify-center rounded-full bg-[#BF616A] transition-transform hover:scale-110 active:scale-95"
          >
            <X className="h-2 w-2 text-[#2E3440] opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
          <span className="h-3 w-3 rounded-full bg-[#EBCB8B]/80" />
          <span className="h-3 w-3 rounded-full bg-[#A3BE8C]/80" />
        </div>

        {/* Terminal Title */}
        <div className="flex items-center gap-2 text-white/70 text-xs">
          <Terminal className="h-3.5 w-3.5 text-[#88C0D0]" />
          <span className="font-mono text-[11px] sm:text-xs tracking-tight">
            nabath@cosmic-os: ~/{activeInfo.id}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!showOutput}
            title="Copy terminal telemetry"
            className="rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[#A3BE8C]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
          {!isStandby && (
            <button
              type="button"
              onClick={onClose}
              title="Return to Standby"
              className="rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Window Content with Smooth Transitions */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-between min-h-[360px] sm:min-h-[390px]">
        <div>
          {/* Shell prompt execution line */}
          <div className="flex items-center gap-2 text-[#88C0D0] text-xs sm:text-[13px] font-mono min-h-[24px]">
            <span className="text-[#A3BE8C] font-bold select-none">➜</span>
            <span className="text-white/90 break-all">
              {displayedCommand}
              <span
                className={`inline-block h-3.5 w-1 ml-0.5 bg-[#88C0D0] align-middle ${
                  terminalStatus === "idle" ? "animate-pulse" : "opacity-100"
                }`}
              />
            </span>
          </div>

          {/* Structured Specs / Metadata Fields */}
          <div className="mt-3.5">
            <AnimatePresence mode="wait">
              {showOutput && (
                <motion.div
                  key={activeInfo.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3.5"
                >
                  {activeInfo.fields && activeInfo.fields.length > 0 && (
                    <div className="rounded-xl border border-white/[0.08] bg-[#1E222A]/50 backdrop-blur-md p-3.5 sm:p-4 space-y-2.5 shadow-inner shadow-black/20">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#88C0D0]" />
                          <span className="text-sm font-bold text-white tracking-wide">
                            {activeInfo.title}
                          </span>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                            activeInfo.badgeColor ||
                            "border border-[#88C0D0]/30 bg-[#88C0D0]/10 text-[#88C0D0]"
                          }`}
                        >
                          {activeInfo.badge}
                        </span>
                      </div>

                      <p className="text-xs sm:text-[13px] leading-relaxed text-[#D8DEE9]/85 font-sans">
                        {activeInfo.description}
                      </p>

                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35 pt-1 pb-1 border-b border-white/[0.05]">
                        Telemetry & Specifications
                      </div>

                      <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                        {activeInfo.fields.map((field) => (
                          <div
                            key={field.label}
                            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 text-xs"
                          >
                            <span className="text-[#81A1C1] shrink-0 font-mono text-[11px]">
                              {field.label}:
                            </span>
                            <span className="text-[#ECEFF4] font-sans text-xs">
                              {field.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Terminal Footer with status & blinking prompt */}
        <div className="flex items-center justify-between border-t border-white/[0.06] text-white/40 select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-[#A3BE8C] font-bold select-none">➜</span>
            <span className="text-[#81A1C1]">status:</span>
            <span
              className={
                terminalStatus === "deleting"
                  ? "text-[#BF616A] font-semibold"
                  : terminalStatus === "typing"
                  ? "text-[#EBCB8B] font-semibold"
                  : isStandby
                  ? "text-[#88C0D0] font-semibold"
                  : "text-[#A3BE8C] font-semibold"
              }
            >
              {terminalStatus === "deleting"
                ? "CLEARING_BUFFER"
                : terminalStatus === "typing"
                ? "EXECUTING"
                : isStandby
                ? "STANDBY_ONLINE"
                : "INSPECTING"}
            </span>
          </div>

          <span className="text-[10px] text-white/30 font-mono">
            {terminalStatus === "deleting"
              ? "backspacing command..."
              : terminalStatus === "typing"
              ? "streaming script..."
              : isStandby
              ? "click sticker to inspect"
              : "click [ESC] to reset"}
          </span>
        </div>
      </div>
    </div>
  );
}
