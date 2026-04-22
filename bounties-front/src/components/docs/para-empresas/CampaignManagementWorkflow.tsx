"use client";

import React from "react";
import Image from "next/image";
import {
  DocSection,
  DocParagraph,
  DocPillar,
} from "@/components/docs/DocContentBlocks";

export default function CampaignManagementWorkflow() {
  return (
    <>
      <DocSection id="overview" title="Overview">
        <DocParagraph>
          Nido transforms KOL management into a structured, linear execution
          pipeline. The platform enables companies to scale ambassador and creator
          programs without compromising quality control.
        </DocParagraph>
      </DocSection>

      <DocSection id="campaign-structure" title="Campaign Structure">
        <DocPillar title="Public Campaigns">
          Open to any eligible creator. Primarily focused on awareness and
          reach.
        </DocPillar>
        <DocPillar title="Private Campaigns">
          Direct invitations via exclusive link to selected creators. Designed
          for performance, conversion and controlled acquisition.
        </DocPillar>
        <figure className="mt-6 rounded-xl overflow-hidden max-w-2xl mx-auto">
          <Image
            src="/assets/docs/public&privateCampaigns.png"
            alt="Public Campaign and Private Campaign cards: open campaigns with performance-based ranking; invite selected creators with fixed payouts."
            width={720}
            height={280}
            className="w-full h-auto object-cover"
          />
        </figure>
      </DocSection>

      <DocSection id="dynamic-briefing" title="Dynamic Briefing">
        <DocParagraph>
          The Host defines clear guidelines, brand assets, deadlines, and
          reward allocation upfront.
        </DocParagraph>
      </DocSection>

      <DocSection id="proof-of-execution" title="Proof of Execution">
        <DocParagraph>
          Creators submit their content link or deliverable directly through the
          platform.
        </DocParagraph>
      </DocSection>

      <DocSection id="validation" title="Validation">
        <DocParagraph>
          Managers review submissions. If revisions are required, feedback is
          issued. Once approved, funds are authorized for release.
        </DocParagraph>
      </DocSection>

      <DocSection id="unified-performance-history" title="Unified Performance History">
        <DocParagraph>
          Every interaction builds a structured reputation layer, enabling
          companies to quickly identify reliable, efficient, and high-performing
          partners.
        </DocParagraph>
      </DocSection>
    </>
  );
}
