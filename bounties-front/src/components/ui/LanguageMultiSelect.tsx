"use client";

import { useState, useRef, useMemo } from "react";
import useOnClickOutside from "@/lib/hooks/useOnClickOutside";
import type { RefObject } from "react";

export interface LanguageOption {
  value: string;
  label: string;
}

interface LanguageMultiSelectProps {
  options: LanguageOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxDropdownHeight?: number;
  /** When false, only one option can be selected and dropdown closes on select */
  multiple?: boolean;
}

export default function LanguageMultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select languages",
  className = "",
  disabled = false,
  maxDropdownHeight = 280,
  multiple = true,
}: LanguageMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(containerRef as RefObject<HTMLElement | null>, () => {
    if (isOpen) {
      setIsOpen(false);
      setSearch("");
    }
  });

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    );
  }, [options, search]);

  const selectedLabels = useMemo(
    () => options.filter((o) => value.includes(o.value)).map((o) => o.label),
    [options, value]
  );

  const handleToggle = (optionValue: string) => {
    if (multiple) {
      const next = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange(next);
    } else {
      onChange([optionValue]);
      setIsOpen(false);
      setSearch("");
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full bg-transparent text-white px-4 py-3 rounded-full border border-white/50 outline-none transition-all text-left flex items-center justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <span className="truncate">
          {selectedLabels.length > 0
            ? selectedLabels.join(", ")
            : placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-white flex-shrink-0 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--color-background-card-campaign)] rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="p-2 border-b border-white/10 sticky top-0 bg-[var(--color-background-card-campaign)]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search languages..."
              className="w-full bg-white/5 text-white placeholder:text-white/40 px-4 py-2.5 rounded-xl border border-white/20 focus:outline-none focus:border-[var(--color-primary)] transition-all text-sm"
              autoFocus
            />
          </div>
          <div
            className="overflow-y-auto overscroll-contain py-1"
            style={{ maxHeight: maxDropdownHeight }}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">
                No languages found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleToggle(option.value)}
                    className="w-full text-left px-4 py-2.5 flex items-center justify-between gap-2 hover:bg-white/5 transition-colors text-white text-sm"
                  >
                    <span className="truncate">{option.label}</span>
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                          : "border-white/50 bg-transparent"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-black"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
