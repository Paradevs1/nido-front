"use client";

import { useEffect, useState, useCallback } from "react";
import { stellarApi, StellarEscrowStatus } from "@/lib/api/stellar";
import { explorerAccount } from "@/lib/stellar/network";

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtKey(k: string) {
  return `${k.slice(0, 6)}…${k.slice(-4)}`;
}
function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── types ────────────────────────────────────────────────────────────────────

type ResolveState = "idle" | "resolving";

// ─── component ────────────────────────────────────────────────────────────────

export default function StellarDisputesPage() {
  const [disputes, setDisputes] = useState<StellarEscrowStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await stellarApi.admin.listDisputes();
      setDisputes(res.data);
    } catch (e: any) {
      setError(e.message || "Falha ao carregar disputas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  return (
    <div className="min-h-screen text-[var(--color-text)] pb-20 pt-8">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <StellarLogo />
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Disputas Stellar
              </h1>
              {!loading && (
                <span className="text-xs bg-red-500/15 text-red-300 border border-red-500/20 px-2 py-0.5 rounded-full font-semibold">
                  {disputes.length} {disputes.length === 1 ? "aberta" : "abertas"}
                </span>
              )}
            </div>
            <p className="text-sm text-[#696E72]">
              Painel de arbitragem — NIDO Arbiter
            </p>
          </div>
          <button
            onClick={fetchDisputes}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm text-[#696E72] hover:text-white hover:border-white/20 transition-all disabled:opacity-40"
          >
            <RefreshIcon spinning={loading} />
            Atualizar
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-[var(--color-card)] p-5 space-y-3">
                <div className="h-4 w-48 bg-white/5 rounded-lg animate-pulse" />
                <div className="h-3 w-72 bg-white/5 rounded-lg animate-pulse" />
                <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && disputes.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">⚖️</div>
            <p className="text-white font-semibold">Sem disputas abertas</p>
            <p className="text-[#696E72] text-sm mt-1">Todos os escrows estão resolvidos.</p>
          </div>
        )}

        {/* Dispute cards */}
        {!loading && disputes.map((dispute) => (
          <DisputeCard
            key={dispute.jobId}
            dispute={dispute}
            onResolved={fetchDisputes}
          />
        ))}
      </div>
    </div>
  );
}

// ─── DisputeCard ──────────────────────────────────────────────────────────────

