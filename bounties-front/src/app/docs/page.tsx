import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { DOCS_SECTIONS, getDocPath } from "@/lib/docs/config";

const SECTION_INTROS: Record<string, string> = {
  overview: "What Nido is, the market gap we address, and how the platform works.",
  protocolo: "Stablecoin settlement (USDC), operational architecture, and real workflow.",
  "para-empresas": "Campaign management workflow and service models for hosts.",
  seguranca: "Infrastructure and security practices.",
};

export default async function DocsHomePage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const docsBase = host.startsWith("docs.") ? "" : "/docs";

  return (
    <div className="flex-1 min-w-0">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 lg:py-16">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Nido Documentation
        </h1>
        <div className="space-y-4 text-lg text-white/80 leading-relaxed">
          <p>
            Welcome to the Nido docs. Here you’ll find how we think about creator-driven campaigns,
            how the protocol works, and how to run campaigns as a host or participate as a creator.
          </p>
          <p>
            The documentation is split into four areas. <strong className="text-white">Overview</strong> introduces
            Nido and the market gap we address. <strong className="text-white">Protocol</strong> covers
            stablecoin settlement and the operational workflow (budget → execution → validation → settlement).
            <strong className="text-white"> For Hosts</strong> explains campaign structure (public and private),
            workflow from briefing to delivery, and service models (Basic and Enterprise). <strong className="text-white">Security</strong> describes
            onboarding, multichain settlement, and creator verification.
          </p>
          <p>
            Use the cards below to jump into a section, or the sidebar to move between pages. Each page
            includes an “On this page” menu for quick navigation within long articles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {DOCS_SECTIONS.map((section) => {
          const firstPage = section.pages[0];
          const href = firstPage ? docsBase + getDocPath(firstPage.href) : docsBase || "/";
          const intro = SECTION_INTROS[section.slug] ?? section.title;

          return (
            <Link
              key={section.slug}
              href={href}
              className="group block rounded-xl border border-white/10 bg-white/5 p-6 transition-all"
            >
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center justify-between gap-3 group-hover:text-[var(--color-primary)] transition-colors">
                <span>{section.title}</span>
                <Image src={section.icon} alt="" width={28} height={28} className="shrink-0 opacity-80" />
              </h2>
              <p className="text-sm text-white/70 leading-relaxed">{intro}</p>
            </Link>
          );
        })}
      </div>
      </div>
    </div>
  );
}
