"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Terminal, X, Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import { STICKER_DATA } from "./FloatingStickers";

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
  onSelectSticker?: (info: StickerInfo) => void;
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

const STICKER_SHORTCUTS = [
  { key: "ub", label: "UB" },
  { key: "laptop", label: "Laptop" },
  { key: "cat", label: "Cat" },
  { key: "cv", label: "CV" },
] as const;

export default function TerminalModal({
  sticker,
  onClose,
  onSelectSticker,
  className = "",
}: TerminalModalProps) {
  const [copied, setCopied] = useState(false);
  const currentInfo = sticker || STANDBY_DATA;
  const isStandby = !sticker;

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
    const textToCopy = `${currentInfo.title}\n${currentInfo.description}\n` +
      (currentInfo.fields?.map((f) => `${f.label}: ${f.value}`).join("\n") || "");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-white/15 bg-[#242933]/92 shadow-[0_20px_50px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl font-mono text-xs sm:text-sm text-[#D8DEE9] select-none ${className}`}
    >
      {/* Ambient top terminal glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-[#88C0D0]/10 blur-3xl" />

      {/* Terminal Window Header Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#2E3440] px-4 py-3 select-none">
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
            nabath@cosmic-os: ~/{currentInfo.id}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy terminal telemetry"
            className="rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
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
      <div className="relative z-10 p-4 sm:p-5 space-y-3.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentInfo.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-3.5"
          >
            {/* Shell prompt execution line */}
            <div className="flex items-center gap-2 text-[#88C0D0] text-xs sm:text-[13px]">
              <span className="text-[#A3BE8C] font-bold">➜</span>
              <span className="text-[#81A1C1] font-semibold">~</span>
              <span className="text-white/90 truncate">{currentInfo.command}</span>
            </div>

            {/* Primary info card */}
            <div className="rounded-xl border border-white/10 bg-[#2E3440]/70 p-3.5 sm:p-4 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#88C0D0]" />
                  <span className="text-sm font-bold text-white tracking-wide">
                    {currentInfo.title}
                  </span>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                    currentInfo.badgeColor ||
                    "border border-[#88C0D0]/30 bg-[#88C0D0]/10 text-[#88C0D0]"
                  }`}
                >
                  {currentInfo.badge}
                </span>
              </div>

              <p className="mt-2.5 text-xs sm:text-[13px] leading-relaxed text-[#D8DEE9]/85 font-sans">
                {currentInfo.description}
              </p>
            </div>

            {/* Structured Specs / Metadata Fields */}
            {currentInfo.fields && currentInfo.fields.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-[#1E222A]/60 p-3 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35 pb-1 border-b border-white/[0.05]">
                  Telemetry & Specifications
                </div>
                <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                  {currentInfo.fields.map((field) => (
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
        </AnimatePresence>

        {/* Quick Inspection Buttons */}
        {onSelectSticker && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/[0.06]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/35 mr-1">
              Inspect:
            </span>
            {STICKER_SHORTCUTS.map((item) => {
              const active = currentInfo.id === STICKER_DATA[item.key]?.id;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectSticker(STICKER_DATA[item.key])}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-mono transition-all duration-200 ${
                    active
                      ? "border border-[#88C0D0]/60 bg-[#88C0D0]/20 text-white font-bold"
                      : "border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            {!isStandby && (
              <button
                type="button"
                onClick={onClose}
                className="ml-auto text-[11px] font-mono text-white/40 hover:text-white/80 transition-colors"
              >
                [reset]
              </button>
            )}
          </div>
        )}

        {/* Terminal Footer with status & blinking prompt */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-white/40">
          <div className="flex items-center gap-1.5">
            <span className="text-[#A3BE8C]">➜</span>
            <span className="text-[#81A1C1]">status:</span>
            <span className={isStandby ? "text-[#88C0D0] font-semibold" : "text-[#A3BE8C] font-semibold"}>
              {isStandby ? "STANDBY_ONLINE" : "INSPECTING"}
            </span>
            <span className="inline-block h-3.5 w-1.5 bg-[#88C0D0] animate-pulse ml-0.5" />
          </div>

          <span className="text-[10px] text-white/30 font-mono">
            {isStandby ? "click sticker to inspect" : "click [ESC] to reset"}
          </span>
        </div>
      </div>
    </div>
  );
}
