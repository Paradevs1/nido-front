"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCreatorsList, setUserActive, type AdminCreatorListItem } from "@/lib/api/admin";
import CustomSelect from "@/components/ui/CustomSelect";

type ListSortOption =
  | "none"
  | "followers_asc"
  | "followers_desc"
  | "earnings_asc"
  | "earnings_desc";

function listSortToApiParams(sort: ListSortOption): {
  sortBy?: "followers" | "earnings";
  sortOrder?: "asc" | "desc";
} {
  switch (sort) {
    case "followers_asc":
      return { sortBy: "followers", sortOrder: "asc" };
    case "followers_desc":
      return { sortBy: "followers", sortOrder: "desc" };
    case "earnings_asc":
      return { sortBy: "earnings", sortOrder: "asc" };
    case "earnings_desc":
      return { sortBy: "earnings", sortOrder: "desc" };
    default:
      return {};
  }
}

const LIMIT = 20;
const FILTER_FETCH_LIMIT = 500;

const LIST_SORT_OPTIONS: { value: ListSortOption; label: string }[] = [
  { value: "none", label: "Nenhuma ordenação" },
  { value: "followers_asc", label: "Seguidores (crescente)" },
  { value: "followers_desc", label: "Seguidores (decrescente)" },
  { value: "earnings_asc", label: "Ganhos total (crescente)" },
  { value: "earnings_desc", label: "Ganhos total (decrescente)" },
];

function formatWallet(wallet: string | undefined) {
  if (!wallet) return "—";
  if (wallet.length <= 12) return wallet;
  return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
}

function formatNumber(n: number | undefined) {
  if (n === undefined || n === null) return "—";
  return n.toLocaleString("pt-BR");
}

function applyFilters(
  list: AdminCreatorListItem[],
  filters: {
    minFollowers: string;
    maxFollowers: string;
    minEarnings: string;
    maxEarnings: string;
    walletContains: string;
  }
): AdminCreatorListItem[] {
  let result = list;
  const minF = filters.minFollowers.trim() ? Number(filters.minFollowers) : undefined;
  const maxF = filters.maxFollowers.trim() ? Number(filters.maxFollowers) : undefined;
  const minE = filters.minEarnings.trim() ? Number(filters.minEarnings) : undefined;
  const maxE = filters.maxEarnings.trim() ? Number(filters.maxEarnings) : undefined;
  const wallet = filters.walletContains.trim().toLowerCase();

  if (minF !== undefined) result = result.filter((c) => (c.twitter_followers_count ?? 0) >= minF);
  if (maxF !== undefined) result = result.filter((c) => (c.twitter_followers_count ?? 0) <= maxF);
  if (minE !== undefined) result = result.filter((c) => (c.total_earnings ?? 0) >= minE);
  if (maxE !== undefined) result = result.filter((c) => (c.total_earnings ?? 0) <= maxE);
  if (wallet) {
    result = result.filter((c) => {
      const evm = (c.wallet_evm ?? "").toLowerCase();
      const sui = (c.wallet_sui ?? "").toLowerCase();
      const sol = (c.wallet_sol ?? "").toLowerCase();
      return evm.includes(wallet) || sui.includes(wallet) || sol.includes(wallet);
    });
  }
  return result;
}

