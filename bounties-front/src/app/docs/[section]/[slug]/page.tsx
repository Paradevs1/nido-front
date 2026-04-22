import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSection, getDocPage } from "@/lib/docs/config";
import { DOCS_CONTENT } from "@/lib/docs/content";
import { OnThisPage } from "@/components/docs";
import IntroductionToOverviewPage from "@/components/docs/overview/IntroductionToBounties";
import MarketGap from "@/components/docs/overview/MarketGap";
import GlobalStablecoinSettlement from "@/components/docs/protocol/GlobalStablecoinSettlement";
import OperationalArchitecture from "@/components/docs/protocol/OperationalArchitecture";
import CampaignManagementWorkflow from "@/components/docs/para-empresas/CampaignManagementWorkflow";
import ServiceModels from "@/components/docs/para-empresas/ServiceModels";
import Infrastructure from "@/components/docs/seguranca/Infrastructure";

interface DocPageProps {
  params: Promise<{ section: string; slug: string }>;
}

function DocAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-4 py-3 text-sm text-white/90 mb-8 flex items-start gap-3">
      <span className="text-[var(--color-primary)] mt-0.5">ℹ</span>
      {children}
    </div>
  );
}

const OVERVIEW_CONTENT: Record<string, React.ComponentType> = {
  "introducao-ao-bounties": IntroductionToOverviewPage,
  "gap-do-mercado": MarketGap,
};

const PROTOCOL_CONTENT: Record<string, React.ComponentType> = {
  "liquidacao-financeira": GlobalStablecoinSettlement,
  "analytics-performance": OperationalArchitecture,
};

const PARA_EMPRESAS_CONTENT: Record<string, React.ComponentType> = {
  "gestao-campanhas": CampaignManagementWorkflow,
  "modelos-servico": ServiceModels,
};

const SEGURANCA_CONTENT: Record<string, React.ComponentType> = {
  infraestrutura: Infrastructure,
};

export async function generateStaticParams() {
  const { DOCS_SECTIONS } = await import("@/lib/docs/config");
  const params: { section: string; slug: string }[] = [];
  for (const section of DOCS_SECTIONS) {
    for (const page of section.pages) {
      params.push({ section: section.slug, slug: page.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { section, slug } = await params;
  const page = getDocPage(section, slug);
  const content = DOCS_CONTENT[section]?.[slug];
  if (!page || !content) return { title: "Docs | Nido" };
  return {
    title: `${content.title} | Docs`,
    description: content.description,
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { section, slug } = await params;
  const sectionData = getSection(section);
  const page = getDocPage(section, slug);
  const content = DOCS_CONTENT[section]?.[slug];

  if (!sectionData || !page || !content) notFound();

  return (
    <div className="flex w-full max-w-7xl mx-auto">
      <article className="flex-1 min-w-0 px-4 md:px-8 py-10 lg:py-12">
            <div
              className="rounded-2xl mb-10 py-10 px-6 md:py-12 md:px-8"
              style={{
                background: "var(--color-page-gradient)",
              }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {content.title}
              </h1>
            </div>
            <div className="prose prose-invert prose-lg max-w-none">
              {(section === "overview" && OVERVIEW_CONTENT[slug]) ||
              (section === "protocolo" && PROTOCOL_CONTENT[slug]) ||
              (section === "para-empresas" && PARA_EMPRESAS_CONTENT[slug]) ||
              (section === "seguranca" && SEGURANCA_CONTENT[slug]) ? (
                (() => {
                  const Content =
                    section === "overview"
                      ? OVERVIEW_CONTENT[slug]
                      : section === "protocolo"
                        ? PROTOCOL_CONTENT[slug]
                        : section === "para-empresas"
                          ? PARA_EMPRESAS_CONTENT[slug]
                          : SEGURANCA_CONTENT[slug];
                  return Content ? <Content /> : null;
                })()
              ) : (
                <>
                  <DocAlert>
                    This documentation guides you through Nido principles and
                    main features. This block can be removed or adjusted after
                    content review.
                  </DocAlert>
                  {content.headings.map((heading, index) => (
                    <section
                      key={heading.id}
                      id={heading.id}
                      className="scroll-mt-24"
                    >
                      <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                        {heading.label}
                      </h2>
                      <p className="text-white/80 leading-relaxed">
                        [Full content for this section will be inserted here.]
                      </p>
                    </section>
                  ))}
                </>
              )}
        </div>
      </article>
      <OnThisPage headings={content.headings} />
    </div>
  );
}
