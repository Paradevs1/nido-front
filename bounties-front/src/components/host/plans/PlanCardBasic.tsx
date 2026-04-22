"use client";

import type { PlanFeature } from "./planFeatures";
import { PlanFeatureList } from "./PlanFeatureList";

export interface PlanCardBasicProps {
  features: readonly PlanFeature[];
  loadingPlan: boolean;
  isBasic: boolean;
}

export function PlanCardBasic({ features, loadingPlan, isBasic }: PlanCardBasicProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/15">
      <div className="flex flex-1 flex-col p-8">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-white/90">Basic</h2>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-semibold tracking-tight text-white">Free</span>
          </div>
        </div>
        <div className="mb-8 flex min-h-[7.5rem] flex-col justify-end border-t border-white/10 pt-6">
          <p className="text-xs font-medium tracking-wider text-white/40 uppercase">
            Campaign fee
          </p>
          <p className="mt-1 text-sm text-white/80">12% — no minimum cap</p>
        </div>
        <div className="flex-1 space-y-4">
          <PlanFeatureList
            features={features}
            variant="basic"
          />
        </div>
        <div className="mt-10 pt-8 border-t border-white/10">
          {loadingPlan ? (
            <div className="rounded-xl bg-white/5 py-3 text-center text-sm font-medium text-white/40">
              Loading...
            </div>
          ) : isBasic ? (
            <div className="rounded-xl bg-white/5 py-3 text-center text-sm font-medium text-white/50">
              Your current plan
            </div>
          ) : (
            <div className="rounded-xl bg-white/5 py-3 text-center text-sm font-medium text-white/40">
              Free
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
