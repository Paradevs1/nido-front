"use client";

import { useLayoutEffect, useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { getAuthedHomeRedirectPath } from "@/lib/auth/getAuthedHomeRedirectPath";
import { prefetchPostLoginDestination } from "@/lib/auth/prefetchPostLoginDestination";
import {
  BRAND_DISPLAY_NAME,
  BRAND_LOGO_MARK_SRC,
} from "@/lib/branding/links";

/**
 * Na home (`/`), com JWT + auth_user válidos, envia para a área correta
 * (creator, host ou admin) — sem precisar clicar em Sign in.
 * Overlay de loading evita ver a landing “crua” antes da navegação.
 */
export default function AutoRedirectFromHome() {
  const router = useRouter();
  const pathname = usePathname();
  const [showRedirectOverlay, setShowRedirectOverlay] = useState(false);

  useLayoutEffect(() => {
    if (pathname !== "/") return;

    // Don't redirect if Privy OAuth callback params are in the URL —
    // the Privy SDK needs to process them first (login or account linking)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("privy_oauth_state") || params.has("privy_oauth_code") || params.has("privy_token")) {
        return;
      }
    }

    const target = getAuthedHomeRedirectPath();
    if (!target) return;

    // Sync localStorage token → cookie so the middleware accepts the redirect
    const token = localStorage.getItem("bounties_token");
    const authUser = localStorage.getItem("auth_user");
    if (token) {
      document.cookie = `bounties_token=${token}; path=/`;
    }
    if (authUser) {
      document.cookie = `auth_user=${encodeURIComponent(authUser)}; path=/`;
    }

    setShowRedirectOverlay(true);
    prefetchPostLoginDestination(router, target);
    router.replace(target);

    // Safety: if still on "/" after 3s the redirect was rejected — clear stale auth
    const timeout = setTimeout(() => {
      localStorage.removeItem("bounties_token");
      localStorage.removeItem("auth_user");
      document.cookie = "bounties_token=; path=/; max-age=0";
      document.cookie = "auth_user=; path=/; max-age=0";
      setShowRedirectOverlay(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [pathname, router]);

  if (!showRedirectOverlay) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center gap-8 bg-[var(--color-background)] px-6"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <Image
        src={BRAND_LOGO_MARK_SRC}
        alt={BRAND_DISPLAY_NAME}
        width={80}
        height={80}
        className="object-contain opacity-90"
        priority
      />
      <div
        className="h-11 w-11 rounded-full border-2 border-white/15 border-t-[var(--color-primary)] animate-spin"
        aria-hidden
      />
    </div>
  );
}
