"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  getCreatorsRecurring,
  type AdminCreatorParticipationRow,
  type AdminRecurringCampaignMeta,
  type CampaignTypeFilter,
} from "@/lib/api/admin";

const LIMIT = 20;

function formatHandle(handle: string | undefined) {
  if (!handle?.trim()) return "—";
  return handle.startsWith("@") ? handle : `@${handle}`;
}

function formatDate(iso: string | undefined) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function AdminCreatorsRecurringPage() {
  const [rows, setRows] = useState<AdminCreatorParticipationRow[]>([]);
  const [lastCampaigns, setLastCampaigns] = useState<AdminRecurringCampaignMeta[]>([]);
  const [windowCampaigns, setWindowCampaigns] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [lastNInput, setLastNInput] = useState("5");
  const [lastN, setLastN] = useState(5);
  const [campaignType, setCampaignType] = useState<CampaignTypeFilter>("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCreatorsRecurring({
        page,
        limit: LIMIT,
        search: search.trim() || undefined,
        lastN,
        campaignType,
      });
      setRows(res.creators);
      setLastCampaigns(res.last_campaigns ?? []);
      setWindowCampaigns(res.window_campaigns ?? 0);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e: unknown) {
      setRows([]);
      setLastCampaigns([]);
      setWindowCampaigns(0);
      setTotal(0);
      setTotalPages(0);
      setError(e instanceof Error ? e.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [page, search, lastN, campaignType]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const applyLastN = () => {
    const n = Math.min(50, Math.max(1, parseInt(lastNInput, 10) || 5));
    setLastNInput(String(n));
    setLastN(n);
    setPage(1);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-8 md:px-12 lg:px-14 py-8">
      <div className="mb-6">
        <Link
          href="/admin/creators"
          className="text-sm text-white/50 hover:text-[var(--color-primary)] transition-colors"
        >
          ← Creators
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">Creators recorrentes</h1>
        <p className="text-white/60 mt-1">
          Creators que participaram de todas as últimas N campanhas (por data de criação). Parâmetro{" "}
          <code className="text-white/80">lastN</code> entre 1 e 50 (padrão 5).
        </p>
      </div>

      <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5 space-y-4">
        <div>
          <p className="text-white/80 font-medium text-sm mb-2">Janela de campanhas</p>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="w-28">
              <label className="block text-white/60 text-xs mb-1">Últimas N</label>
              <input
                type="number"
                min={1}
                max={50}
                value={lastNInput}
                onChange={(e) => setLastNInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div className="min-w-[140px]">
              <label className="block text-white/60 text-xs mb-1">Tipo de campanha</label>
              <select
                value={campaignType}
                onChange={(e) => { setCampaignType(e.target.value as CampaignTypeFilter); setPage(1); }}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] [color-scheme:dark] cursor-pointer"
              >
                <option value="all">Todas</option>
                <option value="public">Públicas</option>
                <option value="private">Privadas</option>
              </select>
            </div>
            <button
              type="button"
              onClick={applyLastN}
              className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              Aplicar janela
            </button>
            <span className="text-white/50 text-sm pb-2">
              Em uso: <strong className="text-white/80">{lastN}</strong> · Campanhas na janela:{" "}
              <strong className="text-white/80">{windowCampaigns}</strong>
            </span>
          </div>
        </div>
        {lastCampaigns.length > 0 && (
          <div>
            <p className="text-white/60 text-xs mb-2">Campanhas consideradas (mais recentes)</p>
            <ul className="max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-black/20 divide-y divide-white/5 text-sm">
              {lastCampaigns.map((c) => (
                <li key={c.id} className="px-3 py-2 flex items-center justify-between gap-3 text-white/85">
                  <span className="truncate" title={c.title}>
                    {c.title || c.id}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      c.isPrivate ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"
                    }`}>
                      {c.isPrivate ? "Privada" : "Pública"}
                    </span>
                    <span className="text-white/50 tabular-nums text-sm">{formatDate(c.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[220px] flex-1 max-w-md">
            <label className="block text-white/60 text-xs mb-1">Buscar creator</label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Username ou @twitter"
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            Buscar
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Limpar busca
            </button>
          )}
        </form>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/60">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-white/60">
            {windowCampaigns === 0
              ? "Não há campanhas suficientes para montar a janela."
              : `Nenhum creator participou de todas as ${windowCampaigns} campanha(s) da janela.`}
            {search && " Ajuste a busca."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">ID</th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">Username</th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">Twitter</th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">Ativo</th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm text-right">
                    Na janela
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="px-4 py-3 text-white/70 text-sm font-mono">{r.id}</td>
                    <td className="px-4 py-3 text-white text-sm">{r.username ?? "—"}</td>
                    <td className="px-4 py-3 text-white text-sm">
                      {formatHandle(r.twitter_username)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {r.isActive === false ? (
                        <span className="text-amber-300/90">Inativo</span>
                      ) : (
                        <span className="text-emerald-300/90">Ativo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white font-semibold text-sm text-right tabular-nums">
                      {r.campaigns_participated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && rows.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-white/70 text-sm">
          <span>
            Total: {total.toLocaleString("pt-BR")} · Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-white/20 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 cursor-pointer"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-white/20 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 cursor-pointer"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