function hasActiveFilters(f: {
  minFollowers: string;
  maxFollowers: string;
  minEarnings: string;
  maxEarnings: string;
  walletContains: string;
}) {
  return !!(
    f.minFollowers.trim() ||
    f.maxFollowers.trim() ||
    f.minEarnings.trim() ||
    f.maxEarnings.trim() ||
    f.walletContains.trim()
  );
}

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<AdminCreatorListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [detailCreator, setDetailCreator] = useState<AdminCreatorListItem | null>(null);
  const [filters, setFilters] = useState({
    minFollowers: "",
    maxFollowers: "",
    minEarnings: "",
    maxEarnings: "",
    walletContains: "",
  });
  const [rawListForFilter, setRawListForFilter] = useState<AdminCreatorListItem[]>([]);
  const [filterMode, setFilterMode] = useState(false);
  const [activeUpdatingId, setActiveUpdatingId] = useState<string | null>(null);
  const [listSort, setListSort] = useState<ListSortOption>("none");
  const skipNextFilterSortEffectRef = useRef(false);

  const filteredList = useMemo(() => {
    return filterMode ? applyFilters(rawListForFilter, filters) : [...creators];
  }, [filterMode, rawListForFilter, creators, filters]);

  const filteredTotal = filterMode ? filteredList.length : total;
  const filteredTotalPages = filterMode ? Math.max(1, Math.ceil(filteredList.length / LIMIT)) : totalPages;
  const paginatedFiltered = useMemo(
    () => filterMode ? filteredList.slice((page - 1) * LIMIT, page * LIMIT) : filteredList,
    [filteredList, page, filterMode]
  );
  const displayCreators = paginatedFiltered;
  const displayTotal = filteredTotal;
  const displayTotalPages = filteredTotalPages;

  const fetchCreators = useCallback(
    async (opts?: { useFilterLimit?: boolean }) => {
      setLoading(true);
      const limit = opts?.useFilterLimit ? FILTER_FETCH_LIMIT : LIMIT;
      const targetPage = opts?.useFilterLimit ? 1 : page;
      try {
        const res = await getCreatorsList({
          page: targetPage,
          limit,
          search: search.trim() || undefined,
          ...listSortToApiParams(listSort),
        });
        if (opts?.useFilterLimit) {
          setRawListForFilter(res.creators);
          setFilterMode(true);
          setPage(1);
        } else {
          setCreators(res.creators);
          setTotal(res.total);
          setTotalPages(res.totalPages);
          setFilterMode(false);
        }
      } catch {
        setCreators([]);
        setTotal(0);
        setTotalPages(0);
        setRawListForFilter([]);
        setFilterMode(false);
      } finally {
        setLoading(false);
      }
    },
    [page, search, listSort]
  );

  useEffect(() => {
    if (!filterMode) fetchCreators({ useFilterLimit: false });
  }, [filterMode, page, search, listSort, fetchCreators]);

  useEffect(() => {
    if (!filterMode || !hasActiveFilters(filters)) return;
    if (skipNextFilterSortEffectRef.current) {
      skipNextFilterSortEffectRef.current = false;
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCreatorsList({
      page: 1,
      limit: FILTER_FETCH_LIMIT,
      search: search.trim() || undefined,
      ...listSortToApiParams(listSort),
    })
      .then((res) => {
        if (!cancelled) {
          setRawListForFilter(res.creators);
          setPage(1);
        }
      })
      .catch(() => {
        if (!cancelled) setRawListForFilter([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filterMode, listSort, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const applyFiltersClick = () => {
    if (!hasActiveFilters(filters)) return;
    skipNextFilterSortEffectRef.current = true;
    setLoading(true);
    getCreatorsList({
      page: 1,
      limit: FILTER_FETCH_LIMIT,
      search: search.trim() || undefined,
      ...listSortToApiParams(listSort),
    })
      .then((res) => {
        setRawListForFilter(res.creators);
        setFilterMode(true);
        setPage(1);
      })
      .catch(() => {
        setRawListForFilter([]);
        setFilterMode(false);
      })
      .finally(() => setLoading(false));
  };

  const clearFilters = () => {
    setFilters({
      minFollowers: "",
      maxFollowers: "",
      minEarnings: "",
      maxEarnings: "",
      walletContains: "",
    });
    setFilterMode(false);
    setPage(1);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-8 md:px-12 lg:px-14 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Creators</h1>
        <p className="text-white/60 mt-1">
          Listagem e gestão de creators. Busca por username ou twitter_username.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-white/60 text-sm font-medium">Total de creators</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? "—" : displayTotal}
          </p>
        </div>
      </div>

      {/* Filtros: busca + seguidores, ganhos, wallet */}
      <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5">
        <p className="text-white/80 font-medium text-sm mb-3">Filtros</p>
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[220px]">
            <label htmlFor="admin-creators-sort" className="block text-white/60 text-xs mb-1">
              Ordenar por (lista global)
            </label>
            <CustomSelect
              id="admin-creators-sort"
              options={LIST_SORT_OPTIONS}
              value={listSort}
              onChange={(v) => {
                const next = (Array.isArray(v) ? v[0] : v) as ListSortOption;
                setListSort(next);
                setPage(1);
              }}
              placeholder="Ordenar"
              triggerClassName="rounded-lg px-3 py-2 min-h-[42px] border-white/20 bg-white/10 text-sm text-white hover:border-white/35"
              menuClassName="max-h-72"
            />
          </div>
          <div className="min-w-[200px]">
            <label className="block text-white/60 text-xs mb-1">Buscar por username ou @</label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ex: @twitter..."
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
          <div>
            <label className="block text-white/60 text-xs mb-1">Seguidores (mín)</label>
            <input
              type="number"
              min={0}
              value={filters.minFollowers}
              onChange={(e) => setFilters((f) => ({ ...f, minFollowers: e.target.value }))}
              placeholder="0"
              className="w-28 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1">Seguidores (máx)</label>
            <input
              type="number"
              min={0}
              value={filters.maxFollowers}
              onChange={(e) => setFilters((f) => ({ ...f, maxFollowers: e.target.value }))}
              placeholder="—"
              className="w-28 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1">Ganhos total (mín)</label>
            <input
              type="number"
              min={0}
              value={filters.minEarnings}
              onChange={(e) => setFilters((f) => ({ ...f, minEarnings: e.target.value }))}
              placeholder="0"
              className="w-28 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1">Ganhos total (máx)</label>
            <input
              type="number"
              min={0}
              value={filters.maxEarnings}
              onChange={(e) => setFilters((f) => ({ ...f, maxEarnings: e.target.value }))}
              placeholder="—"
              className="w-28 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="min-w-[200px]">
            <label className="block text-white/60 text-xs mb-1">Wallet (qualquer caractere)</label>
            <input
              type="text"
              value={filters.walletContains}
              onChange={(e) => setFilters((f) => ({ ...f, walletContains: e.target.value }))}
              placeholder="Ex: F46"
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono"
            />
          </div>
          <button
            type="button"
            onClick={applyFiltersClick}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 transition-colors"
          >
            Aplicar filtros
          </button>
          {hasActiveFilters(filters) && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/60 hover:bg-white/10 transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </form>
        {filterMode && (
          <p className="text-white/50 text-xs mt-2">
            Exibindo até {FILTER_FETCH_LIMIT} creators com filtros aplicados ({filteredTotal} resultado(s)).
          </p>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/60">
            Carregando creators...
          </div>
        ) : displayCreators.length === 0 ? (
          <div className="p-12 text-center text-white/60">
            Nenhum creator encontrado.
            {(search || hasActiveFilters(filters)) && " Ajuste busca ou filtros."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">
                    Twitter / @
                  </th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">
                    Seguidores
                  </th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">
                    Ganhos total
                  </th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">
                    Wallet EVM
                  </th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">
                    Wallet SUI
                  </th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">
                    Wallet SOL
                  </th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayCreators.map((c, i) => (
                  <tr
                    key={c.twitter_username ? `${c.twitter_username}-${i}` : i}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">
                      {c.twitter_username ? `@${c.twitter_username}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      {formatNumber(c.twitter_followers_count)}
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      {formatNumber(c.total_earnings)}
                    </td>
                    <td className="px-4 py-3 text-white/70 text-sm font-mono">
                      {formatWallet(c.wallet_evm)}
                    </td>
                    <td className="px-4 py-3 text-white/70 text-sm font-mono">
                      {formatWallet(c.wallet_sui)}
                    </td>
                    <td className="px-4 py-3 text-white/70 text-sm font-mono">
                      {formatWallet(c.wallet_sol)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDetailCreator(c)}
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

      {!loading && displayTotalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-white/60 text-sm">
            Mostrando {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, displayTotal)} de{" "}
            {displayTotal} creators
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 text-white/80 text-sm">
              Página {page} de {displayTotalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(displayTotalPages, p + 1))}
              disabled={page >= displayTotalPages}
              className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Modal detalhes */}
      {detailCreator && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 cursor-pointer"
          onClick={() => setDetailCreator(null)}
        >
          <div
            className="bg-[var(--color-background)] border border-white/20 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">
                {detailCreator.twitter_username ? `@${detailCreator.twitter_username}` : "Detalhes do creator"}
              </h2>
              <button
                type="button"
                onClick={() => setDetailCreator(null)}
                className="text-white/60 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-white/50">Twitter</dt>
                <dd className="text-white font-medium">
                  {detailCreator.twitter_username ? `@${detailCreator.twitter_username}` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-white/50">Seguidores</dt>
                <dd className="text-white">{formatNumber(detailCreator.twitter_followers_count)}</dd>
              </div>
              <div>
                <dt className="text-white/50">Ganhos total</dt>
                <dd className="text-white">{formatNumber(detailCreator.total_earnings)}</dd>
              </div>
              <div>
                <dt className="text-white/50">Wallet EVM</dt>
                <dd className="text-white font-mono break-all">
                  {detailCreator.wallet_evm || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-white/50">Wallet SUI</dt>
                <dd className="text-white font-mono break-all">
                  {detailCreator.wallet_sui || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-white/50">Wallet SOL</dt>
                <dd className="text-white font-mono break-all">
                  {detailCreator.wallet_sol || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-white/50">Ativo</dt>
                <dd className="flex items-center gap-3 flex-wrap">
                  {detailCreator.id ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={detailCreator.isActive !== false}
                      disabled={activeUpdatingId === detailCreator.id}
                      onClick={() => {
                        if (!detailCreator.id) return;
                        const creatorId = detailCreator.id;
                        const newActive = detailCreator.isActive === false;
                        setActiveUpdatingId(creatorId);
                        setUserActive(creatorId, newActive)
                          .then(() => {
                            setDetailCreator((c) => (c && c.id === creatorId ? { ...c, isActive: newActive } : c));
                            setCreators((prev) => prev.map((x) => (x.id === creatorId ? { ...x, isActive: newActive } : x)));
                            setRawListForFilter((prev) => prev.map((x) => (x.id === creatorId ? { ...x, isActive: newActive } : x)));
                          })
                          .finally(() => setActiveUpdatingId(null));
                      }}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-50 ${detailCreator.isActive !== false ? "bg-emerald-500" : "bg-white/20"}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${detailCreator.isActive !== false ? "translate-x-6" : "translate-x-1"}`}
                      />
                      <span className="sr-only">{detailCreator.isActive !== false ? "Ativo" : "Inativo"}</span>
                    </button>
                  ) : null}
                  <span className={detailCreator.isActive !== false ? "text-emerald-400" : "text-white/50"}>
                    {activeUpdatingId === detailCreator.id ? "..." : detailCreator.isActive !== false ? "Ativo" : "Inativo"}
                  </span>
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailCreator(null)}
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
