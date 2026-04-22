"use client";

import type { PlanFeature } from "./planFeatures";
import { PlanFeatureList } from "./PlanFeatureList";
import { BRAND } from "@/lib/branding/links";

export interface PlanCardEnterpriseProps {
  features: readonly PlanFeature[];
}

export function PlanCardEnterprise({ features }: PlanCardEnterpriseProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--color-primary)]/40 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent shadow-[0_0_40px_-12px_rgba(255,87,1,0.15)] transition-all hover:border-[var(--color-primary)]/60 hover:shadow-[0_0_50px_-12px_rgba(255,87,1,0.2)]">
      <div className="absolute right-4 top-4">
        <span className="rounded-full bg-[var(--color-primary)]/20 px-3 py-1 text-[10px] font-semibold tracking-wider text-white uppercase">
          Recommended
        </span>
      </div>
      <div className="flex flex-1 flex-col p-8">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-white">Enterprise</h2>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-semibold tracking-tight text-white">Contact us to get started</span>
          </div>
          <p className="mt-1 text-sm text-white/50"></p>
        </div>
        <div className="mb-8 flex min-h-[7.5rem] flex-col justify-end border-t border-white/10 pt-6">
          <p className="text-xs font-medium tracking-wider text-white/40 uppercase">
            Campaign fee
          </p>
          <p className="mt-1 text-sm text-white/80">0% — no service fee</p>
        </div>
        <div className="flex-1 space-y-4">
          <PlanFeatureList
            features={features}
            variant="core"
          />
        </div>
        <div className="mt-10 pt-8 border-t border-white/10">
          <a
            href={BRAND.social.telegramSupport}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-full border border-[var(--color-button-border)] bg-[var(--color-button-bg)] py-3.5 text-center text-sm font-semibold text-[var(--color-button-text)] shadow-[0_4px_0_0_var(--color-button-shadow)] transition-all active:translate-y-[2px] hover:opacity-95 cursor-pointer"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
