"use client";

import { useState, useEffect, useCallback } from "react";
import { useWalletContext } from "@/lib/contexts/WalletContext";
import { stellarApi, StellarEscrowStatus } from "@/lib/api/stellar";
import { creatorApi } from "@/lib/api/creator";
import { signEscrowXDR } from "@/lib/wallet/transactions";
import StellarDisputeModal from "@/components/stellar/StellarDisputeModal";

// ─── types ────────────────────────────────────────────────────────────────────

interface Props {
  campaignId: string;
  /** Passa o wallet já conhecido para evitar fetch de perfil — opcional. */
  savedStellarWallet?: string;
  talentAmount?: string;
}

type SavePhase = "idle" | "saving" | "saved";
type ClaimPhase = "idle" | "signing" | "submitting";

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
  CREATED:   { label: "Aguardando",  cls: "bg-blue-500/15 text-blue-300 border-blue-500/20" },
  FUNDED:    { label: "Bloqueado ●", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" },
  COMPLETED: { label: "Recebido",    cls: "bg-purple-500/15 text-purple-300 border-purple-500/20" },
  REFUNDED:  { label: "Reembolso",   cls: "bg-amber-500/15 text-amber-300 border-amber-500/20" },
  DISPUTED:  { label: "Disputa",     cls: "bg-red-500/15 text-red-300 border-red-500/20" },
};

