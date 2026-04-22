"use client";

import { formatPlanExpiry } from "./formatPlanExpiry";
import { FEATURES } from "./planFeatures";
import { BRAND } from "@/lib/branding/links";

export interface CorePlanStatusViewProps {
  /** Data de expiração do plano (ISO string). */
  expiresAt: string | null;
  /** Nome do plano (default: "Enterprise"). */
  planName?: string;
}

const CORE_FEATURES = FEATURES.filter((f) => f.core);
const TELEGRAM_SUPPORT_URL = BRAND.social.telegramSupport;

export default function CorePlanStatusView({ expiresAt, planName = "Enterprise" }: CorePlanStatusViewProps) {
  const normalizedPlan = String(planName || "").trim().toLowerCase();
  const isEnterprise = normalizedPlan === "enterprise";
  const isCorePlan = normalizedPlan === "core";
  const expiry = formatPlanExpiry(expiresAt);
  const validityLabel = isEnterprise ? "Active" : expiry.label;
  const validitySublabel = isEnterprise
    ? "Renews monthly while your subscription is paid ($300/month)."
    : expiry.sublabel;

  return (
    <div
      className="min-h-screen w-full bg-[var(--color-background)]"
      style={{ minHeight: "100vh" }}
    >
      {/* Background layers */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% -20%, rgba(255,87,1,0.18), transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        aria-hidden
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-32 pb-20 sm:px-6 sm:pt-36 lg:max-w-7xl lg:px-8">
        {/* Hero */}
        <header className="mb-12 text-center md:mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            You&apos;re on <span style={{ color: "var(--color-primary)" }}>{planName}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
            You have access to {isEnterprise ? "zero" : "reduced"} campaign fees and all {planName} features. Make the most of your
            plan.
          </p>
        </header>

        {/* Main grid: validity + fee | benefits */}
        <div className="grid gap-8 lg:grid-cols-[340px_1fr] lg:gap-10">
          {/* Col 1: Validity + Fee */}
          <div className="space-y-6">
            {/* Validity card */}
            <div
              className="overflow-hidden rounded-2xl border p-6 sm:p-8"
              style={{
                borderColor: "rgba(255,87,1,0.35)",
                background: "linear-gradient(180deg, rgba(255,87,1,0.1) 0%, rgba(255,87,1,0.02) 100%)",
                boxShadow: "0 0 40px -12px rgba(255,87,1,0.2)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "rgba(255,87,1,0.2)" }}
                >
                  <svg
                    className="h-6 w-6"
                    style={{ color: "var(--color-primary)" }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Plan validity
                  </p>
                  <p className="mt-0.5 text-2xl font-bold text-white sm:text-3xl">{validityLabel}</p>
                  {validitySublabel && <p className="mt-1 text-sm text-white/50">{validitySublabel}</p>}
                </div>
              </div>
            </div>

            {/* Enterprise price card (shown for all plans) */}
            <div
              className="overflow-hidden rounded-2xl border p-6 sm:p-8"
              style={{
                borderColor: "rgba(255,87,1,0.35)",
                background: "linear-gradient(180deg, rgba(255,87,1,0.1) 0%, rgba(255,87,1,0.02) 100%)",
                boxShadow: "0 0 40px -12px rgba(255,87,1,0.2)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "rgba(255,87,1,0.2)" }}
                >
                  <svg
                    className="h-6 w-6"
                    style={{ color: "var(--color-primary)" }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-2.21 0-4 .895-4 2s1.79 2 4 2 4 .895 4 2-1.79 2-4 2m0-10v10m9-5a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    {isEnterprise ? "Enterprise price" : "Upgrade to Enterprise"}
                  </p>
                  <p className="mt-0.5 text-2xl font-bold text-white sm:text-3xl">$300</p>
                  <p className="mt-1 text-sm text-white/50">
                    {isEnterprise ? "To keep Enterprise active, it costs $300/month." : "To become Enterprise, it costs $300/month."}
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign fee card (same style as validity/price) */}
            <div
              className="overflow-hidden rounded-2xl border p-6 sm:p-8"
              style={{
                borderColor: "rgba(255,87,1,0.35)",
                background: "linear-gradient(180deg, rgba(255,87,1,0.1) 0%, rgba(255,87,1,0.02) 100%)",
                boxShadow: "0 0 40px -12px rgba(255,87,1,0.2)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "rgba(255,87,1,0.2)" }}
                >
                  <svg
                    className="h-6 w-6"
                    style={{ color: "var(--color-primary)" }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 14l2 2 4-4m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Your campaign fee
                  </p>
                  <p className="mt-0.5 text-2xl font-bold text-white sm:text-3xl">
                    {isEnterprise ? "0%" : isCorePlan ? "6%–3%" : "12%"}
                  </p>
                  <p className="mt-1 text-sm text-white/50">
                    {isEnterprise
                      ? "No service fee on any campaign."
                      : isCorePlan
                        ? "Progressive: 6% up to $2k, 5% up to $5k, 3% above."
                        : "Standard service fee on campaign payments."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: What's included */}
          <div
            className="rounded-2xl border p-6 sm:p-8"
            style={{
              borderColor: "rgba(255,87,1,0.25)",
              background: "linear-gradient(180deg, rgba(255,87,1,0.06) 0%, rgba(255,87,1,0.015) 100%)",
              boxShadow: "0 0 60px -18px rgba(255,87,1,0.18)",
            }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">
              What&apos;s included
            </h2>
            <p className="mt-2 text-base text-white/70">
              Everything you have access to with {planName}
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-3">
              {CORE_FEATURES.map((f, index) => {
                const isLastOddRow =
                  CORE_FEATURES.length % 2 === 1 &&
                  index === CORE_FEATURES.length - 1;
                return (
                <li
                  key={f.label}
                  className={`flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3.5 ${isLastOddRow ? "col-span-2 justify-center" : ""}`}
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: "linear-gradient(180deg, rgba(255,87,1,0.35) 0%, rgba(255,87,1,0.12) 100%)",
                      border: "1px solid rgba(255,87,1,0.4)",
                    }}
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      style={{ color: "rgb(239 68 68)" }}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="flex min-w-0 items-center gap-x-2 text-sm font-medium text-white/90 sm:flex-nowrap">
                    <span className="whitespace-nowrap">{f.label}</span>
                    {"comingSoon" in f && f.comingSoon && (
                      <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/50 whitespace-nowrap">
                        Coming soon
                      </span>
                    )}
                  </span>
                </li>
              );
              })}
            </ul>
          </div>
        </div>

        {/* Footer CTA */}
        <p className="mt-14 text-center text-sm text-white/50">
          Need to renew or have questions?{" "}
          <a
            href={TELEGRAM_SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2 hover:opacity-90"
            style={{ color: "var(--color-primary)" }}
          >
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