function DisputeCard({
  dispute,
  onResolved,
}: {
  dispute: StellarEscrowStatus;
  onResolved: () => void;
}) {
  const [resolveState, setResolveState] = useState<ResolveState>("idle");
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [resolveSuccess, setResolveSuccess] = useState<string | null>(null);

  const handleResolve = async (winner: "HOST" | "TALENT") => {
    setResolveState("resolving");
    setResolveError(null);
    setResolveSuccess(null);
    try {
      const res = await stellarApi.admin.resolveDispute(dispute.jobId, winner);
      setResolveSuccess(
        `${winner === "TALENT" ? "Talent" : "Host"} vence. XDR de resolução gerado — aguardando assinatura do vencedor.`
      );
      // Refetch after a short delay so card reflects dispute_winner
      setTimeout(onResolved, 1500);
      void res;
    } catch (e: any) {
      setResolveError(e.message || "Falha ao resolver disputa.");
    } finally {
      setResolveState("idle");
    }
  };

  const alreadyResolved = Boolean(dispute.disputeWinner);

  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--color-card)] overflow-hidden mb-4">

      {/* Card header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#696E72] font-mono">
              Job {dispute.jobId}
            </span>
            <span className="text-[10px] bg-red-500/15 text-red-300 border border-red-500/20 px-2 py-0.5 rounded-full font-semibold">
              DISPUTA
            </span>
            {alreadyResolved && (
              <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
                AGUARDANDO ASSINATURA
              </span>
            )}
          </div>
          <p className="text-xs text-[#696E72]">
            Aberto em: {dispute.createdAt ? fmtDate(dispute.createdAt) : "—"}
            {dispute.disputeInitiator && (
              <span className="ml-2 text-white/50">
                por {dispute.disputeInitiator === "TALENT" ? "Talent" : "Host"}
              </span>
            )}
          </p>
        </div>
        <span className="text-lg font-bold text-white">{dispute.balance} USDC</span>
      </div>

      {/* Details */}
      <div className="px-5 py-4 space-y-3">

        {/* Parties */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#26485E]/30 rounded-xl px-3 py-2.5 space-y-1">
            <p className="text-[10px] text-[#696E72] font-medium uppercase tracking-wide">Host</p>
            <a
              href={explorerAccount(dispute.hostPublicKey)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#ff5800] font-mono hover:underline flex items-center gap-1"
            >
              {fmtKey(dispute.hostPublicKey)}
              <ExternalIcon />
            </a>
          </div>
          <div className="bg-[#26485E]/30 rounded-xl px-3 py-2.5 space-y-1">
            <p className="text-[10px] text-[#696E72] font-medium uppercase tracking-wide">Escrow</p>
            <a
              href={explorerAccount(dispute.publicKey)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#ff5800] font-mono hover:underline flex items-center gap-1"
            >
              {fmtKey(dispute.publicKey)}
              <ExternalIcon />
            </a>
          </div>
        </div>

        {/* Reason */}
        {dispute.disputeReason && (
          <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3">
            <p className="text-[10px] text-[#696E72] font-medium uppercase tracking-wide mb-1.5">
              Motivo alegado
            </p>
            <p className="text-xs text-white/80 leading-relaxed">{dispute.disputeReason}</p>
          </div>
        )}

        {/* Already resolved banner */}
        {alreadyResolved && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-300 font-semibold">
              Decisão: {dispute.disputeWinner === "TALENT" ? "Talent vence" : "Host vence"}
            </p>
            <p className="text-xs text-[#696E72] mt-0.5">
              XDR de resolução gerado. Aguardando o vencedor assinar via Freighter na plataforma.
            </p>
          </div>
        )}

        {/* Feedback */}
        {resolveError && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
            <span className="text-red-400 text-xs mt-0.5 shrink-0">✕</span>
            <p className="text-xs text-red-400">{resolveError}</p>
          </div>
        )}
        {resolveSuccess && (
          <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
            <span className="text-emerald-400 text-xs mt-0.5 shrink-0">✓</span>
            <p className="text-xs text-emerald-400">{resolveSuccess}</p>
          </div>
        )}

        {/* Actions — only if not yet resolved */}
        {!alreadyResolved && !resolveSuccess && (
          <div className="pt-1">
            <p className="text-[10px] text-[#696E72] font-medium uppercase tracking-wide mb-2">
              Decisão do árbitro
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleResolve("TALENT")}
                disabled={resolveState === "resolving"}
                className="flex-1 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resolveState === "resolving" ? <Spinner /> : null}
                Talent vence
              </button>
              <button
                onClick={() => handleResolve("HOST")}
                disabled={resolveState === "resolving"}
                className="flex-1 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resolveState === "resolving" ? <Spinner /> : null}
                Host vence
              </button>
            </div>
            <p className="text-[10px] text-[#696E72] mt-2 text-center">
              Ao decidir, o XDR de resolução é gerado e o vencedor irá assinar via Freighter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── icon helpers ─────────────────────────────────────────────────────────────

function StellarLogo() {
  return (
    <div className="w-7 h-7 rounded-full bg-[#0a1f2e] border border-white/10 flex items-center justify-center shrink-0">
      <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
        <path
          d="M27.956 8.77l-1.04.43a7.5 7.5 0 00-10.6 2.44l-7.5-.43-.7.43v.86l.35.43 2.22.13a7.46 7.46 0 000 1.86l-2.22.13-.35.43v.86l.7.43 7.5-.43a7.5 7.5 0 0010.6 2.44l1.04.43.7-.43v-.86l-.35-.43-1.04-.43A5.5 5.5 0 0115.87 16a5.5 5.5 0 01-.24-1.5h9.94l.35-.43v-.86l-.35-.43h-9.94c.06-.51.16-1.01.3-1.5a5.5 5.5 0 0110.07-1.5l1.04-.43.35-.43v-.86l-.4-.36z"
          fill="#7EC8E3"
        />
      </svg>
    </div>
  );
}

function ExternalIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" className="inline-block opacity-70">
      <path d="M2.5 1.5H10.5V9.5M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={spinning ? "animate-spin" : ""}
    >
      <path
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
