"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import useOnClickOutside from "@/lib/hooks/useOnClickOutside";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  id?: string;
  options: readonly SelectOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  className?: string;
  /** Classes extras no botão (ex.: rounded-lg py-2 para filtros compactos) */
  triggerClassName?: string;
  /** Classes extras no painel da lista (ex.: max-h-72) */
  menuClassName?: string;
  /** Campo de busca no topo do menu (filtra por label e value) */
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  multiple?: boolean;
}

export default function CustomSelect({
  id,
  options,
  value,
  onChange,
  placeholder = "Select",
  className = "",
  triggerClassName,
  menuClassName,
  searchable = false,
  searchPlaceholder = "Buscar…",
  disabled = false,
  multiple = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useOnClickOutside(containerRef as RefObject<HTMLElement | null>, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  useEffect(() => {
    if (!isOpen) setSearchQuery("");
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable) {
      const t = requestAnimationFrame(() => searchInputRef.current?.focus());
      return () => cancelAnimationFrame(t);
    }
  }, [isOpen, searchable]);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const q = searchQuery.trim().toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [options, searchQuery, searchable]);

  const selectedOption = Array.isArray(value) 
    ? options.filter(option => value.includes(option.value))
    : options.find(option => {
        const optionValue = typeof option.value === 'string' ? option.value.trim() : option.value;
        const propValue = typeof value === 'string' ? value.trim() : value;
        return optionValue === propValue;
      });

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues.length > 0 ? newValues : []);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const dropdownBody =
    filteredOptions.length === 0 ? (
      <div className="px-4 py-3 text-sm text-white/50">Nenhum resultado</div>
    ) : (
      filteredOptions.map((option, optIndex) => {
        const isSelected = multiple
          ? Array.isArray(value) && value.includes(option.value)
          : (typeof value === "string" ? value.trim() : value) ===
            (typeof option.value === "string" ? option.value.trim() : option.value);

        return (
          <button
            key={option.value === "" ? `__empty-${optIndex}` : `${option.value}-${optIndex}`}
            type="button"
            onClick={() => !option.disabled && handleSelect(option.value)}
            disabled={option.disabled}
            className={cn(
              "flex w-full items-center justify-between px-4 py-3 text-left transition-colors",
              !searchable && optIndex === 0 && "rounded-t-2xl",
              optIndex === filteredOptions.length - 1 && "rounded-b-2xl",
              option.disabled
                ? "pointer-events-none cursor-not-allowed text-gray-400 opacity-50"
                : cn(
                    "text-white",
                    !multiple && isSelected && "bg-[var(--color-primary)]/25 text-white",
                    !multiple && !isSelected && "hover:bg-white/10",
                    multiple && !option.disabled && "hover:bg-white/10"
                  )
            )}
          >
            {multiple ? (
              <>
                <div className="flex items-center gap-2">
                  {option.icon && option.icon}
                  <span>{option.label}</span>
                </div>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                    isSelected ? "border-white bg-white" : "border-white/50"
                  }`}
                >
                  {isSelected && (
                    <svg className="h-3 w-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {option.icon && option.icon}
                <span>{option.label}</span>
              </div>
            )}
          </button>
        );
      })
    );

  return (
    <div ref={containerRef} className={cn("relative", className)} id={id ? `${id}-container` : undefined}>
      <button
        id={id}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full bg-transparent text-white px-4 py-3 rounded-full border border-white/50 outline-none transition-all text-left flex items-center justify-between",
          !disabled && isOpen && "ring-2 ring-[var(--color-primary)] border-[var(--color-primary)]/50",
          !disabled && "cursor-pointer hover:border-white/70 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
          disabled && "opacity-50 cursor-not-allowed",
          triggerClassName
        )}
      >
        <span>
          {multiple 
            ? (Array.isArray(selectedOption) && selectedOption.length > 0
                ? selectedOption.map(opt => opt.label).join(', ')
                : placeholder)
            : (selectedOption ? (Array.isArray(selectedOption) ? selectedOption[0]?.label : selectedOption.label) : placeholder)
          }
        </span>
        <svg 
          className={cn(
            `w-5 h-5 text-white transition-transform ${isOpen ? "rotate-180" : ""}`,
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          )}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && !disabled && (
        <div
          className={cn(
            "absolute z-50 w-full mt-1 rounded-2xl border border-white/20 bg-[var(--color-background-card-campaign)] shadow-lg",
            searchable
              ? "flex max-h-72 flex-col overflow-hidden"
              : cn("max-h-60 overflow-y-auto overscroll-contain", menuClassName)
          )}
        >
          {searchable && (
            <div className="shrink-0 border-b border-white/10 bg-[var(--color-background-card-campaign)] p-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          )}
          {searchable ? (
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain",
                menuClassName || "max-h-56"
              )}
            >
              {dropdownBody}
            </div>
          ) : (
            dropdownBody
          )}
        </div>
      )}
    </div>
  );
}
