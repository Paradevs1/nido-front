"use client";

import type { PlanFeature } from "./planFeatures";
import { PlanFeatureList } from "./PlanFeatureList";

export interface PlanCardCoreProps {
  features: readonly PlanFeature[];
  loadingPlan: boolean;
  isCoreActive: boolean;
  onSubscribeClick: () => void;
}

export function PlanCardCore({
  features,
  loadingPlan,
  isCoreActive,
  onSubscribeClick,
}: PlanCardCoreProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--color-primary)]/40 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent shadow-[0_0_40px_-12px_rgba(255,87,1,0.15)] transition-all hover:border-[var(--color-primary)]/60 hover:shadow-[0_0_50px_-12px_rgba(255,87,1,0.2)]">
      <div className="absolute right-4 top-4">
        <span className="rounded-full bg-[var(--color-primary)]/20 px-3 py-1 text-[10px] font-semibold tracking-wider text-white uppercase">
          Recommended
        </span>
      </div>
      <div className="flex flex-1 flex-col p-8">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-white">Core</h2>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-semibold tracking-tight text-white">$300</span>
          </div>
          <p className="mt-1 text-sm text-white/50">Valid for 3 months</p>
        </div>
        <div className="mb-8 flex min-h-[7.5rem] flex-col border-t border-white/10 pt-6">
          <p className="text-xs font-medium tracking-wider text-white/40 uppercase">
            Campaign fee
          </p>
          <div className="mt-2 space-y-1 text-sm text-white/80">
            <p>Up to $2,000: 6%</p>
            <p>$2,001 – $5,000: 5%</p>
            <p>Above $5,000: 3% (cap)</p>
            <p className="pt-1 text-xs text-white/45">Progressive by monthly volume</p>
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <PlanFeatureList
            features={features}
            variant="core"
          />
        </div>
        <div className="mt-10 pt-8 border-t border-white/10">
          {loadingPlan ? (
            <div className="rounded-xl bg-white/5 py-3.5 text-center text-sm font-medium text-white/40">
              Loading...
            </div>
          ) : isCoreActive ? (
            <div className="rounded-xl bg-white/5 py-3 text-center text-sm font-medium text-white/50">
              Your current plan
            </div>
          ) : (
            <button
              type="button"
              onClick={onSubscribeClick}
              className="flex w-full items-center justify-center rounded-full border border-[var(--color-button-border)] bg-[var(--color-button-bg)] py-3.5 text-center text-sm font-semibold text-[var(--color-button-text)] shadow-[0_4px_0_0_var(--color-button-shadow)] transition-all active:translate-y-[2px] hover:opacity-95 cursor-pointer"
            >
              Subscribe to Core
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
