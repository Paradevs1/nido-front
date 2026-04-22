"use client";

import React from "react";

export type PlanBadgeVariant = "basic" | "core" | "enterprise";

interface PlanBadgeProps {
  variant: PlanBadgeVariant;
  className?: string;
}

const PlanBadge: React.FC<PlanBadgeProps> = ({ variant, className = "" }) => {
  const label = variant === "enterprise" ? "Enterprise" : variant === "core" ? "Core" : "Basic";

  if (variant === "basic" || variant === "core") {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full font-semibold text-white overflow-hidden
          px-2 py-1 text-[10px]
          sm:px-3 sm:py-1.5 sm:text-xs
          md:px-4 md:py-1.5 md:text-xs
          lg:px-5 lg:py-2 lg:text-sm
          ${className}`}
        style={{
          background: "#2A4A5F",
          border: "0.1px solid rgba(255, 255, 255, 0.35)",
          cursor: "default",
        }}
      >
        <span className="relative z-10">{label}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex rounded-full p-[1.5px] ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(255,87,1,0.95) 0%, rgba(255,140,60,0.7) 35%, rgba(255,87,1,0.9) 70%, rgba(255,120,40,0.85) 100%)",
        boxShadow: `
          0 0 14px rgba(255, 87, 1, 0.35),
          0 0 28px rgba(255, 87, 1, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.12)
        `,
        cursor: "default",
      }}
    >
      <div
        className="flex items-center justify-center rounded-full font-semibold text-white
          px-2 py-1 text-[10px]
          sm:px-3 sm:py-1.5 sm:text-xs
          md:px-4 md:py-1.5 md:text-xs
          lg:px-5 lg:py-2 lg:text-sm"
        style={{
          background: "linear-gradient(180deg, rgba(22,22,30,0.98) 0%, rgba(18,18,24,0.98) 100%)",
        }}
      >
        <span
          className="relative z-10"
          style={{ textShadow: "0 0 24px rgba(255,87,1,0.35)" }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export default PlanBadge;
