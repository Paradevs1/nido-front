"use client";

import { useState } from "react";

interface FilterDropdownProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export default function FilterDropdown({ showFilters, setShowFilters }: FilterDropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-card)] text-white rounded-2xl"
      >
        FILTER
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showFilters && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--color-card)] rounded-lg shadow-lg p-6 z-10">
          <div className="space-y-6">
            <div>
              <h4 className="text-white font-semibold mb-4 text-base">Filter by</h4>
              <div className="space-y-3">
                {[
                  { name: "Open", color: "bg-green-500" },
                  { name: "In Review", color: "bg-yellow-500" },
                  { name: "Participating", color: "bg-orange-500" },
                  { name: "Completed", color: "bg-gray-500" }
                ].map((status, index) => (
                  <label key={status.name} className={`flex items-center justify-between text-sm text-white p-2 rounded cursor-pointer hover:bg-[var(--color-accent)] transition-colors ${
                    index === 0 ? 'bg-[var(--color-accent)]' : ''
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-lg ${status.color}`}></span>
                      <span>{status.name}</span>
                    </div>
                    <input type="checkbox" defaultChecked={index === 0} className="w-4 h-4 rounded-lg bg-transparent checked:bg-[var(--color-accent)]" />
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4 text-base">Sort By</h4>
              <div className="space-y-4">
                {[
                  { name: "Deadline", icon: "" },
                  { name: "Prize", icon: "" },
                  { name: "Submissions", icon: "" }
                ].map((sort) => (
                  <div key={sort.name} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <span>{sort.icon}</span>
                      <span>{sort.name}</span>
                    </div>
                    <div className="space-y-2 ml-6">
                      {["High to Low", "Low to High"].map((order, orderIndex) => (
                        <label key={order} className={`flex items-center justify-between text-xs text-gray-300 p-1 rounded cursor-pointer hover:bg-[var(--color-accent)] transition-colors ${
                          orderIndex === 0 ? 'bg-[var(--color-accent)]' : ''
                        }`}>
                          <span>{order}</span>
                          <input type="checkbox" name={sort.name} defaultChecked={orderIndex === 0} className="w-4 h-4 rounded-lg bg-transparent checked:bg-white" />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
