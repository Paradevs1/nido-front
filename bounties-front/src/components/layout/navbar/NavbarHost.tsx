"use client";

import React, { useEffect, useState } from "react";
import NotificationBell from "@/components/notifications/NotificationBell";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getNavbarLinks } from "@/lib/navbarLinks";
import { getMyPlan } from "@/lib/api/plan";
import BetaBadge from "@/components/ui/BetaBadge";
import PlanBadge, { type PlanBadgeVariant } from "@/components/ui/PlanBadge";
import { BRAND_LOGO_ALT, BRAND_LOGO_MARK_SRC } from "@/lib/branding/links";

const NavbarHost: React.FC = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const navLinks = getNavbarLinks("host");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [planVariant, setPlanVariant] = useState<PlanBadgeVariant>("basic");

  useEffect(() => {
    let cancelled = false;
    getMyPlan()
      .then((data) => {
        if (cancelled) return;
        const name = String(data?.plan?.name ?? "").toUpperCase();
        const active = Boolean(data?.is_active);
        if (name === "ENTERPRISE" && active) setPlanVariant("enterprise");
        else if (name === "CORE" && active) setPlanVariant("core");
        else setPlanVariant("basic");
      })
      .catch(() => {
        if (!cancelled) setPlanVariant("basic");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    }
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
                href="/host/campaign"
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
              <PlanBadge variant={planVariant} />
            </div>

            {/* Navigation Links + User Actions - Agrupados no canto direito */}
            <div className="flex items-center gap-[41px]">
              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-[41px]">
                {navLinks.map((link) => {
                  if (link.children && link.children.length > 0) {
                    return (
                      <NavDropdown key={link.label} label={link.label} items={link.children} />
                    );
                  }

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
                      className="group relative text-[var(--color-text)] text-[16px] transition-colors duration-300 hover:text-[var(--color-primary)]"
                    >
                      {link.label}
                    </LinkComponent>
                  );
                })}
              </div>

              <div className="hidden md:block">
                <NotificationBell />
              </div>
              <div className="hidden md:block">
                <button
                  onClick={handleLogout}
                  className="cursor-pointer flex items-center gap-2 text-[var(--color-text)] text-[14px] font-medium hover:text-[var(--color-primary)] transition-colors duration-300"
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
                href="/host/campaign"
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
              <PlanBadge variant={planVariant} />
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
              if (link.children && link.children.length > 0) {
                return (
                  <div key={link.label}>
                    <p className="text-white/40 text-sm font-medium uppercase mb-2">{link.label}</p>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="text-white text-lg font-medium py-2 pl-4 border-b border-white/10 block"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                );
              }

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
                handleLogout();
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

function NavDropdown({ label, items }: { label: string; items: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="cursor-pointer flex items-center gap-1 text-[var(--color-text)] text-[16px] transition-colors duration-300 hover:text-[var(--color-primary)]"
      >
        {label}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--color-card)] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-white/70 hover:text-[var(--color-primary)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default NavbarHost;
