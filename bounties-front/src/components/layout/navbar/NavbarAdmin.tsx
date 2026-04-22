"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/lib/contexts/UserContext";
import BetaBadge from "@/components/ui/BetaBadge";
import { BRAND_LOGO_ALT, BRAND_LOGO_HORIZONTAL_SRC } from "@/lib/branding/links";

const ADMIN_NAV_LINKS = [
  { href: "/admin/creators", label: "Creators" },
  { href: "/admin/creators/participation-stats", label: "Participação" },
  { href: "/admin/creators/recurring", label: "Recorrentes" },
  { href: "/admin/creators/insights", label: "Creator Insights" },
  { href: "/admin/hosts", label: "Hosts" },
  { href: "/admin/communities", label: "Communities" },
  { href: "/admin/short-urls", label: "Short URLs" },
  { href: "/admin/campaigns", label: "Campanhas" },
  { href: "/admin/payments", label: "Pagamentos" },
  { href: "/admin/payments/campaigns", label: "Pagamentos por campanha" },
] as const;

const NAV_LINK_CLASS =
  "shrink-0 text-[var(--color-text)] text-sm 2xl:text-[15px] font-medium whitespace-nowrap transition-colors duration-300 hover:text-[var(--color-primary)] py-1";

const NavbarAdmin: React.FC = () => {
  const { logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const onChange = () => {
      if (mq.matches) setIsMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <nav className="fixed top-4 left-0 right-0 z-40 px-3 sm:px-6">
        <div
          className="w-full max-w-[1440px] mx-auto rounded-full"
          style={{
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div className="w-full min-w-0 flex flex-wrap items-center justify-between gap-y-3 rounded-full bg-[var(--color-navbar)] px-4 sm:px-6 md:px-10 lg:px-12 py-3 md:py-3.5 backdrop-blur-sm xl:flex-nowrap xl:gap-3">
            {/* Logo + badges — não encolhe para não invadir os links */}
            <div className="flex min-w-0 max-w-[min(100%,300px)] sm:max-w-[min(100%,380px)] md:max-w-none items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
              <Link href="/admin" className="cursor-pointer flex min-w-0 items-center leading-none">
                <Image
                  src={BRAND_LOGO_HORIZONTAL_SRC}
                  alt={BRAND_LOGO_ALT}
                  width={586}
                  height={200}
                  className="block object-contain object-left w-auto h-11 sm:h-12 md:h-[3.35rem] lg:h-14 max-w-[min(70vw,380px)] shrink-0"
                  priority
                />
              </Link>
              <BetaBadge className="shrink-0" />
              <span className="text-[10px] sm:text-xs bg-[var(--color-primary)] text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold shrink-0">
                ADMIN
              </span>
            </div>

            {/* Links desktop: só a partir de xl; área central com scroll horizontal se faltar espaço */}
            <div className="hidden min-h-[44px] min-w-0 xl:flex xl:max-w-none xl:flex-1 xl:justify-center">
              <nav
                className="flex max-w-full min-w-0 flex-1 items-center justify-start gap-x-2 overflow-x-auto overflow-y-hidden px-1 py-0.5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent] sm:justify-center sm:gap-x-3 2xl:gap-x-5"
                aria-label="Navegação admin"
              >
                {ADMIN_NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className={NAV_LINK_CLASS}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Sair + menu */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto xl:ml-0">
              <button
                type="button"
                onClick={handleLogout}
                className="hidden md:inline-flex cursor-pointer items-center gap-2 text-[var(--color-text)] text-sm 2xl:text-[15px] font-medium hover:text-[var(--color-primary)] transition-colors duration-300 py-2 px-2 sm:px-3 rounded-lg hover:bg-white/5 whitespace-nowrap"
              >
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sair
              </button>

              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="inline-flex xl:hidden text-[var(--color-text)] cursor-pointer p-2 -mr-2 rounded-lg hover:bg-white/5"
                aria-label="Abrir menu"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu full-screen: &lt; xl (antes era md:hidden e quebrava tablet) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-background)]/95 backdrop-blur-sm xl:hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 shrink-0">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="cursor-pointer flex min-w-0 items-center max-w-[min(100%,340px)] leading-none"
              >
                <Image
                  src={BRAND_LOGO_HORIZONTAL_SRC}
                  alt={BRAND_LOGO_ALT}
                  width={586}
                  height={200}
                  className="block object-contain object-left w-auto h-11 sm:h-12 max-w-full shrink-0"
                  priority
                />
              </Link>
              <BetaBadge className="shrink-0" />
              <span className="text-xs bg-[var(--color-primary)] text-white px-2 py-1 rounded-full font-semibold shrink-0">
                ADMIN
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="text-white p-2 rounded-lg hover:bg-white/10 shrink-0"
              aria-label="Fechar menu"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-0">
            {ADMIN_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white text-base font-medium py-4 border-b border-white/10 active:bg-white/5"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className="mt-4 flex items-center gap-2 text-white text-base font-medium py-3 px-2 rounded-lg hover:bg-white/10 text-left"
            >
              <svg
                className="w-6 h-6 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sair
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarAdmin;
