"use client";

import { useState, useEffect } from "react";
import { DocsNavbar, DocsSidebar } from "@/components/docs";

const LG_BREAKPOINT = 1024;

function useIsBelowLg() {
  const [below, setBelow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${LG_BREAKPOINT - 1}px)`);
    setBelow(mq.matches);
    const fn = (e: MediaQueryListEvent) => setBelow(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return below;
}

interface DocsLayoutClientProps {
  docsBase: string;
  children: React.ReactNode;
}

export default function DocsLayoutClient({
  docsBase,
  children,
}: DocsLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isBelowLg = useIsBelowLg();

  return (
    <div
      className="h-screen min-h-0 flex flex-col overflow-hidden text-[var(--color-text)]"
      style={{
        backgroundImage: "var(--color-page-gradient)",
        backgroundAttachment: "fixed",
      }}
    >
      <DocsNavbar
        docsBase={docsBase}
        onMenuClick={isBelowLg ? () => setSidebarOpen(true) : undefined}
      />
      {/* Espaçador para o header fixo (h-18 = 4.5rem) */}
      <div className="shrink-0 h-18 w-full" aria-hidden />
      <main className="flex flex-1 min-h-0 w-full overflow-x-hidden relative z-0">
        <DocsSidebar docsBase={docsBase} />
        {isBelowLg && (
          <DocsSidebar
            docsBase={docsBase}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
        <div
          data-docs-scroll
          className={`flex-1 min-w-0 min-h-0 overflow-x-hidden transition-[overflow] ${
            isBelowLg && sidebarOpen ? "overflow-y-hidden" : "overflow-y-auto"
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
