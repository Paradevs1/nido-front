"use client";

import React from "react";
import {
  DocSection,
  DocParagraph,
  DocBulletList,
} from "@/components/docs/DocContentBlocks";

export default function ServiceModels() {
  return (
    <>
      <DocSection id="overview" title="Overview">
        <DocParagraph>
          Nido is not an agency. It is an operational layer for creator
          acquisition, campaign management, and automated settlement.
        </DocParagraph>
        <DocParagraph>
          We operate under two commercial structures designed to support projects
          from early validation to large-scale execution.
        </DocParagraph>
      </DocSection>

      <DocSection id="basic-plan" title="1. Basic Plan">
        <DocParagraph>
          Designed for projects that need to validate market demand or run
          targeted campaigns without long-term commitments.
        </DocParagraph>
        <DocBulletList
          items={[
            "No monthly fee.",
            "No fixed contract.",
            "You only pay when campaigns are executed.",
          ]}
        />
        <h3 className="text-base font-semibold text-white mb-2">How It Works</h3>
        <DocBulletList
          items={[
            "A campaign is created within the platform",
            "The campaign budget is deposited",
            "The protocol manages validation and settlement",
            "A Protocol Fee is applied to the total campaign volume",
          ]}
        />
        <h3 className="text-base font-semibold text-white mb-2">Best Suited For</h3>
        <DocBulletList
          items={[
            "Token launches",
            "Growth sprints",
            "CAC validation tests",
            "Community activation campaigns",
          ]}
        />
        <h3 className="text-base font-semibold text-white mb-2">Fee Structure</h3>
        <p className="text-white/85 leading-relaxed mb-6">
          12% of total campaign volume. No monthly minimum.
        </p>
        <h3 className="text-base font-semibold text-white mb-2">Strategic Advantages</h3>
        <DocBulletList
          items={[
            "No fixed operating costs",
            "No operational risk exposure",
            "Cost aligned with execution volume",
            "Automated settlement infrastructure",
          ]}
        />
      </DocSection>

      <DocSection id="core-plan" title="2. Core Plan">
        <DocParagraph>
          Designed for recurring operations and higher-volume execution.
        </DocParagraph>
        <DocParagraph>
          This model unlocks the full campaign management and intelligence layer
          of the protocol.
        </DocParagraph>
        <h3 className="text-base font-semibold text-white mb-2">Structure and Fee Structure</h3>
        <p className="text-white/85 leading-relaxed mb-2">
          $300 for 3 months (Early Partner Offer)
        </p>
        <p className="text-white/85 leading-relaxed mb-2">
          Progressive monthly volume structure:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-white/85 mb-6">
          <li>Up to $2,000 → 6%</li>
          <li>$2,001 – $5,000 → 5%</li>
          <li>Above $5,000 → 3% (capped)</li>
        </ul>
        <h3 className="text-base font-semibold text-white mb-2">Features Unlocked</h3>
        <DocBulletList
          items={[
            "Strategy Support with Dollar (Founder)",
            "Co-marketing layer",
            "Data export (CSV/API-ready)",
            "Full Dashboard (Launching soon)",
            "KOL Marketplace (Launching soon)",
            "Advanced Analytics (Launching soon)",
          ]}
        />
        <h3 className="text-base font-semibold text-white mb-2">Best Suited For</h3>
        <DocBulletList
          items={[
            "Protocols running continuous ambassador programs",
            "Agencies",
            "KOL Managers",
            "Exchanges",
          ]}
        />
        <DocParagraph className="mt-6">
          This structure allows partners to begin with performance-based
          execution and transition into a subscription model as campaign volume
          and operational complexity scale.
        </DocParagraph>
      </DocSection>
    </>
  );
}
