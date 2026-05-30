import { stellarApi } from "../api/stellar";
import { burnCctpEvm } from "./burn";
import { CCTP_CHAINS } from "./config";

export type CctpProgress =
  | "preparing"
  | "burning"
  | "registering"
  | "relaying"
  | "done";

/**
 * Full host-side CCTP inbound funding flow:
 *   prepare (backend) → burn on source chain (host wallet) → register burn
 *   (backend) → kick the relay. The mint lands on the escrow once Circle
 *   attests; the backend cron finishes it if the attestation isn't ready yet.
 */
export async function fundEscrowViaCctp(
  jobId: string,
  sourceChain: string,
  onProgress?: (p: CctpProgress) => void,
): Promise<{ burnTxHash: string }> {
  const chain = CCTP_CHAINS.find((c) => c.slug === sourceChain);
  if (!chain) throw new Error(`Unknown chain: ${sourceChain}`);
  if (chain.kind !== "evm") {
    throw new Error(
      `${chain.label} funding isn't wired yet — use an EVM chain (Base, Arbitrum, Ethereum or Polygon).`,
    );
  }

  onProgress?.("preparing");
  const { data: params } = await stellarApi.prepareInbound(jobId, sourceChain);

  onProgress?.("burning");
  const burnTxHash = await burnCctpEvm(params);

  onProgress?.("registering");
  await stellarApi.registerBurn(jobId, sourceChain, burnTxHash);

  // Try to relay now to speed up the happy path; if the attestation isn't
  // ready, the backend cron retries until it is — so this is non-fatal.
  onProgress?.("relaying");
  try {
    await stellarApi.relayInbound(jobId);
  } catch {
    /* attestation not ready yet — cron will finish it */
  }

  onProgress?.("done");
  return { burnTxHash };
}
