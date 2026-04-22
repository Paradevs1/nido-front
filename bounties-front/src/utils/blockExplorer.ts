/** Base URLs for transaction hashes by chain slug (lowercase). */
const CHAIN_TX_BASE: Record<string, string> = {
  arbitrum: "https://arbiscan.io/tx/",
  base: "https://basescan.org/tx/",
  ethereum: "https://etherscan.io/tx/",
  berachain: "https://berascan.com/tx/",
  bsc: "https://bscscan.com/tx/",
  hyperevm: "https://hyperevmscan.io/tx/",
  polygon: "https://polygonscan.com/tx/",
  solana: "https://solscan.io/tx/",
  sui: "https://suiscan.xyz/mainnet/tx/",
};

export function getTxExplorerUrl(chain: string | undefined, signatureOrHash: string | undefined): string | null {
  if (!signatureOrHash?.trim() || !chain?.trim()) return null;
  const base = CHAIN_TX_BASE[chain.trim().toLowerCase()];
  return base ? `${base}${signatureOrHash.trim()}` : null;
}
