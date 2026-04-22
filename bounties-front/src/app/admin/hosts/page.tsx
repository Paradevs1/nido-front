"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getHostsList,
  getHostsCounts,
  getHostsOptions,
  getPlansList,
  updateHostPlan,
  updateHostAccountStatus,
  type AdminHostListItem,
  type PlanOption,
} from "@/lib/api/admin";

const LIMIT = 20;
const FILTER_FETCH_LIMIT = 500;

function formatDate(iso: string | undefined | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "—";
  }
}

function formatPlanName(planName: string | undefined): string {
  if (planName == null || String(planName).trim() === "") return "Free";
  const p = planName.trim().toUpperCase();
  if (p === "CORE") return "Core";
  if (p === "ENTERPRISE") return "Enterprise";
  if (p === "BASIC") return "Free";
  return planName.trim();
}

function applyClientFilters(
  list: AdminHostListItem[],
  filters: { planFilter: string; minCampaigns: string; maxCampaigns: string }
): AdminHostListItem[] {
  let result = list;
  const plan = filters.planFilter.trim();
  const minC = filters.minCampaigns.trim() ? Number(filters.minCampaigns) : undefined;
  const maxC = filters.maxCampaigns.trim() ? Number(filters.maxCampaigns) : undefined;

  if (plan === "CORE") result = result.filter((h) => (h.plan_name ?? "").toUpperCase() === "CORE");
  if (plan === "ENTERPRISE") result = result.filter((h) => (h.plan_name ?? "").toUpperCase() === "ENTERPRISE");
  if (plan === "FREE")
    result = result.filter((h) => {
      const p = (h.plan_name ?? "").trim().toUpperCase();
      return p === "" || (p !== "CORE" && p !== "ENTERPRISE");
    });

  if (minC !== undefined) result = result.filter((h) => (h.campaigns_created ?? 0) >= minC);
  if (maxC !== undefined) result = result.filter((h) => (h.campaigns_created ?? 0) <= maxC);
  return result;
}

function hasClientFilters(f: { planFilter: string; minCampaigns: string; maxCampaigns: string }) {
  return !!(f.planFilter.trim() || f.minCampaigns.trim() || f.maxCampaigns.trim());
}

/** Status de aprovação da conta host (JWT / pending-activation). */
function hostAccountStatusLabel(h: AdminHostListItem): "active" | "inactive" {
  return h.accountStatus === "inactive" ? "inactive" : "active";
}

