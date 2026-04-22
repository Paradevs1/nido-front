"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS_SECTIONS, getDocPath } from "@/lib/docs/config";
import NavbarSocialLinks from "@/components/layout/navbar/NavbarSocialLinks";

interface DocsSidebarProps {
  docsBase: string;
  open?: boolean;
  onClose?: () => void;
}

function SidebarNav({
  docsBase,
  pathname,
  onLinkClick,
}: {
  docsBase: string;
  pathname: string;
  onLinkClick?: () => void;
}) {
  const docsHomeHref = docsBase || "/";
  const isHome = pathname === "/docs" || pathname === "/";

  const linkClass = (active: boolean) =>
    [
      "block py-2 text-sm transition-colors border-l-2 -ml-px pl-4 pr-2",
      active
        ? "border-[var(--color-primary)] text-[var(--color-primary)] font-medium"
        : "border-transparent text-white/70 hover:text-[var(--color-primary)] hover:border-white/20",
    ].join(" ");

  return (
    <nav className="space-y-8">
      <Link href={docsHomeHref} className={linkClass(isHome)} onClick={onLinkClick}>
        Home
      </Link>
      {DOCS_SECTIONS.map((section) => (
        <div key={section.slug}>
          <p className="mb-3 pl-4 text-[11px] font-medium uppercase tracking-widest text-white/40">
            {section.title}
          </p>
          <ul className="space-y-0">
            {section.pages.map((page) => {
              const href = docsBase + getDocPath(page.href);
              const isActive = pathname === page.href;
              return (
                <li key={page.slug}>
                  <Link href={href} className={linkClass(isActive)} onClick={onLinkClick}>
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export default function DocsSidebar({ docsBase, open, onClose }: DocsSidebarProps) {
  const pathname = usePathname();
  const isOverlay = open !== undefined && onClose;

  if (isOverlay) {
    return (
      <div
        className={`lg:hidden fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={onClose}
          aria-hidden
        />
        <aside
          className={`fixed top-0 left-0 z-50 h-full w-72 max-w-[85vw] bg-[var(--color-page-bg)] shadow-xl transition-transform duration-200 ease-out overflow-y-auto ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Menu de navegação"
        >
          <div className="flex items-center justify-between h-18 px-4 border-b border-white/10">
            <span className="text-sm font-semibold text-white/80">Menu</span>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Fechar menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="py-6 pl-5 pr-4 flex flex-col h-[calc(100%-4.5rem)]">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <SidebarNav docsBase={docsBase} pathname={pathname} onLinkClick={onClose} />
            </div>
            <div className="shrink-0 pt-6 mt-4 border-t border-white/10">
              <NavbarSocialLinks
                className="flex gap-4"
                iconClassName="text-white/80 hover:text-[var(--color-primary)] transition-colors duration-300 p-2"
              />
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <aside
      className="w-56 shrink-0 border-r border-white/10 py-8 pl-5 pr-4 ml-20 md:ml-40 hidden lg:block sticky top-[3.5rem] self-start max-h-[calc(100vh-3.5rem)] overflow-y-auto"
      aria-label="Documentation navigation"
    >
      <SidebarNav docsBase={docsBase} pathname={pathname} />
    </aside>
  );
}
