import { Networks } from "stellar-sdk";

/**
 * Single source of truth for Stellar network selection on the frontend.
 * Driven by NEXT_PUBLIC_STELLAR_NETWORK ("mainnet" → public, anything else → testnet).
 */

export const IS_MAINNET = process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet";

/** Passphrase used when signing/building Stellar transactions. */
export const NETWORK_PASSPHRASE = IS_MAINNET ? Networks.PUBLIC : Networks.TESTNET;

/** stellar.expert path segment: "public" for mainnet, "testnet" otherwise. */
export const EXPLORER_NETWORK = IS_MAINNET ? "public" : "testnet";

/** Short label shown on UI badges. */
export const NETWORK_BADGE = IS_MAINNET ? "MAINNET" : "TESTNET";

export function explorerTx(hash: string): string {
  return `https://stellar.expert/explorer/${EXPLORER_NETWORK}/tx/${hash}`;
}

export function explorerAccount(addr: string): string {
  return `https://stellar.expert/explorer/${EXPLORER_NETWORK}/account/${addr}`;
}
