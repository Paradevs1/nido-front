"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getCampaignsCombo,
  getPaymentsList,
  type AdminPaymentListItem,
  type PaymentSource,
} from "@/lib/api/admin";
import { getTxExplorerUrl } from "@/utils/blockExplorer";

const LIMIT = 20;

const SOURCE_LABEL: Record<PaymentSource, string> = {
  Winners: "Winners",
  "Active Campaign": "Campanha ativa",
  Refunds: "Reembolsos",
  Plans: "Planos",
};

function formatDate(iso: string | undefined) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatAmount(amount: number | undefined, symbol?: string) {
  if (amount === undefined || amount === null) return "—";
  const n = amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return symbol ? `${n} ${symbol}` : n;
}

function formatStatus(status: string | undefined) {
  if (!status) return "—";
  const s = status.toLowerCase();
  if (s === "pending") return "Pendente";
  if (s === "confirmed") return "Confirmado";
  if (s === "failed" || s === "error") return "Falha";
  if (s === "cancelled" || s === "canceled") return "Cancelado";
  return status;
}

const SOURCE_OPTIONS: { value: "" | PaymentSource; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "Winners", label: "Winners" },
  { value: "Active Campaign", label: "Campanha ativa" },
  { value: "Refunds", label: "Reembolsos" },
  { value: "Plans", label: "Planos" },
];