export default function AdminHostsPage() {
  const [hosts, setHosts] = useState<AdminHostListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [accountStatusFilter, setAccountStatusFilter] = useState<"" | "active" | "inactive">("");
  const [detailHost, setDetailHost] = useState<AdminHostListItem | null>(null);
  const [planFilter, setPlanFilter] = useState<"" | "CORE" | "ENTERPRISE" | "FREE">("");
  const [minCampaigns, setMinCampaigns] = useState("");
  const [maxCampaigns, setMaxCampaigns] = useState("");
  const [rawListForFilter, setRawListForFilter] = useState<AdminHostListItem[]>([]);
  const [filterMode, setFilterMode] = useState(false);
  const [hostsCounts, setHostsCounts] = useState<{ total: number; active: number; inactive: number } | null>(null);
  const [countsLoading, setCountsLoading] = useState(true);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [planUpdatingId, setPlanUpdatingId] = useState<string | null>(null);
  const [planUpdateError, setPlanUpdateError] = useState<string | null>(null);
  const [accountStatusUpdatingId, setAccountStatusUpdatingId] = useState<string | null>(null);
  const [accountStatusError, setAccountStatusError] = useState<string | null>(null);
  const [hostOptions, setHostOptions] = useState<Array<{ host_id: string; name_company?: string }>>([]);
  const hostOptionsRef = useRef(hostOptions);
  hostOptionsRef.current = hostOptions;

  function enrichHostsWithId(
    list: AdminHostListItem[],
    options: Array<{ host_id: string; name_company?: string }>
  ): AdminHostListItem[] {
    const byCompany: Record<string, string[]> = {};
    options.forEach((o) => {
      const k = o.name_company ?? "";
      if (!byCompany[k]) byCompany[k] = [];
      byCompany[k].push(o.host_id);
    });
    return list.map((h) => {
      if (h.id) return h;
      const key = h.name_company ?? "";
      const ids = byCompany[key];
      const id = ids?.length ? ids.shift() : undefined;
      return id ? { ...h, id } : h;
    });
  }

  const planIdByDisplayName = useMemo(() => {
    const m: Record<string, string> = {};
    plans.forEach((p) => {
      if (p.name === "BASIC") m["Free"] = p.id;
      if (p.name === "CORE") m["Core"] = p.id;
      if (p.name === "ENTERPRISE") m["Enterprise"] = p.id;
    });
    return m;
  }, [plans]);

  type SortKey = "name_company" | "email" | "campaigns_created" | "plan_name" | "duration_plan" | null;
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

  const filteredList = useMemo(() => {
    let result = filterMode
      ? applyClientFilters(rawListForFilter, { planFilter, minCampaigns, maxCampaigns })
      : [...hosts];

    if (sortKey) {
      result.sort((a, b) => {
        let valA = a[sortKey as keyof AdminHostListItem];
        let valB = b[sortKey as keyof AdminHostListItem];

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
  }, [filterMode, rawListForFilter, planFilter, minCampaigns, maxCampaigns, hosts, sortKey, sortDesc]);

  const filteredTotal = filterMode ? filteredList.length : total;
  const filteredTotalPages = filterMode ? Math.max(1, Math.ceil(filteredList.length / LIMIT)) : totalPages;
  const paginatedFiltered = useMemo(
    () => filterMode ? filteredList.slice((page - 1) * LIMIT, page * LIMIT) : filteredList,
    [filteredList, page, filterMode]
  );
  const displayHosts = paginatedFiltered;
  const displayTotal = filteredTotal;
  const displayTotalPages = filteredTotalPages;

  const fetchHosts = useCallback(async () => {
    setLoading(true);
    try {
      const accountStatus =
        accountStatusFilter === "active" || accountStatusFilter === "inactive"
          ? accountStatusFilter
          : undefined;
      const res = await getHostsList({
        page,
        limit: LIMIT,
        search: search.trim() || undefined,
        accountStatus,
      });
      setHosts(enrichHostsWithId(res.hosts, hostOptionsRef.current));
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setFilterMode(false);
    } catch {
      setHosts([]);
      setTotal(0);
      setTotalPages(0);
      setFilterMode(false);
    } finally {
      setLoading(false);
    }
  }, [page, search, accountStatusFilter]);

  useEffect(() => {
    if (!filterMode) fetchHosts();
  }, [filterMode, page, search, accountStatusFilter, fetchHosts]);

  useEffect(() => {
    getHostsCounts()
      .then(setHostsCounts)
      .catch(() => setHostsCounts(null))
      .finally(() => setCountsLoading(false));
  }, []);

  useEffect(() => {
    getPlansList()
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);

  useEffect(() => {
    getHostsOptions()
      .then(setHostOptions)
      .catch(() => setHostOptions([]));
  }, []);

  useEffect(() => {
    if (hostOptions.length === 0) return;
    setHosts((prev) => enrichHostsWithId(prev, hostOptions));
    setRawListForFilter((prev) => enrichHostsWithId(prev, hostOptions));
  }, [hostOptions]);

  const handlePlanSelect = useCallback(
    (h: AdminHostListItem, displayName: string) => {
      if (!h.id) return;
      const planId = planIdByDisplayName[displayName];
      const currentDisplay = formatPlanName(h.plan_name);
      if (displayName === currentDisplay) return;
      if (!planId) {
        setPlanUpdateError("Lista de planos não carregada. Atualize a página e tente novamente.");
        return;
      }
      setPlanUpdatingId(h.id);
      setPlanUpdateError(null);
      updateHostPlan(h.id, planId)
        .then(() => {
          const newPlanName = displayName === "Free" ? "BASIC" : (displayName === "Core" ? "CORE" : "ENTERPRISE");
          setHosts((prev) =>
            prev.map((x) => (x.id === h.id ? { ...x, plan_name: newPlanName } : x))
          );
          setRawListForFilter((prev) =>
            prev.map((x) => (x.id === h.id ? { ...x, plan_name: newPlanName } : x))
          );
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          const isNetworkError = msg === "Failed to fetch" || (err instanceof TypeError && msg.includes("fetch"));
          setPlanUpdateError(
            isNetworkError
              ? "Não foi possível conectar à API. Verifique se o servidor está em execução e a variável NEXT_PUBLIC_API_URL."
              : msg
          );
        })
        .finally(() => setPlanUpdatingId(null));
    },
    [planIdByDisplayName]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const applyFiltersClick = () => {
    if (!hasClientFilters({ planFilter, minCampaigns, maxCampaigns })) return;
    runApplyFilters();
  };

  const clearClientFilters = () => {
    setPlanFilter("");
    setMinCampaigns("");
    setMaxCampaigns("");
    setFilterMode(false);
    setPage(1);
  };

  const runApplyFilters = useCallback(() => {
    const accountStatus =
      accountStatusFilter === "active" || accountStatusFilter === "inactive"
        ? accountStatusFilter
        : undefined;
    setLoading(true);
    getHostsList({
      page: 1,
      limit: FILTER_FETCH_LIMIT,
      search: search.trim() || undefined,
      accountStatus,
    })
      .then((res) => {
        setRawListForFilter(enrichHostsWithId(res.hosts, hostOptionsRef.current));
        setFilterMode(true);
        setPage(1);
      })
      .catch(() => {
        setRawListForFilter([]);
        setFilterMode(false);
      })
      .finally(() => setLoading(false));
  }, [accountStatusFilter, search]);

  // Min/Max Campanhas: ao preencher (sem estar em modo filtro), aplicar filtros automaticamente após 500ms
  const minMaxDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const hasMinMax = minCampaigns.trim() !== "" || maxCampaigns.trim() !== "";
    if (!hasMinMax || filterMode) return;
    if (minMaxDebounceRef.current) clearTimeout(minMaxDebounceRef.current);
    minMaxDebounceRef.current = setTimeout(() => {
      minMaxDebounceRef.current = null;
      runApplyFilters();
    }, 500);
    return () => {
      if (minMaxDebounceRef.current) clearTimeout(minMaxDebounceRef.current);
    };
  }, [minCampaigns, maxCampaigns, filterMode, runApplyFilters]);

  // Ao selecionar Plano (Core/Enterprise/Free), aplicar filtros automaticamente; ao voltar para Todos, sair do modo filtro
  useEffect(() => {
    if (planFilter === "") {
      if (filterMode && !minCampaigns.trim() && !maxCampaigns.trim()) {
        setFilterMode(false);
        setPage(1);
      }
      return;
    }
    if (planFilter !== "CORE" && planFilter !== "ENTERPRISE" && planFilter !== "FREE") return;
    setLoading(true);
    const accountStatus =
      accountStatusFilter === "active" || accountStatusFilter === "inactive"
        ? accountStatusFilter
        : undefined;
    getHostsList({
      page: 1,
      limit: FILTER_FETCH_LIMIT,
      search: search.trim() || undefined,
      accountStatus,
    })
      .then((res) => {
        setRawListForFilter(res.hosts);
        setFilterMode(true);
        setPage(1);
      })
      .catch(() => {
        setRawListForFilter([]);
        setFilterMode(false);
      })
      .finally(() => setLoading(false));
  }, [planFilter]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-8 md:px-12 lg:px-14 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Hosts</h1>
        <p className="text-white/60 mt-1">
          Listagem e gestão de hosts. Busca por nome da empresa ou e-mail.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-white/60 text-sm font-medium">Total de hosts</p>
          <p className="text-2xl font-bold text-white mt-1">
            {countsLoading ? "—" : hostsCounts?.total ?? "—"}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-white/60 text-sm font-medium">Conta liberada</p>
          <p className="text-2xl font-bold text-white mt-1">
            {countsLoading ? "—" : hostsCounts?.active ?? "—"}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-white/60 text-sm font-medium">Aguardando aprovação</p>
          <p className="text-2xl font-bold text-white mt-1">
            {countsLoading ? "—" : hostsCounts?.inactive ?? "—"}
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5">
        <p className="text-white/80 font-medium text-sm mb-3">Filtros</p>
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[200px]">
            <label className="block text-white/60 text-xs mb-1">Buscar por nome ou e-mail</label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ex: empresa ou email@..."
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
          <div className="min-w-[180px]">
            <label className="block text-white/60 text-xs mb-1">Conta host</label>
            <select
              value={accountStatusFilter}
              onChange={(e) => {
                setAccountStatusFilter((e.target.value || "") as "" | "active" | "inactive");
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] [color-scheme:dark]"
            >
              <option value="">Todas</option>
              <option value="active">Liberada</option>
              <option value="inactive">Aguardando aprovação</option>
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="block text-white/60 text-xs mb-1">Plano</label>
            <select
              value={planFilter}
              onChange={(e) =>
                setPlanFilter((e.target.value || "") as "" | "CORE" | "ENTERPRISE" | "FREE")
              }
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] [color-scheme:dark]"
            >
              <option value="">Todos</option>
              <option value="CORE">Core</option>
              <option value="ENTERPRISE">Enterprise</option>
              <option value="FREE">Free</option>
            </select>
          </div>
          <div className="w-28">
            <label className="block text-white/60 text-xs mb-1">Min Campanhas</label>
            <input
              type="number"
              min={0}
              value={minCampaigns}
              onChange={(e) => setMinCampaigns(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="w-28">
            <label className="block text-white/60 text-xs mb-1">Max Campanhas</label>
            <input
              type="number"
              min={0}
              value={maxCampaigns}
              onChange={(e) => setMaxCampaigns(e.target.value)}
              placeholder="—"
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <button
            type="button"
            onClick={applyFiltersClick}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 transition-colors cursor-pointer"
          >
            Aplicar filtros
          </button>
          {hasClientFilters({ planFilter, minCampaigns, maxCampaigns }) && (
            <button
              type="button"
              onClick={clearClientFilters}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/60 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
        </form>
        {filterMode && (
          <p className="text-white/50 text-xs mt-2">
            Exibindo até {FILTER_FETCH_LIMIT} hosts com filtros aplicados ({filteredTotal} resultado(s)).
          </p>
        )}
      </div>

      {planUpdateError && (
        <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm flex items-center justify-between gap-4">
          <span>{planUpdateError}</span>
          <button
            type="button"
            onClick={() => setPlanUpdateError(null)}
            className="shrink-0 text-red-300 hover:text-white"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      )}

      {accountStatusError && (
        <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm flex items-center justify-between gap-4">
          <span>{accountStatusError}</span>
          <button
            type="button"
            onClick={() => setAccountStatusError(null)}
            className="shrink-0 text-red-300 hover:text-white"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/60">Carregando hosts...</div>
        ) : displayHosts.length === 0 ? (
          <div className="p-12 text-center text-white/60">
            Nenhum host encontrado.
            {(search || accountStatusFilter || hasClientFilters({ planFilter, minCampaigns, maxCampaigns })) &&
              " Ajuste busca ou filtros."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th 
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('name_company')}
                  >
                    Empresa {sortKey === 'name_company' && (sortDesc ? '▼' : '▲')}
                  </th>
                  <th 
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('email')}
                  >
                    E-mail {sortKey === 'email' && (sortDesc ? '▼' : '▲')}
                  </th>
                  <th 
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('campaigns_created')}
                  >
                    Campanhas {sortKey === 'campaigns_created' && (sortDesc ? '▼' : '▲')}
                  </th>
                  <th 
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('plan_name')}
                  >
                    Plano {sortKey === 'plan_name' && (sortDesc ? '▼' : '▲')}
                  </th>
                  <th 
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('duration_plan')}
                  >
                    Válido até {sortKey === 'duration_plan' && (sortDesc ? '▼' : '▲')}
                  </th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">
                    Conta host
                  </th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {displayHosts.map((h, i) => (
                  <tr
                    key={h.email ? `${h.email}-${i}` : i}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">
                      {h.name_company ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-white/80">{h.email ?? "—"}</td>
                    <td className="px-4 py-3 text-white/80">
                      {typeof h.campaigns_created === "number"
                        ? h.campaigns_created.toLocaleString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      <select
                        value={(() => {
                          const display = formatPlanName(h.plan_name);
                          return display === "Core" || display === "Enterprise" || display === "Free" ? display : "Free";
                        })()}
                        onChange={(e) => {
                          if (!h.id) return;
                          const value = e.target.value as "Free" | "Core" | "Enterprise";
                          const current = formatPlanName(h.plan_name);
                          if (value !== current) {
                            if (
                              (current === "Core" || current === "Enterprise") &&
                              value === "Free" &&
                              !window.confirm(`Você tem certeza que deseja retirar o plano ${current}?`)
                            )
                              return;
                            handlePlanSelect(h, value);
                          }
                        }}
                        disabled={!h.id || planUpdatingId === h.id}
                        title={!h.id ? "ID do host não disponível — aguarde o carregamento ou atualize a página" : planUpdatingId === h.id ? "Atualizando plano..." : undefined}
                        className="min-w-[100px] px-2 py-1 rounded bg-[var(--color-background)] border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-60 cursor-pointer [color-scheme:dark]"
                      >
                        <option value="Free">Free</option>
                        <option value="Core">Core</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      {formatDate(h.duration_plan ?? undefined)}
                    </td>
                    <td className="px-4 py-3">
                      {hostAccountStatusLabel(h) === "active" ? (
                        <span className="text-emerald-400 text-sm font-medium">
                          Liberada
                        </span>
                      ) : (
                        <span className="text-amber-400 text-sm font-medium">
                          Aguardando aprovação
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDetailHost(h)}
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
            {displayTotal} hosts
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

      {detailHost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 cursor-pointer"
          onClick={() => setDetailHost(null)}
        >
          <div
            className="bg-[var(--color-background)] border border-white/20 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">
                {detailHost.name_company || detailHost.email || "Detalhes do host"}
              </h2>
              <button
                type="button"
                onClick={() => setDetailHost(null)}
                className="text-white/60 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-white/50">Empresa</dt>
                <dd className="text-white font-medium">{detailHost.name_company ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-white/50">E-mail</dt>
                <dd className="text-white">{detailHost.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-white/50">Campanhas criadas</dt>
                <dd className="text-white">
                  {typeof detailHost.campaigns_created === "number"
                    ? detailHost.campaigns_created.toLocaleString("pt-BR")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-white/50">Plano</dt>
                <dd className="text-white">{formatPlanName(detailHost.plan_name)}</dd>
              </div>
              <div>
                <dt className="text-white/50">Plano válido até</dt>
                <dd className="text-white">{formatDate(detailHost.duration_plan ?? undefined)}</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
                <p className="text-white/50 text-xs uppercase tracking-wide font-medium">
                  Acesso à plataforma (conta host)
                </p>
                <p className="text-white/70 text-xs">
                  Hosts novos ficam com conta inativa até você liberar. Após ativar, o host precisa
                  entrar de novo para obter token com acesso ao dashboard.
                </p>
                <div className="flex items-center gap-3 flex-wrap pt-1">
                  {detailHost.id ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={hostAccountStatusLabel(detailHost) === "active"}
                      disabled={accountStatusUpdatingId === detailHost.id}
                      onClick={() => {
                        if (!detailHost.id) return;
                        const hostId = detailHost.id;
                        const current = hostAccountStatusLabel(detailHost);
                        const next = current === "active" ? "inactive" : "active";
                        setAccountStatusError(null);
                        setAccountStatusUpdatingId(hostId);
                        updateHostAccountStatus(hostId, next)
                          .then(() => {
                            setDetailHost((h) =>
                              h && h.id === hostId
                                ? { ...h, accountStatus: next }
                                : h
                            );
                            setHosts((prev) =>
                              prev.map((x) =>
                                x.id === hostId ? { ...x, accountStatus: next } : x
                              )
                            );
                            setRawListForFilter((prev) =>
                              prev.map((x) =>
                                x.id === hostId ? { ...x, accountStatus: next } : x
                              )
                            );
                          })
                          .catch((err: unknown) => {
                            setAccountStatusError(
                              err instanceof Error ? err.message : "Falha ao atualizar conta host"
                            );
                          })
                          .finally(() => setAccountStatusUpdatingId(null));
                      }}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-50 ${
                        hostAccountStatusLabel(detailHost) === "active"
                          ? "bg-emerald-500"
                          : "bg-amber-600/80"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                          hostAccountStatusLabel(detailHost) === "active"
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                      <span className="sr-only">
                        {hostAccountStatusLabel(detailHost) === "active"
                          ? "Conta liberada"
                          : "Aguardando aprovação"}
                      </span>
                    </button>
                  ) : null}
                  <span
                    className={
                      hostAccountStatusLabel(detailHost) === "active"
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }
                  >
                    {accountStatusUpdatingId === detailHost.id
                      ? "..."
                      : hostAccountStatusLabel(detailHost) === "active"
                        ? "Liberada — pode usar o Nido"
                        : "Aguardando aprovação — só vê tela de contato"}
                  </span>
                </div>
              </div>
            </dl>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailHost(null)}
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
