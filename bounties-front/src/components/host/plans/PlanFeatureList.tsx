"use client";

import type { PlanFeature } from "./planFeatures";

function Check() {
  return (
    <svg
      className="w-5 h-5 text-emerald-400/90"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CrossRed() {
  return (
    <svg
      className="w-5 h-5 text-red-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export interface PlanFeatureListProps {
  features: readonly PlanFeature[];
  variant: "basic" | "core";
}

export function PlanFeatureList({ features, variant }: PlanFeatureListProps) {
  return (
    <>
      {features.map((f) => (
        <div
          key={f.label}
          className="grid grid-cols-[1fr_auto] items-center gap-4"
        >
          <span
            className={
              variant === "basic"
                ? "min-w-0 text-sm text-white/70"
                : "min-w-0 text-sm text-white/80"
            }
          >
            {f.label}
            {variant === "core" && f.comingSoon && (
              <span className="ml-2 text-[10px] font-medium tracking-wide text-white/40 uppercase">
                Coming soon
              </span>
            )}
          </span>
          <span className="flex w-5 justify-end shrink-0">
            {variant === "basic" ? (f.basic ? <Check /> : <CrossRed />) : f.core ? <Check /> : <CrossRed />}
          </span>
        </div>
      ))}
    </>
  );
}
