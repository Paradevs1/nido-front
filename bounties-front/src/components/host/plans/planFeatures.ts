export const FEATURES = [
  { label: "Public Campaigns", basic: true, core: true },
  { label: "Private Campaigns", basic: true, core: true },
  { label: "Automated Payments", basic: true, core: true },
  { label: "Priority Support", basic: true, core: true },
  { label: "Co-Marketing", basic: true, core: true },
  { label: "Advanced Analytics", basic: false, core: true },
  { label: "KOL Strategy Consulting", basic: false, core: true },
  { label: "Full Dashboard", basic: false, core: true, comingSoon: true },
] as const;

export type PlanFeature = (typeof FEATURES)[number];
