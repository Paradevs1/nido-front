"use client";

import { useState, useEffect, useCallback } from "react";
import { useWalletContext } from "@/lib/contexts/WalletContext";
import StellarWalletModal from "@/components/wallet/StellarWalletModal";
import StellarDisputeModal from "@/components/stellar/StellarDisputeModal";
import { stellarApi, StellarEscrowStatus } from "@/lib/api/stellar";
import { signEscrowXDR } from "@/lib/wallet/transactions";

// ─── types ────────────────────────────────────────────────────────────────────

interface Props {
  campaignId: string;
  talentPublicKey?: string;
  campaignAmount?: string;
  campaignDeadlineDays?: number;
}

type ActionPhase = "idle" | "signing" | "submitting";

// ─── helpers ──────────────────────────────────────────────────────────────────

const NET = "testnet";

function explorerTx(hash: string) {
  return `https://stellar.expert/explorer/${NET}/tx/${hash}`;
}
function explorerAccount(addr: string) {
  return `https://stellar.expert/explorer/${NET}/account/${addr}`;
}
function fmtKey(k: string) {
  return `${k.slice(0, 6)}…${k.slice(-4)}`;
}
function fmtDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── sub-components ───────────────────────────────────────────────────────────

const BADGES: Record<
  StellarEscrowStatus["status"],
  { label: string; cls: string }
