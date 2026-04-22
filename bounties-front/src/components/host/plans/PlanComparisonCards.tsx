"use client";

import type { GetMyPlanResponse } from "@/lib/api/plan";
import { PlanCardBasic } from "./PlanCardBasic";
import { PlanCardEnterprise } from "./PlanCardEnterprise";
import { FEATURES } from "./planFeatures";
// TODO: descomentar em 2~3 semanas quando voltarmos a cobrar Core
// import { useState } from "react";
// import SubscribePlanModal from "./SubscribePlanModal";
// import { PlanCardCore } from "./PlanCardCore";

export interface PlanComparisonCardsProps {
  myPlan: GetMyPlanResponse | null;
  loadingPlan: boolean;
  onSubscribeSuccess: () => void;
}

export default function PlanComparisonCards({
  myPlan,
  loadingPlan,
  onSubscribeSuccess,
}: PlanComparisonCardsProps) {
  // TODO: descomentar quando voltar o card Core: useState, isCoreActive, SubscribePlanModal
  void onSubscribeSuccess;

  const isBasic =
    myPlan?.plan?.name === "BASIC" || (myPlan?.plan?.name === "CORE" && !myPlan?.is_active);

  return (
    <div className="min-h-screen w-full" style={{ background: "var(--color-background)" }}>
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,87,1,0.06), transparent 60%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-32 pb-28">
        <header className="mb-20 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Plans for early partners
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/50">
            Choose the plan that fits your workflow. Upgrade or change anytime.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
          <PlanCardBasic
            features={FEATURES}
            loadingPlan={loadingPlan}
            isBasic={isBasic}
          />
          {/* TODO(2-3 sem): trocar PlanCardEnterprise por PlanCardCore + SubscribePlanModal - ver PlanCardCore.tsx */}
          <PlanCardEnterprise features={FEATURES} />
        </div>
      </div>
    </div>
  );
}
