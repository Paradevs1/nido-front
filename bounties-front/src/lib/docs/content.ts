import type { DocHeading } from "@/components/docs";

export interface DocContentData {
  title: string;
  description?: string;
  headings: DocHeading[];
}

export const DOCS_CONTENT: Record<string, Record<string, DocContentData>> = {
  overview: {
    "introducao-ao-bounties": {
      title: "Introduction to Nido",
      description:
        "Nido is the financial infrastructure for creator-driven campaigns. Overview of how Hosts and Creators use the platform and our core pillars.",
      headings: [
        { id: "introduction", label: "Introduction to Nido", level: 2 },
        { id: "core-pillars", label: "Our Core Pillars", level: 2 },
      ],
    },
    "gap-do-mercado": {
      title: "The Market Gap",
      description:
        "Why the current influencer marketing model is structurally unsustainable and how Nido redesigns value transfer between brands and creators.",
      headings: [
        { id: "market-gap", label: "The Market Gap", level: 2 },
        { id: "the-problem", label: "The Problem", level: 2 },
        { id: "the-solution", label: "The Solution", level: 2 },
        { id: "payment-certainty", label: "Payment & delivery uncertainty", level: 2 },
        { id: "workflow-orchestration", label: "Workflow Orchestration", level: 2 },
      ],
    },
  },
  protocolo: {
    "liquidacao-financeira": {
      title: "Global Stablecoin Settlement",
      description:
        "The financial layer of Nido. Settlement infrastructure for creator-driven campaigns with stablecoin payment and traceability.",
      headings: [
        { id: "overview", label: "Overview", level: 2 },
        { id: "why-structural", label: "Why This Is Structural (Not Just a Feature)", level: 2 },
      ],
    },
    "analytics-performance": {
      title: "Operational Architecture (Real Workflow)",
      description: "Budget provisioning, execution, validation, settlement, and on-chain record. What we eliminate and what this transforms.",
      headings: [
        { id: "operational-architecture", label: "Operational Architecture (Real Workflow)", level: 2 },
        { id: "what-we-eliminate", label: "What We Eliminate", level: 2 },
        { id: "what-this-transforms", label: "What This Transforms", level: 2 },
      ],
    },
  },
  "para-empresas": {
    "gestao-campanhas": {
      title: "Campaign Management (Workflow)",
      description: "From briefing to delivery without friction. Structured execution pipeline for ambassador and creator programs.",
      headings: [
        { id: "overview", label: "Overview", level: 2 },
        { id: "campaign-structure", label: "Campaign Structure", level: 2 },
        { id: "dynamic-briefing", label: "Dynamic Briefing", level: 2 },
        { id: "proof-of-execution", label: "Proof of Execution", level: 2 },
        { id: "validation", label: "Validation", level: 2 },
        { id: "unified-performance-history", label: "Unified Performance History", level: 2 },
      ],
    },
    "modelos-servico": {
      title: "Service Models",
      description: "Infrastructure for creator-driven campaigns. Basic and Core plans from early validation to large-scale execution.",
      headings: [
        { id: "overview", label: "Overview", level: 2 },
        { id: "basic-plan", label: "1. Basic Plan", level: 2 },
        { id: "core-plan", label: "2. Core Plan", level: 2 },
      ],
    },
  },
  seguranca: {
    infraestrutura: {
      title: "Infrastructure",
      description: "Multichain interoperability with operational simplicity. Modular architecture for user experience and secure campaign settlement.",
      headings: [
        { id: "overview", label: "Overview", level: 2 },
        { id: "seamless-onboarding", label: "Seamless Onboarding (Powered by Privy)", level: 2 },
        { id: "multichain-settlement", label: "Multichain Settlement Layer (EVM Compatible)", level: 2 },
        { id: "creator-verification", label: "Creator Verification Layer (Anti-Sybil Protection)", level: 2 },
      ],
    },
  },
};
