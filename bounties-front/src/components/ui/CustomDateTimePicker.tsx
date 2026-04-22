"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CustomDatePicker from "./CustomDatePicker";

interface CustomDateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function clampToViewport(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// ─── Keyboard-typeable segment ──────────────────────────────────────────────
function TimeSegment({
  value,
  min,
  max,
  onCommit,
  disabled,
  ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  onCommit: (val: number) => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  const [raw, setRaw] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const displayed = raw !== null ? raw : pad(value);

  const commit = (str: string) => {
    const n = parseInt(str, 10);
    if (!isNaN(n)) onCommit(clamp(n, min, max));
    setRaw(null);
  };

  return (
    <span
      role="spinbutton"
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={disabled ? -1 : 0}
      className={`group inline-flex w-9 items-center justify-center rounded-lg py-0.5 text-xl font-bold tabular-nums select-none outline-none transition-colors ${
        disabled
          ? "cursor-not-allowed text-white/30"
          : focused
          ? "cursor-pointer text-[var(--color-primary)]"
          : "cursor-pointer text-white hover:text-[var(--color-primary)]"
      }`}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        if (raw !== null) commit(raw);
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          onCommit(value >= max ? min : value + 1);
          setRaw(null);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          onCommit(value <= min ? max : value - 1);
          setRaw(null);
        } else if (e.key === "Backspace") {
          e.preventDefault();
          setRaw("");
        } else if (/^\d$/.test(e.key)) {
          e.preventDefault();
          const next = raw === null ? e.key : raw + e.key;
          if (next.length >= 2) {
            commit(next.slice(-2));
          } else {
            setRaw(next);
            const n = parseInt(next, 10);
            if ((max === 23 && n > 2) || (max === 59 && n > 5)) {
              commit(next);
            }
          }
        } else if (e.key === "Enter" || e.key === "Tab") {
          if (raw !== null) commit(raw);
        }
      }}
    >
      {displayed}
    </span>
  );
}

