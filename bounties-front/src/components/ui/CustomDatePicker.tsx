"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function clampToViewport(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = "Select Date",
  className = "",
  disabled = false
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const anchorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  
  const selectedDate = value ? (() => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  })() : null;
  
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const today = new Date();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({
        day,
        isCurrentMonth: true,
        isToday: currentDate.toDateString() === today.toDateString(),
        isSelected: selectedDate ? currentDate.toDateString() === selectedDate.toDateString() : false
      });
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
    
    return days;
  };
  
  const handleDateSelect = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const isoString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(isoString);
    setIsOpen(false);
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };
  
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const isoString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(isoString);
    setIsOpen(false);
  };
  
  const clearDate = () => {
    onChange("");
    setIsOpen(false);
  };
  
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return placeholder;
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [value]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const computePositionOnce = () => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const gap = 8;
    const popoverWidth = 360; // close to the calendar width
    const popoverHeight = 420; // safe-ish; clamp

    let leftViewport = rect.right + gap;
    if (leftViewport + popoverWidth > window.innerWidth - 8) {
      leftViewport = rect.left - gap - popoverWidth;
    }

    let topViewport = rect.top;
    topViewport = clampToViewport(topViewport, 8, window.innerHeight - popoverHeight - 8);

    setPos({
      top: topViewport + window.scrollY,
      left:
        clampToViewport(leftViewport, 8, window.innerWidth - popoverWidth - 8) +
        window.scrollX,
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    // Position only once when opening
    computePositionOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);
  
  const days = getDaysInMonth(currentMonth);
  
  return (
    <div className={`relative ${className}`} ref={anchorRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`group w-full bg-transparent text-white px-4 py-3 rounded-full border border-white/50 outline-none transition-all text-left flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span>{formatDisplayDate(value)}</span>
        <svg className={`w-5 h-5 cursor-pointer transition-colors ${disabled ? 'text-white' : 'text-white group-hover:text-[var(--color-primary)]'} ${isOpen ? 'text-[var(--color-primary)]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      
      {mounted && isOpen && !disabled &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 9999 }}
            className="w-[22.5rem] rounded-lg shadow-lg border border-white/20 bg-[var(--color-background-card-campaign)] p-4"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => navigateMonth('prev')} className="p-1 hover:bg-white/10 rounded">
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={() => navigateMonth('next')} className="p-1 hover:bg-white/10 rounded">
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-white/60 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((dayData, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(dayData.day, dayData.isCurrentMonth)}
                  className={`w-8 h-8 text-sm rounded-full flex items-center justify-center transition-colors ${
                    dayData.isSelected
                      ? 'bg-blue-500 text-white border-2 border-blue-600'
                      : dayData.isToday
                      ? 'bg-blue-100 text-blue-600 border-2 border-blue-300'
                      : dayData.isCurrentMonth
                      ? 'text-white hover:bg-white/10'
                      : 'text-white/40'
                  }`}
                  disabled={!dayData.isCurrentMonth}
                >
                  {dayData.day}
                </button>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between mt-4 pt-3 border-t border-white/20">
              <button onClick={clearDate} className="text-white/60 hover:text-white text-sm font-medium">
                Clear
              </button>
              <button onClick={goToToday} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Today
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
