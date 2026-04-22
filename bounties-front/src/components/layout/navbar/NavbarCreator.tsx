"use client";

import React, { useEffect, useState } from "react";
import NotificationBell from "@/components/notifications/NotificationBell";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import BetaBadge from "@/components/ui/BetaBadge";
import { useUser } from "@/lib/contexts/UserContext";
import { getNavbarLinks } from "@/lib/navbarLinks";
import { BRAND_LOGO_ALT, BRAND_LOGO_MARK_SRC } from "@/lib/branding/links";

const NavbarCreator: React.FC = () => {
  const { user, logout } = useUser();
  const navLinks = getNavbarLinks("creator");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    }
  }, [isMenuOpen]);

  return (
    <>
      <nav className="fixed top-4 left-0 right-0 z-40 px-6">
        <div
          className="w-full max-w-[1440px] mx-auto rounded-full"
          style={{
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div className="w-full h-full flex items-center justify-between rounded-full bg-[var(--color-navbar)] px-6 md:px-10 py-3 backdrop-blur-sm">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              <Link
                href="/creator"
                className="cursor-pointer flex items-center leading-none"
              >
                <Image
                  src={BRAND_LOGO_MARK_SRC}
                  alt={BRAND_LOGO_ALT}
                  width={96}
                  height={96}
                  className="block object-contain object-left h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-[4.25rem] lg:w-[4.25rem] xl:h-[4.5rem] xl:w-[4.5rem] shrink-0"
                  priority
                />
              </Link>
              <BetaBadge />
            </div>

            {/* Navigation Links + User Actions - Agrupados no canto direito */}
            <div className="flex items-center gap-[41px]">
              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-[41px]">
                {navLinks.map((link) => {
                  const isExternal = link.href.startsWith("http");
                  const LinkComponent = isExternal ? "a" : Link;
                  const linkProps = isExternal
                    ? {
                        href: link.href,
                        target: link.target || "_self",
                        rel: link.rel,
                      }
                    : { href: link.href };

                  return (
                    <LinkComponent
                      key={link.label}
                      {...linkProps}
                      className="group relative text-[var(--color-text)] text-[16px] transition-colors duration-300 hover:text-[var(--color-primary)] cursor-pointer"
                    >
                      {link.label}
                    </LinkComponent>
                  );
                })}
              </div>

              <div className="hidden md:block">
                <NotificationBell />
              </div>
              {/* Botão de logout */}
              <div className="hidden md:block">
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-2 text-[var(--color-text)] text-[14px] font-medium hover:text-[var(--color-primary)] transition-colors duration-300 cursor-pointer"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>

              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="text-[var(--color-text)] cursor-pointer"
                  aria-label="Abrir menu"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
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
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--color-background)]/95 backdrop-blur-sm md:hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/creator"
                onClick={() => setIsMenuOpen(false)}
                className="cursor-pointer flex items-center leading-none"
              >
                <Image
                  src={BRAND_LOGO_MARK_SRC}
                  alt={BRAND_LOGO_ALT}
                  width={96}
                  height={96}
                  className="block object-contain object-left h-12 w-12 sm:h-14 sm:w-14 shrink-0"
                  priority
                />
              </Link>
              <BetaBadge />
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-white"
              aria-label="Fechar menu"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="px-6 py-6 flex flex-col gap-4">
            {navLinks.map((link) => {
              const isExternal = link.href.startsWith("http");
              const LinkComponent = isExternal ? "a" : Link;
              const linkProps = isExternal
                ? {
                    href: link.href,
                    target: link.target || "_self",
                    rel: link.rel,
                  }
                : { href: link.href };

              return (
                <LinkComponent
                  key={link.label}
                  {...linkProps}
                  className="text-white text-lg font-medium py-2 border-b border-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </LinkComponent>
              );
            })}

            <button
              onClick={() => {
                setIsMenuOpen(false);
                logout();
              }}
              className="mt-4 flex items-center gap-2 text-white text-base font-medium"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarCreator;
