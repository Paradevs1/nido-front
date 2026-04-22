"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import NavbarSocialLinks from "@/components/layout/navbar/NavbarSocialLinks";
import {
  BRAND_DISPLAY_NAME,
  BRAND_LOGO_MARK_SRC,
  BRAND_SITE_URL,
} from "@/lib/branding/links";

// TODO: descomentar quando search estiver implementado
// const DOCS_SEARCH_SHORTCUT = "Ctrl K";

interface DocsNavbarProps {
  docsBase: string;
  onMenuClick?: () => void;
}

export default function DocsNavbar({ docsBase, onMenuClick }: DocsNavbarProps) {
  const docsHomeHref = docsBase || "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const scrollEl = document.querySelector("[data-docs-scroll]");
    if (!scrollEl) return;
    const onScroll = () => setScrolled((scrollEl as HTMLElement).scrollTop > 8);
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, []);

  const gradientBg = scrolled
    ? "linear-gradient(90deg, rgba(2, 25, 38, 0.94) 0%, rgba(5, 45, 65, 0.88) 50%, rgba(2, 25, 38, 0.94) 100%)"
    : "linear-gradient(90deg, rgba(2, 25, 38, 0.2) 0%, rgba(5, 45, 65, 0.38) 50%, rgba(2, 25, 38, 0.2) 100%)";

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMenuClick?.();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[110] w-full border-b border-white/10 backdrop-blur-md transition-[background,box-shadow] duration-300 isolate"
      style={{
        background: gradientBg,
        boxShadow: scrolled ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "none",
      }}
    >
      <div className="flex h-18 items-center gap-4 lg:gap-6 md:gap-8 pl-4 pr-4 lg:pl-28 lg:pr-20 xl:pl-48 xl:pr-40 relative">
        {onMenuClick && (
          <button
            type="button"
            onClick={handleMenuClick}
            className="lg:hidden flex items-center justify-center w-12 h-12 min-w-[3rem] min-h-[3rem] rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors relative z-[200] shrink-0 touch-manipulation cursor-pointer"
            style={{ pointerEvents: "auto" }}
            aria-label="Abrir menu de navegação"
          >
            <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Link
          href={docsHomeHref}
          className="flex items-center gap-3 py-2 pr-2 text-white font-semibold hover:opacity-90 transition-opacity shrink-0"
        >
          <Image
            src={BRAND_LOGO_MARK_SRC}
            alt={BRAND_DISPLAY_NAME}
            width={28}
            height={28}
            className="rounded"
          />
          <span>{BRAND_DISPLAY_NAME}</span>
          <span className="text-xs text-white/60 font-normal hidden sm:inline">Docs</span>
        </Link>

        {/* TODO: descomentar quando search estiver implementado
        <div className="flex-1 flex justify-center max-w-xl mx-auto w-full">
          <div className="w-full flex items-center rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white/80">
            <span className="text-white/50">Search documentation...</span>
            <kbd className="ml-auto hidden sm:inline-flex h-5 items-center rounded bg-white/10 px-1.5 font-mono text-xs shrink-0">
              {DOCS_SEARCH_SHORTCUT}
            </kbd>
          </div>
        </div>
        */}
        <div className="flex-1" />

        <NavbarSocialLinks className="hidden sm:flex shrink-0 gap-6 ml-1" iconClassName="text-white/80 hover:text-[var(--color-primary)] transition-colors duration-300 p-1" />

        <a
          href={BRAND_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 rounded-full border border-[var(--color-button-border)] bg-[var(--color-button-bg)] px-5 py-2 text-sm font-bold text-[var(--color-button-text)] shadow-[0_4px_0_0_var(--color-button-shadow)] transition-all hover:opacity-90 active:translate-y-[2px] ml-1 cursor-pointer"
        >
          <span>{BRAND_DISPLAY_NAME}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </header>
  );
}
