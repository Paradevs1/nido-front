"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import BaseButton from "@/components/ui/Button";
import {
  BRAND_DISPLAY_NAME,
  BRAND_LOGO_MARK_SRC,
  BRAND_SITE_URL,
} from "@/lib/branding/links";

const DEFAULT_DELAY_SECONDS = 15;

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function RedirectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur">
        <div className="flex justify-center mb-6">
          <Image
            src={BRAND_LOGO_MARK_SRC}
            alt={`${BRAND_DISPLAY_NAME} logo`}
            width={96}
            height={96}
            className="h-14 w-14 object-contain"
            priority
          />
        </div>

        <h1 className="text-3xl font-bold text-white">
          We&apos;ve moved to a new name and domain
        </h1>
        <p className="mt-4 text-white/70 text-base leading-relaxed">
          <span className="font-semibold text-white">Bounties</span> is now{" "}
          <span className="font-semibold text-white">{BRAND_DISPLAY_NAME}</span>.
          <br />
          You&apos;ll be redirected to{" "}
          <span className="font-semibold text-white">{BRAND_SITE_URL}</span>.
        </p>

        {children}
      </div>
    </main>
  );
}

function CountdownCard({
  secondsLeft,
  progress,
  target,
}: {
  secondsLeft: number;
  progress: number;
  target: string;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 px-6 py-6">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100" aria-hidden>
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="rgba(255,87,1,0.95)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={(1 - progress) * 2 * Math.PI * 44}
              style={{ transition: "stroke-dashoffset 700ms ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-white tabular-nums leading-none">
              {secondsLeft}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-white/50">
              seconds
            </div>
          </div>
        </div>

        <div className="min-w-0 text-center sm:text-left">
          <p className="text-sm text-white/70">Auto-redirect in progress.</p>
          <p className="mt-1 text-xs text-white/45 break-all">
            Destination: {target}
          </p>
        </div>
      </div>
    </div>
  );
}

function RedirectContent({ from }: { from: string | null }) {
  const target = useMemo(() => {
    const raw = (from ?? "").trim();
    const pathAndQuery = raw ? safeDecodeURIComponent(raw) : "/";
    try {
      return new URL(pathAndQuery, BRAND_SITE_URL).toString();
    } catch {
      return BRAND_SITE_URL;
    }
  }, [from]);

  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_DELAY_SECONDS);
  const progress = useMemo(() => {
    const total = DEFAULT_DELAY_SECONDS;
    const remaining = Math.min(total, Math.max(0, secondsLeft));
    const ratio = (total - remaining) / total;
    return Math.min(1, Math.max(0, ratio));
  }, [secondsLeft]);

  const handleGoNow = () => {
    window.location.assign(target);
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (secondsLeft !== 0) return;
    window.location.assign(target);
  }, [secondsLeft, target]);

  return (
    <>
      <CountdownCard secondsLeft={secondsLeft} progress={progress} target={target} />

      <div className="mt-8 flex justify-center">
        <BaseButton
          variant="default"
          onClick={handleGoNow}
          className="w-full max-w-sm px-6 py-3 font-semibold cursor-pointer"
        >
          Go to {BRAND_DISPLAY_NAME} now
        </BaseButton>
      </div>

      <p className="mt-8 text-xs text-white/45">
        If the redirect doesn&apos;t work, use the button above.
      </p>
    </>
  );
}

export function RedirectFallback() {
  return (
    <RedirectLayout>
      <CountdownCard
        secondsLeft={DEFAULT_DELAY_SECONDS}
        progress={0}
        target={BRAND_SITE_URL}
      />

      <div className="mt-8 flex justify-center">
        <BaseButton
          variant="default"
          onClick={() => {
            if (typeof window !== "undefined") window.location.assign(BRAND_SITE_URL);
          }}
          className="w-full max-w-sm px-6 py-3 font-semibold cursor-pointer"
        >
          Go to {BRAND_DISPLAY_NAME} now
        </BaseButton>
      </div>

      <p className="mt-8 text-xs text-white/45">
        If the redirect doesn&apos;t work, use the button above.
      </p>
    </RedirectLayout>
  );
}

export default function RedirectClient() {
  const searchParams = useSearchParams();
  const from = searchParams?.get("from");

  return (
    <RedirectLayout>
      <RedirectContent from={from} />
    </RedirectLayout>
  );
}

