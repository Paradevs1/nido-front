"use client";

import React from "react";
import {
  DocSection,
  DocParagraph,
  DocBulletList,
  DocPillar,
  DocRoleResult,
  DocDivider,
} from "@/components/docs/DocContentBlocks";

export default function MarketGap() {
  return (
    <>
      <DocSection id="market-gap" title="The Market Gap">
        <DocParagraph>
          Why the current influencer marketing model is structurally
          unsustainable and how we are redesigning it.
        </DocParagraph>
      </DocSection>

      <DocSection id="the-problem" title="The Problem">
        <DocParagraph>
          The crypto ecosystem moves billions in capital, yet its marketing
          layer still operates on outdated mechanics. Over the past years, most
          models have been optimized for creator farming engagement-driven
          campaigns focused on clicks and shallow content rather than measurable
          impact.
        </DocParagraph>
        <DocParagraph>
          Today, Hosts (Exchanges, L1/L2 protocols, dApps, and others) face a
          structural trust dilemma:
        </DocParagraph>
        <DocPillar title="Financial Risk">
          Payments are either made upfront with high no-show risk, or delayed
          for months, creating friction and mistrust on both sides.
        </DocPillar>
        <DocPillar title="Operational Chaos">
          Marketing teams spend hours consolidating links in spreadsheets,
          chasing deliverables on Telegram or WhatsApp, and executing dozens of
          manual wallet payments.
        </DocPillar>
        <DocPillar title="Lack of Reliable Data">
          The inability to distinguish real influence from inflated metrics and
          bot-driven engagement makes ROI calculation nearly impossible.
        </DocPillar>
        <DocParagraph>
          After more than two years working directly with creators and
          protocols, we consolidated these inefficiencies into a product
          designed to eliminate them.
        </DocParagraph>
      </DocSection>

      <DocSection id="the-solution" title="The Solution">
        <DocParagraph>
          Nido does not &quot;optimize&quot; the current model.
          <br />
          We redesign the value transfer logic between brands and creators.
        </DocParagraph>
        <DocParagraph>
          For every structural failure in today&apos;s system (Risk, Chaos, and
          Poor Data), we built a dedicated technological resolution layer.
        </DocParagraph>
      </DocSection>

      <DocSection id="payment-certainty" title="Payment & delivery uncertainty">
        <DocParagraph>
          Uncertainty around payment execution and content delivery.
        </DocParagraph>
        <DocRoleResult label="Host">
          Deposits funds and proves liquidity upfront.
        </DocRoleResult>
        <DocRoleResult label="Protocol Layer">
          Locks the funds and signals verified allocation to the creator.
        </DocRoleResult>
        <DocRoleResult label="Creator">
          Receives payment only after validated Proof-of-Work submission.
        </DocRoleResult>
        <DocRoleResult label="Result">
          Elimination of payment uncertainty and structural protection against
          no-shows.
        </DocRoleResult>
      </DocSection>

      <DocSection id="workflow-orchestration" title="Workflow Orchestration">
        <DocParagraph>
          <strong className="text-white">The challenge:</strong> Fragmented
          communication across Telegram, spreadsheets, and email.
        </DocParagraph>
        <DocParagraph>
          <strong className="text-white">The Nido Mechanism</strong>
          <br />
          We built a Single-State Environment. The entire campaign lifecycle is
          centralized: 
          <br />
          Briefing → Negotiation → Submission → Validation → Payment.
          <br />
        </DocParagraph>
        <DocRoleResult label="Result">
          Reduction of human error and up to 80% decrease in operational
          management time.
        </DocRoleResult>
        <DocParagraph>
          This transforms creator marketing from informal coordination into
          structured infrastructure.
        </DocParagraph>
      </DocSection>
    </>
  );
}
