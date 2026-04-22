"use client";

import React from "react";
import {
  DocSection,
  DocParagraph,
  DocPillar,
  DocBulletList,
} from "@/components/docs/DocContentBlocks";

export default function OperationalArchitecture() {
  return (
    <>
      <DocSection
        id="operational-architecture"
        title="Operational Architecture (Real Workflow)"
      >
        <DocPillar title="1. Budget Provisioning">
          The host allocates the campaign budget in stablecoins within the
          platform&apos;s structured environment.
        </DocPillar>
        <DocPillar title="2. Execution">
          The creator accesses the briefing and submits the deliverable through
          a standardized workflow.
        </DocPillar>
        <DocPillar title="3. Validation">
          The host reviews and approves the submission according to predefined
          campaign rules.
        </DocPillar>
        <DocPillar title="4. Settlement">
          Upon approval, payment is released to the registered wallet.
        </DocPillar>
        <DocPillar title="5. Record">
          The transaction is recorded on-chain, forming an auditable financial
          history.
        </DocPillar>
      </DocSection>

      <DocSection id="what-we-eliminate" title="What We Eliminate">
        <DocBulletList
          items={[
            "Dependency on local banking systems",
            "Slow international payments",
            "Manual spreadsheet-based budget control",
            "Informal settlement via direct messages",
          ]}
        />
      </DocSection>

      <DocSection id="what-this-transforms" title="What This Transforms">
        <DocParagraph>
          Campaigns move beyond being isolated marketing actions.
        </DocParagraph>
        <DocParagraph>
          They operate as controlled financial processes.
        </DocParagraph>
        <DocParagraph>
          Budget provisioned → deliverable validated → settlement executed →
          auditable record generated.
        </DocParagraph>
      </DocSection>
    </>
  );
}