function pickString(p: AdminPaymentListItem, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = p[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

export default function AdminCampaignPaymentsDetailPage() {
  const params = useParams();
  const rawId = params?.campaignId;
  const campaignId = typeof rawId === "string" ? decodeURIComponent(rawId) : Array.isArray(rawId) ? decodeURIComponent(rawId[0]) : "";

  const [campaignTitle, setCampaignTitle] = useState<string>("");
  const [payments, setPayments] = useState<AdminPaymentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [metaLoading, setMetaLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "pending" | "confirmed" | "failed" | "error" | "cancelled" | "canceled">("");
  const [sourceFilter, setSourceFilter] = useState<"" | PaymentSource>("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [appliedSource, setAppliedSource] = useState("");
  const [detailPayment, setDetailPayment] = useState<AdminPaymentListItem | null>(null);

  useEffect(() => {
    if (!campaignId) {
      setMetaLoading(false);
      return;
    }
    getCampaignsCombo()
      .then((list) => {
        const found = list.find((c) => c.id === campaignId);
        setCampaignTitle(found?.name?.trim() || "");
      })
      .catch(() => setCampaignTitle(""))
      .finally(() => setMetaLoading(false));
  }, [campaignId]);

  const fetchPayments = useCallback(() => {
    if (!campaignId) return;
    setLoading(true);
    getPaymentsList({
      page,
      limit: LIMIT,
      campaignId,
      status: appliedStatus.trim() || undefined,
      search: appliedSearch.trim() || undefined,
      source: appliedSource.trim() || undefined,
    })
      .then((res) => {
        setPayments(res.payments);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(() => {
        setPayments([]);
        setTotal(0);
        setTotalPages(0);
      })
      .finally(() => setLoading(false));
  }, [campaignId, page, appliedStatus, appliedSearch, appliedSource]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setAppliedStatus(statusFilter);
    setAppliedSource(sourceFilter);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setStatusFilter("");
    setSourceFilter("");
    setAppliedSearch("");
    setAppliedStatus("");
    setAppliedSource("");
    setPage(1);
  };

  const hasFilters = !!(appliedSearch.trim() || appliedStatus || appliedSource);

  type SortKey = "source" | "user_name" | "amount" | "created_at" | "status" | null;
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDesc, setSortDesc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDesc) {
        setSortKey(null);
        setSortDesc(false);
      } else {
        setSortDesc(true);
      }
    } else {
      setSortKey(key);
      setSortDesc(false);
    }
  };

  const sortedPayments = useMemo(() => {
    let result = [...payments];
    if (sortKey) {
      result.sort((a, b) => {
        let valA = a[sortKey as keyof AdminPaymentListItem];
        let valB = b[sortKey as keyof AdminPaymentListItem];
        if (typeof valA === "string" && typeof valB === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA === undefined || valA === null) return sortDesc ? 1 : -1;
        if (valB === undefined || valB === null) return sortDesc ? -1 : 1;
        if (valA < valB) return sortDesc ? 1 : -1;
        if (valA > valB) return sortDesc ? -1 : 1;
        return 0;
      });
    }
    return result;
  }, [payments, sortKey, sortDesc]);

  const explorerForDetail = useMemo(() => {
    if (!detailPayment) return null;
    const chain = pickString(detailPayment, ["chain", "payment_chain"]);
    const sig = pickString(detailPayment, ["signature", "tx_hash", "transaction_hash"]);
    return getTxExplorerUrl(chain, sig);
  }, [detailPayment]);

  const receiptUrl = detailPayment ? pickString(detailPayment, ["receipt_url", "proof_url", "comprovante_url"]) : undefined;

  if (!campaignId) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-8 py-8">
        <p className="text-white/60">Campanha inválida.</p>
        <Link href="/admin/payments/campaigns" className="text-[var(--color-primary)] mt-4 inline-block">
          ← Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-8 md:px-12 lg:px-14 py-8">
      <Link
        href="/admin/payments/campaigns"
        className="text-[var(--color-primary)] text-sm font-medium hover:underline mb-4 inline-block"
      >
        ← Pagamentos por campanha
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white break-words">
          {metaLoading ? "Carregando…" : campaignTitle || "Campanha"}
        </h1>
        <p className="text-white/50 text-xs font-mono mt-1 break-all">ID: {campaignId}</p>
        <p className="text-white/60 mt-2">
          Pagamentos vinculados a esta campanha. Use busca e filtros para localizar criadores, status ou origem.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-white/60 text-sm font-medium">Pagamentos (total)</p>
          <p className="text-2xl font-bold text-white mt-1">{loading ? "—" : total}</p>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5">
        <p className="text-white/80 font-medium text-sm mb-3">Filtros</p>
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[280px] flex-1">
            <label className="block text-white/60 text-xs mb-1">Pesquisar</label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Usuário, empresa…"
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="min-w-[140px]">
            <label className="block text-white/60 text-xs mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  (e.target.value || "") as "" | "pending" | "confirmed" | "failed" | "error" | "cancelled" | "canceled"
                )
              }
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] [color-scheme:dark]"
            >
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="failed">Falha</option>
              <option value="error">Erro</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="block text-white/60 text-xs mb-1">Origem</label>
            <select
              value={sourceFilter}
              onChange={(e) => {
                const v = (e.target.value || "") as "" | PaymentSource;
                setSourceFilter(v);
                setAppliedSource(v);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] [color-scheme:dark]"
            >
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            Buscar
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/60 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
        </form>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/60">Carregando pagamentos...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-white/60">
            Nenhum pagamento encontrado para esta campanha.
            {hasFilters && " Ajuste os filtros."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort("source")}
                  >
                    Origem {sortKey === "source" && (sortDesc ? "▼" : "▲")}
                  </th>
                  <th
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort("user_name")}
                  >
                    Criador / usuário {sortKey === "user_name" && (sortDesc ? "▼" : "▲")}
                  </th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">Empresa</th>
                  <th
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort("amount")}
                  >
                    Valor {sortKey === "amount" && (sortDesc ? "▼" : "▲")}
                  </th>
                  <th
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort("status")}
                  >
                    Status {sortKey === "status" && (sortDesc ? "▼" : "▲")}
                  </th>
                  <th
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort("created_at")}
                  >
                    Data {sortKey === "created_at" && (sortDesc ? "▼" : "▲")}
                  </th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedPayments.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">
                      {SOURCE_LABEL[p.source] ?? p.source}
                    </td>
                    <td className="px-4 py-3 text-white/80">{p.user_name ?? "—"}</td>
                    <td className="px-4 py-3 text-white/80">{p.company_name ?? "—"}</td>
                    <td className="px-4 py-3 text-white/80">{formatAmount(p.amount, p.symbol)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          (p.status ?? "").toLowerCase() === "confirmed"
                            ? "text-emerald-400"
                            : (p.status ?? "").toLowerCase() === "pending"
                              ? "text-amber-400"
                              : ["cancelled", "canceled"].includes((p.status ?? "").toLowerCase())
                                ? "text-white/50 line-through"
                                : "text-red-300/90"
                        }
                      >
                        {formatStatus(p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/80 text-sm">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDetailPayment(p)}
                        className="text-[var(--color-primary)] hover:underline text-sm font-medium cursor-pointer"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-white/60 text-sm">
            Mostrando {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} de {total}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 disabled:opacity-50 cursor-pointer hover:bg-white/10"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 text-white/80 text-sm">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 disabled:opacity-50 cursor-pointer hover:bg-white/10"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {detailPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setDetailPayment(null)}
        >
          <div
            className="bg-[var(--color-background)] border border-white/20 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4 gap-2">
              <h2 className="text-xl font-bold text-white">
                Pagamento — {SOURCE_LABEL[detailPayment.source] ?? detailPayment.source}
              </h2>
              <button
                type="button"
                onClick={() => setDetailPayment(null)}
                className="text-white/60 hover:text-white text-2xl leading-none cursor-pointer shrink-0"
              >
                ×
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-white/50">Status</dt>
                <dd className="text-white">{formatStatus(detailPayment.status)}</dd>
              </div>
              <div>
                <dt className="text-white/50">Valor</dt>
                <dd className="text-white">{formatAmount(detailPayment.amount, detailPayment.symbol)}</dd>
              </div>
              <div>
                <dt className="text-white/50">Data</dt>
                <dd className="text-white">{formatDate(detailPayment.created_at)}</dd>
              </div>
              {detailPayment.user_name && (
                <div>
                  <dt className="text-white/50">Criador / usuário</dt>
                  <dd className="text-white">{detailPayment.user_name}</dd>
                </div>
              )}
              {detailPayment.company_name && (
                <div>
                  <dt className="text-white/50">Empresa</dt>
                  <dd className="text-white">{detailPayment.company_name}</dd>
                </div>
              )}
              {(detailPayment.campaign_name || campaignTitle) && (
                <div>
                  <dt className="text-white/50">Campanha</dt>
                  <dd className="text-white">{detailPayment.campaign_name ?? campaignTitle}</dd>
                </div>
              )}
              {typeof detailPayment.tax === "string" && detailPayment.tax.trim() && (
                <div>
                  <dt className="text-white/50">TX / comprovante (tax)</dt>
                  <dd className="text-white font-mono text-xs break-all">{detailPayment.tax}</dd>
                </div>
              )}
              {detailPayment.signature && (
                <div>
                  <dt className="text-white/50">Assinatura / hash</dt>
                  <dd className="text-white font-mono text-xs break-all">{detailPayment.signature}</dd>
                </div>
              )}
              {explorerForDetail && (
                <div>
                  <dt className="text-white/50">Ver na blockchain</dt>
                  <dd>
                    <a
                      href={explorerForDetail}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-primary)] hover:underline break-all"
                    >
                      Abrir explorador
                    </a>
                  </dd>
                </div>
              )}
              {receiptUrl && (
                <div>
                  <dt className="text-white/50">Comprovante (URL)</dt>
                  <dd>
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-primary)] hover:underline break-all"
                    >
                      {receiptUrl}
                    </a>
                  </dd>
                </div>
              )}
              {detailPayment.chain && (
                <div>
                  <dt className="text-white/50">Rede</dt>
                  <dd className="text-white">{detailPayment.chain}</dd>
                </div>
              )}
              {detailPayment.to && (
                <div>
                  <dt className="text-white/50">Destino (to)</dt>
                  <dd className="text-white font-mono break-all text-xs">{detailPayment.to}</dd>
                </div>
              )}
            </dl>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailPayment(null)}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
