"use client";

import { useState, useEffect } from "react";
import { getMyPlan } from "@/lib/api/plan";
import type { GetMyPlanResponse } from "@/lib/api/plan";
import CorePlanStatusView from "@/components/host/plans/CorePlanStatusView";
import PlanComparisonCards from "@/components/host/plans/PlanComparisonCards";
import { PlansPageSkeleton } from "@/components/host/plans/PlansPageSkeleton";

export default function HostPlansPage() {
  const [myPlan, setMyPlan] = useState<GetMyPlanResponse | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMyPlan()
      .then((data) => {
        if (!cancelled) setMyPlan(data);
      })
      .catch(() => {
        if (!cancelled) setMyPlan(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingPlan(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const planName = String(myPlan?.plan?.name ?? "").toUpperCase();
  const isCoreActive = planName === "CORE" && Boolean(myPlan?.is_active);
  const isEnterpriseActive = planName === "ENTERPRISE" && Boolean(myPlan?.is_active);

  const handleSubscribeSuccess = () => {
    getMyPlan().then(setMyPlan);
  };

  if (loadingPlan) {
    return <PlansPageSkeleton />;
  }

  if (isEnterpriseActive) {
    return <CorePlanStatusView expiresAt={myPlan?.expires_at ?? null} planName="Enterprise" />;
  }

  if (isCoreActive) {
    return <CorePlanStatusView expiresAt={myPlan?.expires_at ?? null} planName="Core" />;
  }

  return (
    <PlanComparisonCards
      myPlan={myPlan}
      loadingPlan={loadingPlan}
      onSubscribeSuccess={handleSubscribeSuccess}
    />
  );
}
