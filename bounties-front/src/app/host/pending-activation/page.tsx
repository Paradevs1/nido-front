"use client";

import Image from "next/image";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  BRAND,
  BRAND_DISPLAY_NAME,
  BRAND_LOGO_MARK_SRC,
} from "@/lib/branding/links";

function defaultTelegramUserFromBrand(): string {
  const m = BRAND.social.telegramSupport.match(/t\.me\/([^/?#]+)/i);
  return (m?.[1] ?? "nidodotglobal").replace(/^@/, "");
}

function getSupportTelegramUsername(): string {
  const raw = process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM?.trim();
  if (!raw) return defaultTelegramUserFromBrand();
  const m = raw.match(/t\.me\/([^/?#]+)/i);
  if (m?.[1]) return m[1].replace(/^@/, "");
  return raw.replace(/^@/, "");
}

function buildTelegramSupportHref(prefill: string): string {
  const user = getSupportTelegramUsername();
  const base = `https://t.me/${user}`;
  const t = prefill.trim();
  if (!t) return base;
  return `${base}?text=${encodeURIComponent(t)}`;
}

export default function HostPendingActivationPage() {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const telegramPrefill = [
    `Hello! My ${BRAND_DISPLAY_NAME} host account is pending activation.`,
    user?.username ? `Company username: ${user.username}.` : "",
    "Could you please review my request?",
  ]
    .filter(Boolean)
    .join(" ");

  const telegramHref = buildTelegramSupportHref(telegramPrefill);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16"
      style={{
        background: "var(--color-background)",
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 100% 50% at 50% -10%, rgba(255,87,1,0.14), transparent 55%)",
        }}
      />

      <div className="relative z-10 w-full max-w-lg text-center">
        <Image
          src={BRAND_LOGO_MARK_SRC}
          alt={BRAND_DISPLAY_NAME}
          width={80}
          height={80}
          className="mx-auto h-[72px] w-[72px] object-contain opacity-95"
          priority
        />

        <h1 className="mt-8 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Account pending activation
        </h1>
        <p className="mt-4 text-base leading-relaxed text-white/70">
          Your company account has been created, but it is not active yet. An administrator must
          approve it before you can use the {BRAND_DISPLAY_NAME} dashboard, create campaigns, or manage
          payments.
        </p>
        <p className="mt-4 text-base leading-relaxed text-white/70">
          Contact our team on <strong className="text-white/85 font-semibold">Telegram</strong> to
          complete activation. Share your company username
          {user?.username ? (
            <>
              {" "}
              (<span className="font-semibold text-white">{user.username}</span>)
            </>
          ) : (
            " (the one you used at sign-up)"
          )}{" "}
          so we can locate your account quickly.
        </p>

        <div className="mt-8 flex w-full flex-col items-center gap-3">
          <a
            href={telegramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full max-w-sm cursor-pointer items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto sm:min-w-[200px]"
            style={{
              background: "var(--color-primary)",
              boxShadow: "0 0 40px -10px rgba(255,87,1,0.45)",
            }}
          >
            Open Telegram
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer text-sm font-medium text-white/50 underline-offset-4 hover:text-white/80 hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
