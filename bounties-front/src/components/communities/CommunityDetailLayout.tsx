"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CommunityDetail, PlatformName } from "@/lib/api/community";

const PLATFORM_COLORS: Record<PlatformName, string> = {
  TWITTER: "bg-blue-600/20 text-blue-300",
  INSTAGRAM: "bg-pink-600/20 text-pink-300",
  TIKTOK: "bg-purple-600/20 text-purple-300",
  YOUTUBE: "bg-red-600/20 text-red-300",
  DISCORD: "bg-indigo-600/20 text-indigo-300",
  TELEGRAM: "bg-blue-500/20 text-blue-300",
};

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export interface SidebarItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface CommunityDetailLayoutProps {
  community: CommunityDetail;
  sections: SidebarSection[];
  activeKey: string;
  onSelect: (key: string) => void;
  backHref: string;
  children: React.ReactNode;
  /** When true, adds top offset for pages with a fixed navbar (host/creator) */
  hasNavbar?: boolean;
}

export default function CommunityDetailLayout({
  community,
  sections,
  activeKey,
  onSelect,
  backHref,
  children,
  hasNavbar,
}: CommunityDetailLayoutProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prevent body scroll when layout is mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Back */}
      <button
        onClick={() => router.push(backHref)}
        className="cursor-pointer flex items-center gap-1.5 px-4 pt-12 pb-3 text-white/50 text-sm hover:text-white transition-colors border-b border-white/5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Community info */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/30 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {community.logo ? (
              <img src={community.logo} alt={community.name} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">{community.name}</h2>
            <p className="text-white/40 text-xs">
              {community.members_count} member{community.members_count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {community.required_platforms && community.required_platforms.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {community.required_platforms.map((p) => (
              <span
                key={p}
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${PLATFORM_COLORS[p]}`}
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map((section) => (
          <div key={section.title} className="mb-2">
            <p className="px-4 py-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider">
              {section.title}
            </p>
            {section.items.map((item) => (
              <button
                key={item.key}
                onClick={() => { onSelect(item.key); setMobileOpen(false); }}
                className={`group cursor-pointer w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                  activeKey === item.key
                    ? "text-[var(--color-primary)] font-medium"
                    : "text-white/60 hover:text-[var(--color-primary)]"
                }`}
              >
                <span
                  className={`flex-shrink-0 w-5 h-5 flex items-center justify-center transition-colors ${
                    activeKey === item.key
                      ? "text-[var(--color-primary)]"
                      : "text-white/40 group-hover:text-[var(--color-primary)]"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto bg-white text-black text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <div className={`overflow-hidden ${hasNavbar ? "mt-[100px]" : ""}`}>
      <div className={`max-w-[1440px] mx-auto flex overflow-hidden ${hasNavbar ? "h-[calc(100vh-100px)]" : "h-screen"}`}>
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className={`cursor-pointer lg:hidden absolute ${hasNavbar ? "top-3" : "top-4"} left-4 z-30 p-2 bg-[var(--color-card)] rounded-lg border border-white/10 text-white`}
          aria-label="Open sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="relative w-[80vw] max-w-64 h-full bg-[var(--color-background)] border-r border-white/10">
              {sidebar}
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-[var(--color-background)] border-r border-white/10">
          {sidebar}
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-[var(--color-background)]">
          <div className="px-4 sm:px-6 lg:px-10 pt-14 lg:pt-12 pb-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
