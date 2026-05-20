"use client";

import { useState } from "react";
import { stellarApi } from "@/lib/api/stellar";

// ─── types ────────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jobId: string;
  initiator: "HOST" | "TALENT";
  escrowAmount?: string;
}

// ─── component ────────────────────────────────────────────────────────────────

export default function StellarDisputeModal({
  isOpen,
  onClose,
  onSuccess,
  jobId,
  initiator,
  escrowAmount,
}: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (trimmed.length < 20) {
      setError("Descreva o motivo com pelo menos 20 caracteres.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await stellarApi.openDispute(jobId, trimmed, initiator);
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message || "Falha ao abrir disputa.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--color-card)] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-base">⚖️</span>
              <span className="text-sm font-bold text-white tracking-tight">Abrir Disputa</span>
              <span className="text-[10px] bg-red-500/15 text-red-300 border border-red-500/20 px-2 py-0.5 rounded-full font-semibold">
                ESCROW BLOQUEADO
              </span>
            </div>
            <p className="text-xs text-[#696E72]">
              O árbitro da NIDO irá revisar as evidências e decidir.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#696E72] hover:text-white transition-colors p-1"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">

          {/* Info */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 space-y-1">
            <p className="text-xs font-semibold text-amber-300">Antes de continuar</p>
            <p className="text-xs text-[#696E72] leading-relaxed">
              Ao abrir uma disputa, o escrow de{" "}
              {escrowAmount ? (
                <span className="text-white font-semibold">{escrowAmount} USDC</span>
              ) : (
                "USDC"
              )}{" "}
              fica bloqueado até resolução pelo árbitro. Forneça evidências claras.
            </p>
          </div>

          {/* Reason field */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#696E72] font-medium">
              Motivo da disputa
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              placeholder={
                initiator === "TALENT"
                  ? "Ex: Entregui o conteúdo conforme o briefing em [data], mas o Host recusou sem justificativa. Link da entrega: ..."
                  : "Ex: O talent não entregou o conteúdo acordado até [data]. Comunicações em: ..."
              }
              rows={5}
              className="w-full bg-[#26485E]/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-[#696E72]/60 focus:outline-none focus:border-[#ff5800]/40 focus:ring-1 focus:ring-[#ff5800]/15 resize-none transition-colors leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#696E72]">Mínimo 20 caracteres</span>
              <span
                className={`text-[10px] ${
                  reason.trim().length >= 20 ? "text-emerald-400" : "text-[#696E72]"
                }`}
              >
                {reason.trim().length} / 20+
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
              <span className="text-red-400 text-xs mt-0.5 shrink-0">✕</span>
              <p className="text-xs text-red-400 leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl border border-white/15 text-sm font-semibold text-[#696E72] hover:text-white hover:border-white/30 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || reason.trim().length < 20}
            className="flex-1 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Spinner />
                Enviando…
              </>
            ) : (
              "Confirmar Disputa"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />
  );
}
