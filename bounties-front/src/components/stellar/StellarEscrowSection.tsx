"use client";

import { useState, useEffect, useCallback } from "react";
import { useWalletContext } from "@/lib/contexts/WalletContext";
import StellarWalletModal from "@/components/wallet/StellarWalletModal";
import { stellarApi, StellarEscrowStatus } from "@/lib/api/stellar";
import { signEscrowXDR } from "@/lib/wallet/transactions";

interface StellarEscrowSectionProps {
  campaignId: string;
  talentPublicKey?: string;
  campaignAmount?: string;
  campaignDeadlineDays?: number;
}

export default function StellarEscrowSection({
  campaignId,
  talentPublicKey,
  campaignAmount = "10",
  campaignDeadlineDays = 15,
}: StellarEscrowSectionProps) {
  const { stellarAddress, isStellarConnected, connectStellar } = useWalletContext();

  const [escrow, setEscrow] = useState<StellarEscrowStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await stellarApi.getStatus(campaignId);
      setEscrow(res.data);
    } catch {
      setEscrow(null);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleCreate = async () => {
    if (!isStellarConnected || !stellarAddress) {
      setWalletModalOpen(true);
      return;
    }
    if (!talentPublicKey) {
      setError("Talent wallet not found for this campaign.");
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await stellarApi.createEscrow({
        jobId: campaignId,
        hostPublicKey: stellarAddress,
        talentPublicKey,
        amount: campaignAmount,
        deadlineDays: campaignDeadlineDays,
      });
      setSuccess(
        `Escrow funded! TX: ${res.data.transactionHash.slice(0, 16)}...`
      );
      await fetchStatus();
    } catch (e: any) {
      setError(e.message || "Failed to create escrow");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!isStellarConnected) {
      setWalletModalOpen(true);
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { data } = await stellarApi.getPaymentXDR(campaignId);
      const signedXDR = await signEscrowXDR(data.paymentTxXDR);
      const res = await stellarApi.release(campaignId, signedXDR);
      setSuccess(
        `Payment released! TX: ${res.data.transactionHash.slice(0, 16)}...`
      );
      await fetchStatus();
    } catch (e: any) {
      if (e.message === "USER_REJECTED") return;
      setError(e.message || "Failed to release payment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!isStellarConnected) {
      setWalletModalOpen(true);
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { data } = await stellarApi.getRefundXDR(campaignId);
      const signedXDR = await signEscrowXDR(data.refundTxXDR);
      const res = await stellarApi.refund(campaignId, signedXDR);
      setSuccess(
        `Refund complete! TX: ${res.data.transactionHash.slice(0, 16)}...`
      );
      await fetchStatus();
    } catch (e: any) {
      if (e.message === "USER_REJECTED") return;
      setError(e.message || "Failed to refund");
    } finally {
      setActionLoading(false);
    }
  };

  const deadlineDate = escrow?.deadline
    ? new Date(escrow.deadline * 1000).toLocaleDateString("pt-BR")
    : null;

  const isExpired =
    escrow?.deadline && Math.floor(Date.now() / 1000) > escrow.deadline;

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[var(--color-card)] p-5">
        <div className="h-4 w-40 bg-gray-700 rounded animate-pulse mb-3" />
        <div className="h-3 w-full bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <StellarWalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onConnect={() => {
          setWalletModalOpen(false);
          connectStellar();
        }}
      />

      <div className="rounded-2xl border border-white/10 bg-[var(--color-card)] p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Stellar Escrow</h3>
            <p className="text-xs text-gray-400 mt-0.5">Trustless · USDC · Testnet</p>
          </div>
          {escrow && (
            <StatusBadge status={escrow.status} />
          )}
        </div>

        {/* Escrow details */}
        {escrow && escrow.status === "FUNDED" && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Locked</span>
              <span className="text-white font-medium">{escrow.balance} USDC</span>
            </div>
            {deadlineDate && (
              <div className="flex justify-between text-gray-400">
                <span>Deadline</span>
                <span className={isExpired ? "text-red-400" : "text-white"}>
                  {deadlineDate} {isExpired && "· expired"}
                </span>
              </div>
            )}
            <div className="flex justify-between text-gray-400">
              <span>Account</span>
              <span className="text-white font-mono text-xs">
                {escrow.publicKey.slice(0, 6)}…{escrow.publicKey.slice(-6)}
              </span>
            </div>
          </div>
        )}

        {(escrow?.status === "COMPLETED" || escrow?.status === "REFUNDED") && (
          <div className="space-y-1 text-sm text-gray-400">
            <p>
              {escrow.status === "COMPLETED"
                ? "Payment released to talent."
                : "Funds returned to host."}
            </p>
            {(escrow.releaseTxHash || escrow.refundCloseTxHash) && (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${escrow.releaseTxHash || escrow.refundCloseTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff5701] hover:underline text-xs"
              >
                View on Stellar Expert →
              </a>
            )}
          </div>
        )}

        {/* Feedback */}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs text-green-400 bg-green-500/10 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        {/* Wallet chip */}
        {isStellarConnected && stellarAddress && (
          <p className="text-xs text-gray-500 font-mono truncate">
            {stellarAddress.slice(0, 8)}…{stellarAddress.slice(-8)}
          </p>
        )}

        {/* Actions */}
        {!escrow && (
          <button
            onClick={handleCreate}
            disabled={actionLoading}
            className="w-full py-2.5 rounded-xl bg-[#ff5701] hover:bg-[#e04e01] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {actionLoading
              ? "Processing…"
              : isStellarConnected
              ? "Fund Escrow via Stellar"
              : "Connect Freighter & Fund"}
          </button>
        )}

        {escrow?.status === "FUNDED" && (
          <div className="flex gap-2">
            <button
              onClick={handleRelease}
              disabled={actionLoading}
              className="flex-1 py-2.5 rounded-xl bg-[#ff5701] hover:bg-[#e04e01] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {actionLoading ? "Signing…" : "Approve Payment"}
            </button>
            {isExpired && (
              <button
                onClick={handleRefund}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {actionLoading ? "Signing…" : "Request Refund"}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: StellarEscrowStatus["status"] }) {
  const map: Record<StellarEscrowStatus["status"], { label: string; cls: string }> = {
    CREATED:   { label: "Created",   cls: "bg-blue-500/20 text-blue-300" },
    FUNDED:    { label: "Funded ●",  cls: "bg-green-500/20 text-green-300" },
    COMPLETED: { label: "Released",  cls: "bg-purple-500/20 text-purple-300" },
    REFUNDED:  { label: "Refunded",  cls: "bg-yellow-500/20 text-yellow-300" },
    DISPUTED:  { label: "Disputed",  cls: "bg-red-500/20 text-red-300" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}
