"use client";

import React from "react";
import {
  DocSection,
  DocParagraph,
  DocBulletList,
  DocPillar,
} from "@/components/docs/DocContentBlocks";
import { BRAND_DISPLAY_NAME } from "@/lib/branding/links";

export default function IntroductionToBounties() {
  return (
    <>
      <DocSection
        id="introduction"
        title={`Introduction to ${BRAND_DISPLAY_NAME}`}
      >
        <DocParagraph>
          {BRAND_DISPLAY_NAME} is the financial infrastructure for
          creator-driven campaigns.
        </DocParagraph>
        <DocParagraph>
          We operate as an operational layer that connects campaign budget,
          execution, and settlement in stablecoins within a single system. In
          addition, we bridge liquidity (Companies / Hosts) with influence (KOLs
          / Ambassadors).
        </DocParagraph>

        <DocParagraph>
          <strong className="text-white">
            Hosts use {BRAND_DISPLAY_NAME} to:
          </strong>
        </DocParagraph>
        <DocBulletList
          items={[
            "Allocate campaign budgets",
            "Manage creators (public and private campaigns)",
            "Validate deliverables",
            "Settle global payments in stablecoins",
          ]}
        />

        <DocParagraph>
          <strong className="text-white">
            Creators use {BRAND_DISPLAY_NAME} to:
          </strong>
        </DocParagraph>
        <DocBulletList
          items={[
            "Participate in structured campaigns",
            "Submit deliverables within a standardized workflow",
            "Receive fast, traceable global payments",
          ]}
        />

        <DocParagraph>
          We are not just a marketing platform.
          <br />
          We are payment infrastructure combined with campaign management.
        </DocParagraph>
      </DocSection>

      <DocSection id="core-pillars" title="Our Core Pillars">
        <DocPillar title="Fund Security">
          Creators have payment certainty (USDC). Companies have delivery
          assurance. Counterparty risk is structurally reduced.
        </DocPillar>
        <DocPillar title="Centralized Management">
          Eliminate spreadsheets. Track status, metrics, and deliverables from
          dozens of creators and ambassadors within a single dashboard.
        </DocPillar>
        <DocPillar title="Real Performance Focus">
          We prioritize business metrics such as CAC and ROI, not vanity metrics
          like likes and views.
        </DocPillar>
      </DocSection>
    </>
  );
}
