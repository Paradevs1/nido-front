"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getNavbarLinks } from "@/lib/navbarLinks";
import Button from "@/components/ui/Button";
import BetaBadge from "@/components/ui/BetaBadge";
import { LoginModal, SignUpModal, CompanyLoginModal } from "@/components/auth";
import { getAuthedHomeRedirectPath } from "@/lib/auth/getAuthedHomeRedirectPath";
import { prefetchPostLoginDestination } from "@/lib/auth/prefetchPostLoginDestination";
import { BRAND_LOGO_ALT, BRAND_LOGO_MARK_SRC } from "@/lib/branding/links";

const RETURN_TO_KEY = "bounties:returnTo";

export default function NavbarGuest() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isCompanyLoginModalOpen, setIsCompanyLoginModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const returnTo = url.searchParams.get("returnTo")?.trim();
    if (!returnTo) return;

    try {
      // Só aceita paths relativos para evitar open redirect
      if (returnTo.startsWith("/")) {
        sessionStorage.setItem(RETURN_TO_KEY, returnTo);
      }
    } catch {
      /* noop */
    }

    // Limpa o parâmetro da URL (não poluir share / refresh)
    url.searchParams.delete("returnTo");
    const qs = url.searchParams.toString();
    window.history.replaceState({}, "", url.pathname + (qs ? `?${qs}` : "") + url.hash);

    setIsLoginModalOpen(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    }
  }, [isMenuOpen]);

  const navLinks = getNavbarLinks("guest");

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
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5">
              <Link href="/" className="cursor-pointer flex items-center min-w-0 shrink-0 leading-none">
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
                    className="group relative text-[var(--color-text)] text-[17px] md:text-lg transition-colors duration-300 hover:text-[var(--color-primary)] cursor-pointer"
                  >
                    {link.label}
                  </LinkComponent>
                );
              })}

              <div className="flex items-center gap-6">
                <Button
                  onClick={() => {
                    const target = getAuthedHomeRedirectPath();
                    if (target) {
                      prefetchPostLoginDestination(router, target);
                      router.replace(target);
                      return;
                    }
                    setIsLoginModalOpen(true);
                  }}
                  className="px-6 py-2.5 text-base font-bold cursor-pointer min-h-[2.5rem]"
                >
                  Sign in
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsSignUpModalOpen(true)}
                  className="px-6 py-2.5 text-base font-semibold cursor-pointer min-h-[2.5rem]"
                >
                  Become a Host
                </Button>
              </div>
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
      </nav>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {/* Sign Up Modal */}
      {isSignUpModalOpen && (
        <SignUpModal
          isOpen={isSignUpModalOpen}
          onClose={() => setIsSignUpModalOpen(false)}
          onSwitchToLogin={() => {
            setIsSignUpModalOpen(false);
            setIsCompanyLoginModalOpen(true);
          }}
        />
      )}

      {/* Company Login Modal */}
      {isCompanyLoginModalOpen && (
        <CompanyLoginModal
          isOpen={isCompanyLoginModalOpen}
          onClose={() => setIsCompanyLoginModalOpen(false)}
          onSwitchToRegister={() => {
            setIsCompanyLoginModalOpen(false);
            setIsSignUpModalOpen(true);
          }}
        />
      )}

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--color-background)]/95 backdrop-blur-sm md:hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
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

            <Button
              onClick={() => {
                setIsMenuOpen(false);
                const target = getAuthedHomeRedirectPath();
                if (target) {
                  prefetchPostLoginDestination(router, target);
                  router.replace(target);
                  return;
                }
                setIsLoginModalOpen(true);
              }}
              className="mt-4 px-5 py-2 text-base font-bold cursor-pointer"
            >
              Sign in
            </Button>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsSignUpModalOpen(true);
              }}
              className="text-white text-base font-medium text-left"
            >
              Become a Host
            </button>
          </div>
        </div>
      )}
    </>
  );
}
