"use client";

import React from "react";
import {
  DocSection,
  DocParagraph,
  DocPillar,
} from "@/components/docs/DocContentBlocks";

export default function GlobalStablecoinSettlement() {
  return (
    <>
      <DocSection id="overview" title="Overview">
        <DocParagraph>
          Nido was built as a settlement infrastructure for creator-driven
          campaigns.
        </DocParagraph>
        <DocParagraph>
          The objective is not only to organize deliverables, but to ensure that
          budget allocation, validation, and payment are connected within a
          single, traceable workflow.
        </DocParagraph>
        <DocParagraph>
          In marketing operations, the primary bottleneck is not distribution.
          It is settlement.
        </DocParagraph>
        <DocParagraph>
          Slow international transfers, payment delays, banking dependencies,
          and manual budget control introduce unpredictability into campaign
          execution.
        </DocParagraph>
        <DocParagraph>
          Nido addresses this structural layer through stablecoin
          settlement (e.g., USDC), operating as a dedicated financial
          infrastructure for campaigns.
        </DocParagraph>
      </DocSection>

      <DocSection id="why-structural" title="Why This Is Structural (Not Just a Feature)">
        <DocPillar title="Fast Settlement After Approval">
          Once a deliverable is validated, payment is executed directly to the
          creator&apos;s wallet. No traditional banking transfers. No conventional
          intermediaries.
        </DocPillar>
        <DocPillar title="Global Off-Ramp Partners (Creator-Focused)">
          We plan to integrate global off-ramp partners to facilitate fiat
          conversion. This functionality is designed specifically to support
          creators.
        </DocPillar>
        <DocPillar title="24/7 Operation">
          Stablecoins operate continuously, regardless of jurisdiction or
          banking hours.
        </DocPillar>
        <DocPillar title="On-Chain Traceability">
          Each settlement generates a publicly verifiable transaction record.
          Hosts and creators maintain immutable proof of payment.
        </DocPillar>
        <DocPillar title="Multichain Infrastructure (Current Configuration)">
          We currently operate on Base and SUI. Additional networks can be
          enabled on demand based on host requirements.
        </DocPillar>
        <DocPillar title="Global Standardization">
          All payments follow the same digital settlement standard, independent
          of the creator&apos;s country.
        </DocPillar>
      </DocSection>
    </>
  );
}
