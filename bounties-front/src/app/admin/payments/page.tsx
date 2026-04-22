"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import {
  getPaymentsList,
  type AdminPaymentListItem,
  type PaymentSource,
} from "@/lib/api/admin";

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
  return status;
}

const SOURCE_OPTIONS: { value: "" | PaymentSource; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "Winners", label: "Winners" },
  { value: "Active Campaign", label: "Campanha ativa" },
  { value: "Refunds", label: "Reembolsos" },
  { value: "Plans", label: "Planos" },
];

function hasActiveFilters(
  search: string | undefined,
  status: string | undefined,
  source: string | undefined
) {
  return !!((search ?? "").trim()) || !!status || !!source;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPaymentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "pending" | "confirmed" | "failed" | "error">("");
  const [sourceFilter, setSourceFilter] = useState<"" | PaymentSource>("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [appliedSource, setAppliedSource] = useState("");
  const [detailPayment, setDetailPayment] = useState<AdminPaymentListItem | null>(null);

  type SortKey = "source" | "user_name" | "company_name" | "campaign_name" | "amount" | "created_at" | null;
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

  const fetchPayments = useCallback(() => {
    setLoading(true);
    getPaymentsList({
      page,
      limit: LIMIT,
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
  }, [page, appliedStatus, appliedSearch, appliedSource]);

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

  const closeModal = () => setDetailPayment(null);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-8 md:px-12 lg:px-14 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Pagamentos</h1>
        <p className="text-white/60 mt-1">
          Lista unificada de pagamentos (Winners, Campanha ativa, Reembolsos, Planos). Busque por nome do usuário, empresa, campanha e status.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-white/60 text-sm font-medium">Total</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? "—" : total}
          </p>
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
              placeholder="Usuário, empresa ou campanha..."
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="min-w-[140px]">
            <label className="block text-white/60 text-xs mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter((e.target.value || "") as "" | "pending" | "confirmed" | "failed" | "error")}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] [color-scheme:dark]"
            >
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="failed">Falha</option>
              <option value="error">Erro</option>
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
          {hasActiveFilters(appliedSearch, appliedStatus, appliedSource) && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/60 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
        </form>
        {hasActiveFilters(appliedSearch, appliedStatus, appliedSource) && (
          <p className="text-white/50 text-xs mt-2">
            {total} resultado(s) com filtros aplicados.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/60">Carregando pagamentos...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-white/60">
            Nenhum pagamento encontrado.
            {hasActiveFilters(appliedSearch, appliedStatus, appliedSource) && " Ajuste os filtros."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th 
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('source')}
                  >
                    Origem {sortKey === 'source' && (sortDesc ? '▼' : '▲')}
                  </th>
                  <th 
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('user_name')}
                  >
                    Nome do usuário {sortKey === 'user_name' && (sortDesc ? '▼' : '▲')}
                  </th>
                  <th 
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('company_name')}
                  >
                    Empresa {sortKey === 'company_name' && (sortDesc ? '▼' : '▲')}
                  </th>
                  <th 
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('campaign_name')}
                  >
                    Campanha {sortKey === 'campaign_name' && (sortDesc ? '▼' : '▲')}
                  </th>
                  <th 
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('amount')}
                  >
                    Valor {sortKey === 'amount' && (sortDesc ? '▼' : '▲')}
                  </th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">Status</th>
                  <th 
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('created_at')}
                  >
                    Data {sortKey === 'created_at' && (sortDesc ? '▼' : '▲')}
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
                    <td className="px-4 py-3 text-white/80">
                      {p.user_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      {p.company_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      {p.campaign_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      {formatAmount(p.amount, p.symbol)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          (p.status ?? "").toLowerCase() === "confirmed"
                            ? "text-emerald-400"
                            : (p.status ?? "").toLowerCase() === "pending"
                              ? "text-amber-400"
                              : "text-white/50"
                        }
                      >
                        {formatStatus(p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/80 text-sm">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDetailPayment(p)}
                        className="text-[var(--color-primary)] hover:underline text-sm font-medium cursor-pointer"
                      >
                        Ver detalhes
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
            Mostrando {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} de {total} pagamentos
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors cursor-pointer"
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
              className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors cursor-pointer"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {detailPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={closeModal}
        >
          <div
            className="bg-[var(--color-background)] border border-white/20 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">
                Detalhes do pagamento — {SOURCE_LABEL[detailPayment.source] ?? detailPayment.source}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-white/60 hover:text-white text-2xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-white/50">Origem</dt>
                <dd className="text-white font-medium">{SOURCE_LABEL[detailPayment.source] ?? detailPayment.source}</dd>
              </div>
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
                  <dt className="text-white/50">Nome do usuário</dt>
                  <dd className="text-white">{detailPayment.user_name}</dd>
                </div>
              )}
              {detailPayment.company_name && (
                <div>
                  <dt className="text-white/50">Empresa</dt>
                  <dd className="text-white">{detailPayment.company_name}</dd>
                </div>
              )}
              {detailPayment.campaign_name && (
                <div>
                  <dt className="text-white/50">Campanha</dt>
                  <dd className="text-white">{detailPayment.campaign_name}</dd>
                </div>
              )}
              {detailPayment.userId && (
                <div>
                  <dt className="text-white/50">ID do usuário</dt>
                  <dd className="text-white font-mono break-all">{detailPayment.userId}</dd>
                </div>
              )}
              {(detailPayment.user_id ?? detailPayment.userId) && (
                <div>
                  <dt className="text-white/50">User ID</dt>
                  <dd className="text-white font-mono break-all">{detailPayment.user_id ?? detailPayment.userId}</dd>
                </div>
              )}
              {(detailPayment.campaignId ?? detailPayment.campaign_id) && (
                <div>
                  <dt className="text-white/50">ID da campanha</dt>
                  <dd className="text-white font-mono break-all">{detailPayment.campaignId ?? detailPayment.campaign_id}</dd>
                </div>
              )}
              {detailPayment.hostId && (
                <div>
                  <dt className="text-white/50">ID do host</dt>
                  <dd className="text-white font-mono break-all">{detailPayment.hostId}</dd>
                </div>
              )}
              {detailPayment.to && (
                <div>
                  <dt className="text-white/50">Destino (to)</dt>
                  <dd className="text-white font-mono break-all text-xs">{detailPayment.to}</dd>
                </div>
              )}
              {detailPayment.walletAddressHost && (
                <div>
                  <dt className="text-white/50">Wallet host</dt>
                  <dd className="text-white font-mono break-all text-xs">{detailPayment.walletAddressHost}</dd>
                </div>
              )}
              {detailPayment.chain && (
                <div>
                  <dt className="text-white/50">Chain</dt>
                  <dd className="text-white">{detailPayment.chain}</dd>
                </div>
              )}
              {detailPayment.symbol && (
                <div>
                  <dt className="text-white/50">Símbolo</dt>
                  <dd className="text-white">{detailPayment.symbol}</dd>
                </div>
              )}
              {detailPayment.plan_id && (
                <div>
                  <dt className="text-white/50">ID do plano</dt>
                  <dd className="text-white font-mono break-all">{detailPayment.plan_id}</dd>
                </div>
              )}
              {detailPayment.signature && (
                <div>
                  <dt className="text-white/50">Assinatura</dt>
                  <dd className="text-white font-mono break-all text-xs">{detailPayment.signature}</dd>
                </div>
              )}
            </dl>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeModal}
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
