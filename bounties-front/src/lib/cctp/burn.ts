import { writeContract, waitForTransaction, getAccount, switchChain } from "wagmi/actions";
import { wagmiConfig, chainNameToId } from "../wallet/config";
import { assertSupportedChainId } from "../wallet/transactions";
import {
  EVM_TOKEN_MESSENGER_V2,
  ERC20_APPROVE_ABI,
  TOKEN_MESSENGER_V2_ABI,
} from "./config";
import type { PrepareInboundResponse } from "../api/stellar";

/**
 * Burn native USDC on an EVM source chain via CCTP V2, targeting the escrow's
 * Stellar account. Two on-chain steps signed by the host's EVM wallet:
 *   1. approve(tokenMessenger, amount) on the USDC ERC20
 *   2. depositForBurnWithHook(...) on the TokenMessengerV2
 * Returns the burn tx hash, which the backend then relays once Circle attests.
 */
export async function burnCctpEvm(params: PrepareInboundResponse): Promise<string> {
  const rawChainId = chainNameToId[params.sourceChain];
  if (!rawChainId) throw new Error(`Unsupported EVM chain: ${params.sourceChain}`);
  const chainId = assertSupportedChainId(rawChainId);

  const account = getAccount(wagmiConfig);
  if (!account.address) throw new Error("Connect an EVM wallet to fund from this chain");
  if (account.chainId !== chainId) {
    await switchChain(wagmiConfig, { chainId });
  }

  const amount = BigInt(params.amount);

  // 1) approve USDC spend to the TokenMessenger
  const approveHash = await writeContract(wagmiConfig, {
    address: params.burnToken as `0x${string}`,
    abi: ERC20_APPROVE_ABI,
    functionName: "approve",
    args: [EVM_TOKEN_MESSENGER_V2, amount],
    chainId,
  });
  await waitForTransaction(wagmiConfig, { hash: approveHash, confirmations: 1, timeout: 120_000 });

  // 2) burn with hook → Circle mints onto the escrow's Stellar account
  const burnHash = await writeContract(wagmiConfig, {
    address: EVM_TOKEN_MESSENGER_V2,
    abi: TOKEN_MESSENGER_V2_ABI,
    functionName: "depositForBurnWithHook",
    args: [
      amount,
      params.destinationDomain,
      params.mintRecipient as `0x${string}`,
      params.burnToken as `0x${string}`,
      params.destinationCaller as `0x${string}`,
      BigInt(params.maxFee),
      params.minFinalityThreshold,
      params.hookData as `0x${string}`,
    ],
    chainId,
  });
  const receipt = await waitForTransaction(wagmiConfig, {
    hash: burnHash,
    confirmations: 1,
    timeout: 120_000,
  });

  return receipt.transactionHash;
}