> = {
  CREATED:   { label: "Criado",    cls: "bg-blue-500/15 text-blue-300 border-blue-500/20" },
  FUNDED:    { label: "Ativo ●",   cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" },
  COMPLETED: { label: "Liberado",  cls: "bg-purple-500/15 text-purple-300 border-purple-500/20" },
  REFUNDED:  { label: "Reembolso", cls: "bg-amber-500/15 text-amber-300 border-amber-500/20" },
  DISPUTED:  { label: "Disputa",   cls: "bg-red-500/15 text-red-300 border-red-500/20" },
};

function StatusBadge({ status }: { status: StellarEscrowStatus["status"] }) {
  const { label, cls } = BADGES[status];
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-[#696E72]">{label}</span>
      <div className="text-xs text-white text-right">{children}</div>
    </div>
  );
}

function Steps({ step }: { step: 0 | 1 | 2 | 3 }) {
  const items = ["Depositar", "Bloqueado", "Liberar"];
  return (
    <div className="flex items-center justify-center gap-0 py-1">
      {items.map((label, i) => {
        const done = i < step;
        const current = i === step;
        const future = i > step;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all",
                  done
                    ? "bg-[#ff5800] text-white"
                    : current
                    ? "border-2 border-[#ff5800] text-[#ff5800] bg-[#ff5800]/10"
                    : "border border-white/15 text-[#696E72] bg-white/3",
                ].join(" ")}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={[
                  "text-[10px] font-medium",
                  done
                    ? "text-[#ff5800]/70"
                    : current
                    ? "text-[#ff5800]"
                    : "text-[#696E72]",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
            {i < items.length - 1 && (
              <div
                className={[
                  "h-px w-10 mx-2 mb-4 transition-colors",
                  i < step ? "bg-[#ff5800]/50" : "bg-white/10",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function StellarEscrowSection({
  campaignId,
  talentPublicKey: talentProp,
  campaignAmount = "10",
  campaignDeadlineDays = 15,
}: Props) {
  const { stellarAddress, isStellarConnected, connectStellar } =
    useWalletContext();

  const [escrow, setEscrow] = useState<StellarEscrowStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<ActionPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [walletModal, setWalletModal] = useState(false);
  const [disputeModal, setDisputeModal] = useState(false);
  const [talentInput, setTalentInput] = useState("");

  const talentKey = talentProp || talentInput.trim() || undefined;

  // ─── fetch ──────────────────────────────────────────────────────────────────

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

  // ─── actions ────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!isStellarConnected || !stellarAddress) {
      setWalletModal(true);
      return;
    }
    if (!talentKey) {
      setError("Informe o endereço Stellar do talent para continuar.");
      return;
    }
    setPhase("submitting");
    setError(null);
    setSuccess(null);
    try {
      const res = await stellarApi.createEscrow({
        jobId: campaignId,
        hostPublicKey: stellarAddress,
        talentPublicKey: talentKey,
        amount: campaignAmount,
        deadlineDays: campaignDeadlineDays,
      });
      setSuccess(
        `Escrow criado — TX: ${res.data.transactionHash.slice(0, 16)}…`
      );
      await fetchStatus();
    } catch (e: any) {
      setError(e.message || "Falha ao criar escrow");
    } finally {
      setPhase("idle");
    }
  };

  const handleRelease = async () => {
    if (!isStellarConnected) {
      setWalletModal(true);
      return;
    }
    setPhase("signing");
    setError(null);
    setSuccess(null);
    try {
      const { data } = await stellarApi.getPaymentXDR(campaignId);
      const signed = await signEscrowXDR(data.paymentTxXDR);
      setPhase("submitting");
      const res = await stellarApi.release(campaignId, signed);
      setSuccess(
        `Pagamento liberado — TX: ${res.data.transactionHash.slice(0, 16)}…`
      );
      await fetchStatus();
    } catch (e: any) {
      if (e.message === "USER_REJECTED") {
        setPhase("idle");
        return;
      }
      setError(e.message || "Falha ao liberar pagamento");
    } finally {
      setPhase("idle");
    }
  };

  const handleRefund = async () => {
    if (!isStellarConnected) {
      setWalletModal(true);
      return;
    }
    setPhase("signing");
    setError(null);
    setSuccess(null);
    try {
      const { data } = await stellarApi.getRefundXDR(campaignId);
      const signed = await signEscrowXDR(data.refundTxXDR);
      setPhase("submitting");
      const res = await stellarApi.refund(campaignId, signed);
      setSuccess(
        `Reembolso concluído — TX: ${res.data.transactionHash.slice(0, 16)}…`
      );
      await fetchStatus();
    } catch (e: any) {
      if (e.message === "USER_REJECTED") {
        setPhase("idle");
        return;
      }
      setError(e.message || "Falha ao solicitar reembolso");
    } finally {
      setPhase("idle");
    }
  };

  // ─── computed ────────────────────────────────────────────────────────────────

  const nowSec = Math.floor(Date.now() / 1000);
  const isExpired = escrow?.deadline ? nowSec > escrow.deadline : false;
  const deadlineStr = escrow?.deadline ? fmtDate(escrow.deadline) : null;

  const step: 0 | 1 | 2 | 3 = !escrow
    ? 0
    : escrow.status === "FUNDED" || escrow.status === "CREATED"
    ? 1
    : escrow.status === "COMPLETED" || escrow.status === "REFUNDED"
    ? 3
    : 2;

  const busy = phase !== "idle";

  // ─── loading skeleton ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[var(--color-card)] p-5 space-y-3">
        <div className="h-4 w-36 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-3 w-52 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse mt-3" />
      </div>
    );
  }

  // ─── render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <StellarWalletModal
        isOpen={walletModal}
        onClose={() => setWalletModal(false)}
        onConnect={() => {
          setWalletModal(false);
          connectStellar();
        }}
      />
      <StellarDisputeModal
        isOpen={disputeModal}
        onClose={() => setDisputeModal(false)}
        onSuccess={fetchStatus}
        jobId={campaignId}
        initiator="HOST"
        escrowAmount={escrow?.balance ?? campaignAmount}
      />

      <div className="rounded-2xl border border-white/10 bg-[var(--color-card)] overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <StellarLogo />
              <span className="text-sm font-bold text-white tracking-tight">
                Stellar Escrow
              </span>
              {escrow && <StatusBadge status={escrow.status} />}
            </div>
            <p className="text-xs text-[#696E72]">
              USDC · Multisig 2-de-3 · Non-custodial
            </p>
          </div>
          <span className="text-[10px] text-amber-500/70 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 mt-0.5">
            TESTNET
          </span>
        </div>

        {/* ── Steps ──────────────────────────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-2">
          <Steps step={step} />
        </div>

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div className="px-5 pb-5 space-y-3">

          {/* ── No escrow ────────────────────────────────────────────────────── */}
          {!escrow && (
            <div className="space-y-3">
              <p className="text-xs text-[#696E72] leading-relaxed">
                Bloqueie{" "}
                <span className="text-white font-semibold">
                  {campaignAmount} USDC
                </span>{" "}
                on-chain. O valor só é liberado quando você aprovar — sem custódia da NIDO.
              </p>

              {/* talent wallet input */}
              {!talentProp && (
                <div className="space-y-1.5">
                  <label className="text-[11px] text-[#696E72] font-medium">
                    Endereço Stellar do Talent
                  </label>
                  <input
                    type="text"
                    value={talentInput}
                    onChange={(e) => {
                      setTalentInput(e.target.value);
                      setError(null);
                    }}
                    placeholder="GXXXXXXXXXXXXXXXX…"
                    spellCheck={false}
                    className="w-full bg-[#26485E]/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-[#696E72]/60 focus:outline-none focus:border-[#ff5800]/40 focus:ring-1 focus:ring-[#ff5800]/15 font-mono transition-colors"
                  />
                </div>
              )}

              {/* wallet chip */}
              {isStellarConnected && stellarAddress && (
                <WalletChip address={stellarAddress} />
              )}
            </div>
          )}

          {/* ── Funded details ───────────────────────────────────────────────── */}
          {escrow && (escrow.status === "FUNDED" || escrow.status === "CREATED") && (
            <div className="bg-[#26485E]/30 rounded-xl px-4 divide-y divide-white/5">
              <Row label="Bloqueado">
                <span className="font-semibold text-emerald-300">
                  {escrow.balance} USDC
                </span>
              </Row>
              <Row label="Conta Escrow">
                <a
                  href={explorerAccount(escrow.publicKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#ff5800] font-mono hover:underline"
                >
                  {fmtKey(escrow.publicKey)}
                  <ExternalIcon />
                </a>
              </Row>
              {deadlineStr && (
                <Row label="Deadline">
                  <span className={isExpired ? "text-red-400 font-medium" : ""}>
                    {deadlineStr}
                    {isExpired && (
                      <span className="ml-1 text-red-400/70">· expirado</span>
                    )}
                  </span>
                </Row>
              )}
              {isStellarConnected && stellarAddress && (
                <Row label="Host (você)">
                  <span className="font-mono text-[11px]">
                    {fmtKey(stellarAddress)}
                  </span>
                </Row>
              )}
            </div>
          )}

          {/* ── Terminal: completed ──────────────────────────────────────────── */}
          {escrow?.status === "COMPLETED" && (
            <TerminalCard
              icon="✓"
              title="Pagamento liberado"
              desc="USDC enviado ao talent com sucesso."
              txHash={escrow.releaseTxHash}
              color="purple"
            />
          )}

          {/* ── Terminal: refunded ───────────────────────────────────────────── */}
          {escrow?.status === "REFUNDED" && (
            <TerminalCard
              icon="↩"
              title="Reembolso concluído"
              desc="USDC retornou para sua carteira."
              txHash={escrow.refundCloseTxHash}
              color="amber"
            />
          )}

          {/* ── Terminal: disputed ───────────────────────────────────────────── */}
          {escrow?.status === "DISPUTED" && !escrow.disputeWinner && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 space-y-1">
              <p className="text-sm font-semibold text-white">
                Disputa em andamento
              </p>
              <p className="text-xs text-[#696E72]">
                O árbitro da NIDO está revisando as evidências.
              </p>
              {escrow.disputeReason && (
                <p className="text-xs text-[#696E72] mt-2 pt-2 border-t border-red-500/10">
                  Motivo: <span className="text-white/70">{escrow.disputeReason}</span>
                </p>
              )}
            </div>
          )}

          {/* Host ganhou a disputa — claim */}
          {escrow?.status === "DISPUTED" && escrow.disputeWinner === "HOST" && escrow.disputeResolutionXDR && (
            <HostDisputeClaim
              escrow={escrow}
              campaignId={campaignId}
              onSuccess={fetchStatus}
            />
          )}

          {/* Talent ganhou — aguardando talent assinar */}
          {escrow?.status === "DISPUTED" && escrow.disputeWinner === "TALENT" && (
            <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 px-4 py-3 space-y-1">
              <p className="text-sm font-semibold text-white">Disputa encerrada</p>
              <p className="text-xs text-[#696E72]">
                O árbitro decidiu a favor do Talent. O Talent irá receber os USDC.
              </p>
            </div>
          )}

          {/* ── Action phase indicator ───────────────────────────────────────── */}
          {busy && (
            <div className="flex items-center gap-2.5 bg-[#ff5800]/10 border border-[#ff5800]/20 rounded-xl px-3 py-2.5">
              <Spinner />
              <span className="text-xs text-[#ff5800]">
                {phase === "signing"
                  ? "Aguardando assinatura no Freighter…"
                  : "Enviando para a Stellar…"}
              </span>
            </div>
          )}

          {/* ── Feedback ─────────────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
              <span className="text-red-400 text-xs mt-0.5 shrink-0">✕</span>
              <p className="text-xs text-red-400 leading-relaxed">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
              <span className="text-emerald-400 text-xs mt-0.5 shrink-0">✓</span>
              <p className="text-xs text-emerald-400 leading-relaxed">{success}</p>
            </div>
          )}

          {/* ── Actions: create ──────────────────────────────────────────────── */}
          {!escrow && (
            <button
              onClick={handleCreate}
              disabled={busy}
              className="w-full py-3 rounded-xl bg-[#ff5800] hover:bg-[#e04f00] active:bg-[#c94600] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy
                ? "Processando…"
                : isStellarConnected
                ? `Depositar ${campaignAmount} USDC`
                : "Conectar Freighter e Depositar"}
            </button>
          )}

          {/* ── Actions: funded ──────────────────────────────────────────────── */}
          {(escrow?.status === "FUNDED" || escrow?.status === "CREATED") && (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleRelease}
                disabled={busy}
                className="w-full py-3 rounded-xl bg-[#ff5800] hover:bg-[#e04f00] active:bg-[#c94600] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FreighterIcon />
                {phase === "signing"
                  ? "Assinar no Freighter…"
                  : phase === "submitting"
                  ? "Enviando…"
                  : "Aprovar Pagamento"}
              </button>

              <button
                onClick={handleRefund}
                disabled={busy || !isExpired}
                title={
                  !isExpired
                    ? `Reembolso disponível a partir de ${deadlineStr}`
                    : undefined
                }
                className={[
                  "w-full py-2.5 rounded-xl text-sm font-semibold transition-colors",
                  isExpired
                    ? "bg-[#26485E] hover:bg-[#2e5470] text-white cursor-pointer"
                    : "bg-white/5 text-[#696E72] cursor-not-allowed",
                  busy ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
              >
                {isExpired
                  ? "Solicitar Reembolso"
                  : `Reembolso a partir de ${deadlineStr ?? "…"}`}
              </button>

              <button
                onClick={() => setDisputeModal(true)}
                disabled={busy}
                className="w-full py-2 rounded-xl border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/10 hover:border-red-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Talent não entregou — Abrir disputa
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div className="border-t border-white/5 px-5 py-3 flex items-center justify-between">
          <span className="text-[10px] text-[#696E72]">
            Powered by{" "}
            <span className="text-white/40 font-medium">Stellar L1</span>
          </span>
          <span className="text-[10px] text-[#696E72]">
            Sponsored Reserves · FeeBump · Pre-auth TX
          </span>
        </div>
      </div>
    </>
  );
}

// ─── small helpers ────────────────────────────────────────────────────────────

function WalletChip({ address }: { address: string }) {
  return (
    <div className="flex items-center gap-2 bg-[#26485E]/50 rounded-xl px-3 py-2">
      <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
      <span className="text-xs text-[#696E72]">Freighter conectado</span>
      <span className="text-xs text-white font-mono ml-auto">
        {fmtKey(address)}
      </span>
    </div>
  );
}

function TerminalCard({
  icon,
  title,
  desc,
  txHash,
  color,
}: {
  icon: string;
  title: string;
  desc: string;
  txHash?: string;
  color: "purple" | "amber";
}) {
  const cls =
    color === "purple"
      ? "bg-purple-500/10 border-purple-500/20"
      : "bg-amber-500/10 border-amber-500/20";
  const txCls =
    color === "purple" ? "text-purple-300 hover:text-purple-200" : "text-amber-300 hover:text-amber-200";

  return (
    <div className={`rounded-xl border px-4 py-3 space-y-2.5 ${cls}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5 leading-none">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-[#696E72] mt-0.5">{desc}</p>
        </div>
      </div>
      {txHash && (
        <a
          href={explorerTx(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${txCls}`}
        >
          <span>Ver no Stellar Expert</span>
          <ExternalIcon />
        </a>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#ff5800] border-t-transparent animate-spin shrink-0" />
  );
}

function ExternalIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      className="inline-block opacity-70"
    >
      <path
        d="M2.5 1.5H10.5V9.5M10.5 1.5L1.5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FreighterIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="opacity-80 shrink-0"
    >
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
      <path
        d="M8 12h8M12 8l4 4-4 4"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── HostDisputeClaim ─────────────────────────────────────────────────────────

function HostDisputeClaim({
  escrow,
  campaignId,
  onSuccess,
}: {
  escrow: StellarEscrowStatus;
  campaignId: string;
  onSuccess: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "signing" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!escrow.disputeResolutionXDR) return;
    setPhase("signing");
    setError(null);
    try {
      const signed = await signEscrowXDR(escrow.disputeResolutionXDR);
      setPhase("submitting");
      const res = await stellarApi.claimDispute(campaignId, signed);
      setSuccess(`Reembolso recebido — TX: ${res.data.transactionHash.slice(0, 16)}…`);
      onSuccess();
    } catch (e: any) {
      if (e.message === "USER_REJECTED") { setPhase("idle"); return; }
      setError(e.message || "Falha ao assinar.");
    } finally {
      setPhase("idle");
    }
  };

  return (
    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5 leading-none">🏆</span>
        <div>
          <p className="text-sm font-semibold text-white">Você ganhou a disputa</p>
          <p className="text-xs text-[#696E72] mt-0.5">
            O árbitro decidiu a seu favor. Assine para receber o reembolso.
          </p>
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-emerald-400">{success}</p>}
      {!success && (
        <button
          onClick={handleClaim}
          disabled={phase !== "idle"}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {phase === "signing" ? <><Spinner />Assinar no Freighter…</> :
           phase === "submitting" ? <><Spinner />Enviando…</> :
           "Assinar e Receber Reembolso"}
        </button>
      )}
    </div>
  );
}

function StellarLogo() {
  return (
    <div className="w-5 h-5 rounded-full bg-[#0a1f2e] border border-white/10 flex items-center justify-center shrink-0">
      <svg width="10" height="10" viewBox="0 0 32 32" fill="none">
        <path
          d="M27.956 8.77l-1.04.43a7.5 7.5 0 00-10.6 2.44l-7.5-.43-.7.43v.86l.35.43 2.22.13a7.46 7.46 0 000 1.86l-2.22.13-.35.43v.86l.7.43 7.5-.43a7.5 7.5 0 0010.6 2.44l1.04.43.7-.43v-.86l-.35-.43-1.04-.43A5.5 5.5 0 0115.87 16a5.5 5.5 0 01-.24-1.5h9.94l.35-.43v-.86l-.35-.43h-9.94c.06-.51.16-1.01.3-1.5a5.5 5.5 0 0110.07-1.5l1.04-.43.35-.43v-.86l-.4-.36z"
          fill="#7EC8E3"
        />
      </svg>
    </div>
  );
}
