import { IS_MAINNET } from "../stellar/network";

/**
 * CCTP V2 (Circle Cross-Chain Transfer Protocol) — frontend config for the
 * source-chain burn. The host's wallet burns native USDC here; Circle mints it
 * onto the escrow's Stellar account (relayed by the backend).
 *
 * Source-chain (EVM) TokenMessengerV2 is Circle's contract — NOT returned by the
 * backend (the backend only knows the Stellar-side forwarder). For CCTP V2 the
 * EVM TokenMessengerV2 shares one address across every supported EVM chain.
 *
 * NOTE: verify these against Circle's docs before mainnet, the same way the
 * backend verifies Stellar contracts via `npm run cctp:check`.
 */

// CCTP V2 EVM TokenMessengerV2 — same address on all supported EVM chains.
export const EVM_TOKEN_MESSENGER_V2: `0x${string}` = IS_MAINNET
  ? "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d" // mainnet
  : "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA"; // testnet (Sepolia et al.)

export type CctpVmKind = "evm" | "solana" | "sui";

export interface CctpFrontChain {
  slug: string;
  label: string;
  kind: CctpVmKind;
}

/**
 * Source chains offered in the UI. Mirrors the backend `CCTP_SOURCE_CHAINS`.
 * Only the EVM burn is wired today; solana/sui are listed but disabled until
 * their Move/program burn helpers land.
 */
export const CCTP_CHAINS: CctpFrontChain[] = [
  { slug: "base", label: "Base", kind: "evm" },
  { slug: "arbitrum", label: "Arbitrum", kind: "evm" },
  { slug: "ethereum", label: "Ethereum", kind: "evm" },
  { slug: "polygon", label: "Polygon", kind: "evm" },
  { slug: "solana", label: "Solana", kind: "solana" },
  { slug: "sui", label: "Sui", kind: "sui" },
];

/** Minimal ABI: ERC20 approve + CCTP V2 depositForBurnWithHook. */
export const ERC20_APPROVE_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const TOKEN_MESSENGER_V2_ABI = [
  {
    name: "depositForBurnWithHook",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "destinationDomain", type: "uint32" },
      { name: "mintRecipient", type: "bytes32" },
      { name: "burnToken", type: "address" },
      { name: "destinationCaller", type: "bytes32" },
      { name: "maxFee", type: "uint256" },
      { name: "minFinalityThreshold", type: "uint32" },
      { name: "hookData", type: "bytes" },
    ],
    outputs: [],
  },
] as const;
