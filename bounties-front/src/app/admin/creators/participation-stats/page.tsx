"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  getCreatorsParticipationStats,
  type AdminCreatorParticipationRow,
} from "@/lib/api/admin";

const LIMIT = 20;

function formatHandle(handle: string | undefined) {
  if (!handle?.trim()) return "—";
  return handle.startsWith("@") ? handle : `@${handle}`;
}

export default function AdminCreatorsParticipationStatsPage() {
  const [rows, setRows] = useState<AdminCreatorParticipationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCreatorsParticipationStats({
        page,
        limit: LIMIT,
        search: search.trim() || undefined,
      });
      setRows(res.creators);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e: unknown) {
      setRows([]);
      setTotal(0);
      setTotalPages(0);
      setError(e instanceof Error ? e.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
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
        <h1 className="text-2xl font-bold text-white mt-2">Participação em campanhas</h1>
        <p className="text-white/60 mt-1">
          Creators com quantidade de campanhas em que participaram (submissões aprovadas). Busca por
          username ou Twitter.
        </p>
      </div>

      <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[220px] flex-1 max-w-md">
            <label className="block text-white/60 text-xs mb-1">Buscar</label>
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
            Nenhum creator encontrado.{search && " Ajuste a busca."}
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
                    Campanhas
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