// ─── Time Grid Popover — appears to the RIGHT ───────────────────────────────
function TimePopover({
  hours,
  minutes,
  onSelect,
  onClose,
  anchorRef,
}: {
  hours: number;
  minutes: number;
  onSelect: (h: number, m: number) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}) {
  const MINUTE_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const popoverRef = useRef<HTMLDivElement>(null);
  const hColRef = useRef<HTMLDivElement>(null);
  const mColRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const computePositionOnce = () => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    // Desired: appear to the RIGHT of the input, aligned to top.
    const gap = 8;
    const popoverWidth = 208; // tailwind w-52
    const popoverHeight = 320; // safe-ish max incl padding; we'll clamp anyway

    let leftViewport = rect.right + gap;
    // If it would go offscreen on the right, try placing to the left as fallback
    if (leftViewport + popoverWidth > window.innerWidth - 8) {
      leftViewport = rect.left - gap - popoverWidth;
    }

    let topViewport = rect.top;
    topViewport = clampToViewport(topViewport, 8, window.innerHeight - popoverHeight - 8);

    const leftClampedViewport = clampToViewport(
      leftViewport,
      8,
      window.innerWidth - popoverWidth - 8
    );

    // Convert to document coordinates so it won't follow scroll
    setPos({
      top: topViewport + window.scrollY,
      left: leftClampedViewport + window.scrollX,
    });
  };

  useLayoutEffect(() => {
    // Position only once when the popover mounts/opens
    computePositionOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const scrollTo = (el: HTMLElement | null) => {
      const selected = el?.querySelector<HTMLElement>("[data-selected='true']");
      selected?.scrollIntoView({ block: "center", behavior: "instant" });
    };
    scrollTo(hColRef.current);
    scrollTo(mColRef.current);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 150);
  };

  const nearestStep = MINUTE_STEPS.reduce((acc, s) => (s <= minutes ? s : acc), 0);

  const colClass = "flex flex-col gap-0.5 overflow-y-auto h-52 pr-1 scrollbar-hide";
  const itemBase =
    "flex items-center justify-center w-10 h-9 rounded-lg text-sm font-semibold tabular-nums cursor-pointer select-none transition-colors shrink-0";
  const itemActive = "bg-[var(--color-primary)] text-white";
  const itemIdle = "text-white/60 hover:bg-white/10 hover:text-white";

  if (!mounted) return null;

  return createPortal(
    <div
      ref={popoverRef}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.96)",
        transition: "opacity 150ms ease, transform 150ms ease",
        transformOrigin: "top left",
        position: "absolute",
        top: pos.top,
        left: pos.left,
        zIndex: 9999,
      }}
      className="w-52 rounded-xl border border-white/20 bg-[var(--color-background-card-campaign)] shadow-2xl p-4"
    >
      <p className="text-white font-semibold mb-4">Select time</p>

      <div className="flex gap-3 items-start">
        {/* Hours */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">
            HH
          </span>
          <div ref={hColRef} className={colClass}>
            {Array.from({ length: 24 }, (_, i) => (
              <button
                key={i}
                type="button"
                data-selected={i === hours}
                className={`${itemBase} ${i === hours ? itemActive : itemIdle}`}
                onClick={() => onSelect(i, minutes)}
              >
                {pad(i)}
              </button>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center pt-10">
          <span className="text-white/20 text-lg font-bold">:</span>
        </div>

        {/* Minutes */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">
            MM
          </span>
          <div ref={mColRef} className={colClass}>
            {MINUTE_STEPS.map((m) => (
              <button
                key={m}
                type="button"
                data-selected={m === nearestStep}
                className={`${itemBase} ${m === nearestStep ? itemActive : itemIdle}`}
                onClick={() => onSelect(hours, m)}
              >
                {pad(m)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 flex justify-end">
        <button
          type="button"
          onClick={handleClose}
          className="text-sm font-semibold text-[var(--color-primary)] hover:opacity-80 transition-opacity"
        >
          Done
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CustomDateTimePicker({
  value,
  onChange,
  className = "",
  disabled = false,
}: CustomDateTimePickerProps) {
  const [dateValue, timeValue] = value ? value.split("T") : ["", ""];

  const [hours, setHours] = useState(8);
  const [minutes, setMinutes] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timeValue) {
      const [h, m] = timeValue.split(":").map((s) => parseInt(s, 10));
      setHours(clamp(isNaN(h) ? 8 : h, 0, 23));
      setMinutes(clamp(isNaN(m) ? 0 : m, 0, 59));
    } else {
      setHours(8);
      setMinutes(0);
    }
  }, [timeValue]);

  const emitChange = (h: number, m: number, date?: string) => {
    const d = date ?? dateValue ?? new Date().toISOString().split("T")[0];
    onChange(`${d}T${pad(h)}:${pad(m)}`);
  };

  const handleDateChange = (newDate: string) => {
    if (newDate) emitChange(hours, minutes, newDate);
    else onChange("");
  };

  const handleHours = (h: number) => { setHours(h); emitChange(h, minutes); };
  const handleMinutes = (m: number) => { setMinutes(m); emitChange(hours, m); };
  const handlePopoverSelect = (h: number, m: number) => {
    setHours(h);
    setMinutes(m);
    emitChange(h, m);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <CustomDatePicker
        value={dateValue}
        onChange={handleDateChange}
        placeholder="Select Date"
        disabled={disabled}
      />

      <div>
        <label className="block text-white text-sm font-medium mb-2">Pick a time</label>

        <div className="relative" ref={wrapperRef}>
          {/* Input row — mirrors "Select Date" pill layout */}
          <div
            className={`flex items-center justify-between h-12 w-full rounded-full border px-4 transition-all ${
              disabled
                ? "border-white/10 bg-transparent cursor-not-allowed"
                : "border-white/50 bg-transparent hover:border-white/70 focus-within:border-white"
            }`}
          >
            {/* Left: HH : MM */}
            <div className="flex items-center gap-1">
              <TimeSegment value={hours} min={0} max={23} onCommit={handleHours} disabled={disabled} ariaLabel="Hours" />
              <span className="text-xl font-bold text-white/60 select-none leading-none">:</span>
              <TimeSegment value={minutes} min={0} max={59} onCommit={handleMinutes} disabled={disabled} ariaLabel="Minutes" />
            </div>

            {/* Right: clock icon — identical position to the calendar icon */}
            <button
              type="button"
              tabIndex={disabled ? -1 : 0}
              disabled={disabled}
              title="Open time picker"
              onClick={() => setPopoverOpen((o) => !o)}
              className={`flex items-center justify-center w-5 h-5 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                popoverOpen ? "text-[var(--color-primary)]" : "text-white hover:text-[var(--color-primary)]"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          {/* Popover — appears to the right */}
          {popoverOpen && !disabled && (
            <TimePopover
              hours={hours}
              minutes={minutes}
              onSelect={handlePopoverSelect}
              onClose={() => setPopoverOpen(false)}
              anchorRef={wrapperRef}
            />
          )}
        </div>
      </div>
    </div>
  );
}
