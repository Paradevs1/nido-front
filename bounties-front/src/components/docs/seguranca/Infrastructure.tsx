"use client";

import React from "react";
import {
  DocSection,
  DocParagraph,
  DocPillar,
} from "@/components/docs/DocContentBlocks";

export default function Infrastructure() {
  return (
    <>
      <DocSection id="overview" title="Overview">
        <DocParagraph>
          Nido is built on a modular architecture designed around two core
          priorities: user experience and secure campaign settlement.
        </DocParagraph>
        <DocParagraph>
          Our infrastructure abstracts blockchain complexity so brands and
          creators can focus on execution, while the platform manages wallet
          connectivity, transaction flow, and structured fund distribution.
        </DocParagraph>
      </DocSection>

      <DocSection
        id="seamless-onboarding"
        title="Seamless Onboarding (Powered by Privy)"
      >
        <DocParagraph>
          We reduce traditional Web3 friction by integrating embedded wallet
          infrastructure.
        </DocParagraph>
        <DocPillar title="Social Login">
          Creators can access the platform using Google or X. An embedded wallet
          is provisioned in the background, enabling immediate participation.
        </DocPillar>
        <DocPillar title="Non-Custodial Model">
          Private keys remain under the user&apos;s control through the embedded
          wallet provider. Nido does not custody creator funds.
        </DocPillar>
      </DocSection>

      <DocSection
        id="multichain-settlement"
        title="Multichain Settlement Layer (EVM Compatible)"
      >
        <DocParagraph>
          Liquidity should not be confined to a single network. Nido
          operates across multiple blockchain environments, enabling flexible
          campaign settlement.
        </DocParagraph>
        <DocPillar title="Native Compatibility">
          Support for major networks including Ethereum, Base, Arbitrum, Polygon,
          Optimism, Solana, and SUI. Currently, Base and SUI are active by
          default. Additional networks can be enabled upon request depending on
          host requirements.
        </DocPillar>
        <DocPillar title="Optimized Transaction Structure">
          Settlement flows are structured to reduce unnecessary transaction
          overhead, particularly in L2 environments.
        </DocPillar>
        <DocPillar title="Campaign-Based Fund Allocation">
          Budgets are structured per campaign and distributed after validated
          deliverables are approved.
        </DocPillar>
      </DocSection>

      <DocSection
        id="creator-verification"
        title="Creator Verification Layer (Anti-Sybil Protection)"
      >
        <DocParagraph>
          Digital marketing fraud is largely driven by automation and
          low-quality accounts. Nido integrates verification mechanisms to
          improve campaign integrity.
        </DocParagraph>
        <DocPillar title="Behavioral Pattern Monitoring">
          Suspicious automation patterns can be identified and restricted
          prior to campaign access.
        </DocPillar>
        <DocPillar title="Eligibility Filters">
          Campaigns can be configured with specific access criteria to reduce
          exposure to farming behavior or automated accounts.
        </DocPillar>
      </DocSection>
    </>
  );
}
