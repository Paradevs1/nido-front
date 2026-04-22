export interface DocPage {
  slug: string;
  title: string;
  href: string;
}

export interface DocSection {
  slug: string;
  title: string;
  icon: string;
  pages: DocPage[];
}

export const DOCS_SECTIONS: DocSection[] = [
  {
    slug: "overview",
    title: "Overview",
    icon: "/assets/docs/overview.svg",
    pages: [
      {
        slug: "introducao-ao-bounties",
        title: "Introduction to Nido",
        href: "/docs/overview/introducao-ao-bounties",
      },
      { slug: "gap-do-mercado", title: "The Market Gap", href: "/docs/overview/gap-do-mercado" },
    ],
  },
  {
    slug: "protocolo",
    title: "Protocol",
    icon: "/assets/docs/protocol.svg",
    pages: [
      { slug: "liquidacao-financeira", title: "Global Stablecoin Settlement", href: "/docs/protocolo/liquidacao-financeira" },
      { slug: "analytics-performance", title: "Operational Architecture (Real Workflow)", href: "/docs/protocolo/analytics-performance" },
    ],
  },
  {
    slug: "para-empresas",
    title: "For Hosts",
    icon: "/assets/docs/host.svg",
    pages: [
      { slug: "gestao-campanhas", title: "Campaign Management (Workflow)", href: "/docs/para-empresas/gestao-campanhas" },
      { slug: "modelos-servico", title: "Service Models", href: "/docs/para-empresas/modelos-servico" },
    ],
  },
  {
    slug: "seguranca",
    title: "Security",
    icon: "/assets/docs/security.svg",
    pages: [
      { slug: "infraestrutura", title: "Infrastructure", href: "/docs/seguranca/infraestrutura" },
    ],
  },
];

export function getDocPage(sectionSlug: string, pageSlug: string): DocPage | undefined {
  const section = DOCS_SECTIONS.find((s) => s.slug === sectionSlug);
  return section?.pages.find((p) => p.slug === pageSlug);
}

export function getSection(sectionSlug: string): DocSection | undefined {
  return DOCS_SECTIONS.find((s) => s.slug === sectionSlug);
}

/** Path sem `/docs`, para uso num subdomínio dedicado à documentação (ex.: `/overview/introducao-ao-bounties`). */
export function getDocPath(href: string): string {
  if (!href.startsWith("/docs")) return href;
  return href.length === 5 ? "/" : href.slice(5);
}