function StatusBadge({ status }: { status: StellarEscrowStatus["status"] }) {
  const { label, cls } = BADGES[status];
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-[#696E72]">{label}</span>
      <div className="text-xs text-white text-right">{children}</div>
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
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="inline-block opacity-70">
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

function WalletChip({ address }: { address: string }) {
  return (
    <div className="flex items-center gap-2 bg-[#26485E]/50 rounded-xl px-3 py-2">
      <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
      <span className="text-xs text-[#696E72]">Freighter</span>
      <span className="text-xs text-white font-mono ml-auto">{fmtKey(address)}</span>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function StellarEscrowTalentView({
  campaignId,
  savedStellarWallet,
  talentAmount,
}: Props) {
  const { stellarAddress, isStellarConnected, connectStellar } = useWalletContext();

  const [escrow, setEscrow] = useState<StellarEscrowStatus | null>(null);
  const [loadingEscrow, setLoadingEscrow] = useState(true);
  const [savePhase, setSavePhase] = useState<SavePhase>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [claimPhase, setClaimPhase] = useState<ClaimPhase>("idle");
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [disputeModal, setDisputeModal] = useState(false);

  // Endereço registrado no perfil (começa com o prop, atualizado ao salvar)
  const [registeredWallet, setRegisteredWallet] = useState(savedStellarWallet ?? "");

  const fetchEscrow = useCallback(async () => {
    try {
      const res = await stellarApi.getStatus(campaignId);
      setEscrow(res.data);
    } catch {
      setEscrow(null);
    } finally {
      setLoadingEscrow(false);
    }
  }, [campaignId]);

  // Se o prop não foi passado, busca o perfil para obter wallet_stellar
  useEffect(() => {
    if (savedStellarWallet !== undefined) return;
    creatorApi.getProfile().then((profile) => {
      if (profile?.wallet_stellar) setRegisteredWallet(profile.wallet_stellar);
    }).catch(() => {});
  }, [savedStellarWallet]);

  useEffect(() => {
    fetchEscrow();
  }, [fetchEscrow]);

  // ─── save wallet ────────────────────────────────────────────────────────────

  const handleSaveWallet = async () => {
    if (!stellarAddress) return;
    setSavePhase("saving");
    setSaveError(null);
    try {
      await creatorApi.updateProfile({ wallet_stellar: stellarAddress });
      setRegisteredWallet(stellarAddress);
      setSavePhase("saved");
    } catch {
      setSaveError("Falha ao salvar endereço. Tente novamente.");
      setSavePhase("idle");
    }
  };

  // ─── claim dispute ──────────────────────────────────────────────────────────

  const handleClaim = async () => {
    if (!isStellarConnected) return;
    if (!escrow?.disputeResolutionXDR) return;
    setClaimPhase("signing");
    setClaimError(null);
    setClaimSuccess(null);
    try {
      const signed = await signEscrowXDR(escrow.disputeResolutionXDR);
      setClaimPhase("submitting");
      const res = await stellarApi.claimDispute(campaignId, signed);
      setClaimSuccess(`USDC recebido — TX: ${res.data.transactionHash.slice(0, 16)}…`);
      await fetchEscrow();
    } catch (e: any) {
      if (e.message === "USER_REJECTED") {
        setClaimPhase("idle");
        return;
      }
      setClaimError(e.message || "Falha ao assinar.");
    } finally {
      setClaimPhase("idle");
    }
  };

  // ─── computed ────────────────────────────────────────────────────────────────

  const nowSec = Math.floor(Date.now() / 1000);
  const isExpired = escrow?.deadline ? nowSec > escrow.deadline : false;
  const deadlineStr = escrow?.deadline ? fmtDate(escrow.deadline) : null;
  const hasRegisteredWallet = Boolean(registeredWallet);
  const walletMismatch =
    isStellarConnected &&
    stellarAddress &&
    registeredWallet &&
    stellarAddress.toLowerCase() !== registeredWallet.toLowerCase();

  // ─── loading ──────────────────────────────────────────────────────────────

  if (loadingEscrow) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[var(--color-card)] p-5 space-y-3">
        <div className="h-4 w-32 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-3 w-48 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-16 w-full bg-white/5 rounded-xl animate-pulse mt-2" />
      </div>
    );
  }

  // ─── render ──────────────────────────────────────────────────────────────────

  return (
    <>
    <StellarDisputeModal
      isOpen={disputeModal}
      onClose={() => setDisputeModal(false)}
      onSuccess={fetchEscrow}
      jobId={campaignId}
      initiator="TALENT"
      escrowAmount={escrow?.balance ?? talentAmount}
    />
    <div className="rounded-2xl border border-white/10 bg-[var(--color-card)] overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <StellarLogo />
            <span className="text-sm font-bold text-white tracking-tight">
              Seu Pagamento
            </span>
            {escrow && <StatusBadge status={escrow.status} />}
          </div>
          <p className="text-xs text-[#696E72]">
            USDC · Stellar L1 · Non-custodial
          </p>
        </div>
        <span className="text-[10px] text-amber-500/70 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 mt-0.5">
          TESTNET
        </span>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 space-y-3">

        {/* ── ESTADO 1: Sem escrow, sem wallet registrada ───────────────────── */}
        {!escrow && !hasRegisteredWallet && (
          <div className="space-y-3">
            <p className="text-xs text-[#696E72] leading-relaxed">
              Registre sua wallet Stellar para receber{" "}
              {talentAmount ? (
                <span className="text-white font-semibold">{talentAmount} USDC</span>
              ) : (
                "o pagamento"
              )}{" "}
              desta campanha de forma trustless e instantânea.
            </p>

            {isStellarConnected && stellarAddress ? (
              <div className="space-y-2.5">
                <WalletChip address={stellarAddress} />

                {savePhase === "saved" ? (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
                    <span className="text-emerald-400 text-xs">✓</span>
                    <p className="text-xs text-emerald-400">
                      Endereço registrado com sucesso.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleSaveWallet}
                    disabled={savePhase === "saving"}
                    className="w-full py-2.5 rounded-xl bg-[#ff5800] hover:bg-[#e04f00] active:bg-[#c94600] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {savePhase === "saving" ? (
                      <>
                        <Spinner />
                        Salvando…
                      </>
                    ) : (
                      "Registrar endereço Stellar"
                    )}
                  </button>
                )}

                {saveError && (
                  <p className="text-xs text-red-400">{saveError}</p>
                )}
              </div>
            ) : (
              <button
                onClick={connectStellar}
                className="w-full py-2.5 rounded-xl border border-white/15 hover:border-[#ff5800]/40 hover:bg-[#ff5800]/5 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                <FreighterIcon />
                Conectar Freighter
              </button>
            )}
          </div>
        )}

        {/* ── ESTADO 2: Wallet registrada, sem escrow ainda ────────────────── */}
        {!escrow && hasRegisteredWallet && (
          <div className="space-y-3">
            <div className="bg-[#26485E]/30 rounded-xl px-4 divide-y divide-white/5">
              <Row label="Seu endereço">
                <a
                  href={explorerAccount(registeredWallet)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#ff5800] font-mono hover:underline"
                >
                  {fmtKey(registeredWallet)}
                  <ExternalIcon />
                </a>
              </Row>
              {talentAmount && (
                <Row label="Valor esperado">
                  <span className="font-semibold text-white">{talentAmount} USDC</span>
                </Row>
              )}
            </div>

            <div className="flex items-center gap-2.5 bg-white/3 border border-white/8 rounded-xl px-3 py-2.5">
              <PendingIcon />
              <p className="text-xs text-[#696E72] leading-relaxed">
                Aguardando o Host criar o escrow e depositar os fundos.
              </p>
            </div>

            {/* Alerta de wallet diferente */}
            {walletMismatch && (
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
                <span className="text-amber-400 text-xs mt-0.5 shrink-0">!</span>
                <p className="text-xs text-amber-400 leading-relaxed">
                  O Freighter conectado é diferente do endereço registrado.{" "}
                  <button
                    onClick={handleSaveWallet}
                    disabled={savePhase === "saving"}
                    className="underline hover:no-underline disabled:opacity-50"
                  >
                    {savePhase === "saving" ? "Atualizando…" : "Atualizar para este endereço"}
                  </button>
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── ESTADO 3: Escrow FUNDED / CREATED ────────────────────────────── */}
        {escrow && (escrow.status === "FUNDED" || escrow.status === "CREATED") && (
          <div className="space-y-3">
            <div className="bg-[#26485E]/30 rounded-xl px-4 divide-y divide-white/5">
              <Row label="Bloqueado para você">
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
            </div>

            {!isExpired ? (
              <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
                <LockIcon />
                <p className="text-xs text-emerald-400 leading-relaxed">
                  USDC bloqueado on-chain. Você recebe assim que o Host aprovar sua entrega.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
                <span className="text-amber-400 text-xs shrink-0">!</span>
                <p className="text-xs text-amber-400 leading-relaxed">
                  Deadline expirado. O Host pode solicitar reembolso a qualquer momento.
                </p>
              </div>
            )}

            {/* Dispute CTA — entrega feita, host recusou */}
            <button
              onClick={() => setDisputeModal(true)}
              className="w-full py-2 rounded-xl border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/10 hover:border-red-500/30 transition-all"
            >
              Host recusou minha entrega — Abrir disputa
            </button>
          </div>
        )}

        {/* ── ESTADO 4: COMPLETED ──────────────────────────────────────────── */}
        {escrow?.status === "COMPLETED" && (
          <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 px-4 py-3 space-y-2.5">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5 leading-none">✓</span>
              <div>
                <p className="text-sm font-semibold text-white">Pagamento recebido</p>
                <p className="text-xs text-[#696E72] mt-0.5">
                  {escrow.balance ? `${escrow.balance} USDC` : "USDC"} enviado para sua wallet.
                </p>
              </div>
            </div>
            {escrow.releaseTxHash && (
              <a
                href={explorerTx(escrow.releaseTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-purple-300 hover:text-purple-200 transition-colors"
              >
                Ver no Stellar Expert
                <ExternalIcon />
              </a>
            )}
          </div>
        )}

        {/* ── ESTADO 5: REFUNDED ───────────────────────────────────────────── */}
        {escrow?.status === "REFUNDED" && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5 leading-none">↩</span>
              <div>
                <p className="text-sm font-semibold text-white">Reembolso ao Host</p>
                <p className="text-xs text-[#696E72] mt-0.5">
                  O prazo da campanha expirou e os fundos foram devolvidos.
                </p>
              </div>
            </div>
            {escrow.refundCloseTxHash && (
              <a
                href={explorerTx(escrow.refundCloseTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors"
              >
                Ver no Stellar Expert
                <ExternalIcon />
              </a>
            )}
          </div>
        )}

        {/* ── ESTADO 6: DISPUTED ───────────────────────────────────────────── */}
        {escrow?.status === "DISPUTED" && (
          <div className="space-y-3">
            {/* Sub-estado: arbiter ainda não decidiu */}
            {!escrow.disputeWinner && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 space-y-1">
                <p className="text-sm font-semibold text-white">Disputa em análise</p>
                <p className="text-xs text-[#696E72] leading-relaxed">
                  O árbitro da NIDO está revisando as evidências. Você será notificado com o resultado.
                </p>
                {escrow.disputeReason && (
                  <p className="text-xs text-[#696E72] mt-2 pt-2 border-t border-red-500/10">
                    Motivo: <span className="text-white/70">{escrow.disputeReason}</span>
                  </p>
                )}
              </div>
            )}

            {/* Sub-estado: talent ganhou — precisa assinar para receber */}
            {escrow.disputeWinner === "TALENT" && escrow.disputeResolutionXDR && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 leading-none">🏆</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Você ganhou a disputa</p>
                    <p className="text-xs text-[#696E72] mt-0.5">
                      O árbitro decidiu a seu favor. Assine com o Freighter para receber os USDC.
                    </p>
                  </div>
                </div>

                {claimError && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                    <span className="text-red-400 text-xs shrink-0">✕</span>
                    <p className="text-xs text-red-400">{claimError}</p>
                  </div>
                )}
                {claimSuccess && (
                  <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                    <span className="text-emerald-400 text-xs shrink-0">✓</span>
                    <p className="text-xs text-emerald-400">{claimSuccess}</p>
                  </div>
                )}

                <button
                  onClick={handleClaim}
                  disabled={claimPhase !== "idle" || !isStellarConnected}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {claimPhase === "signing" ? (
                    <><Spinner />Assinar no Freighter…</>
                  ) : claimPhase === "submitting" ? (
                    <><Spinner />Enviando…</>
                  ) : (
                    "Assinar e Receber USDC"
                  )}
                </button>
              </div>
            )}

            {/* Sub-estado: host ganhou */}
            {escrow.disputeWinner === "HOST" && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 space-y-1">
                <p className="text-sm font-semibold text-white">Disputa encerrada</p>
                <p className="text-xs text-[#696E72] leading-relaxed">
                  O árbitro decidiu a favor do Host. Os fundos serão reembolsados ao Host.
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="border-t border-white/5 px-5 py-3 flex items-center justify-between">
        <span className="text-[10px] text-[#696E72]">
          Powered by <span className="text-white/40 font-medium">Stellar L1</span>
        </span>
        <span className="text-[10px] text-[#696E72]">
          Multisig 2-de-3 · Trustless
        </span>
      </div>
    </div>
    </>
  );
}

// ─── icon helpers ─────────────────────────────────────────────────────────────

function PendingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#696E72]">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7v5l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-emerald-400">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 11V7a4 4 0 018 0v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FreighterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-80 shrink-0">
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
