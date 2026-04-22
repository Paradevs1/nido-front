"use client";

import { useEffect, useMemo, useState } from "react";
import { getCampaignsCombo, getCampaignCounts, type CampaignOption } from "@/lib/api/admin";
import AdminCampaignDetailModal from "@/components/admin/AdminCampaignDetailModal";

const LIMIT = 20;

function applyFilters(
  list: CampaignOption[],
  search: string,
  typeFilter: "" | "public" | "private",
  countryFilter: string
): CampaignOption[] {
  let result = list;
  const q = search.trim().toLowerCase();
  if (q) {
    result = result.filter((c) => (c.name ?? "").toLowerCase().includes(q));
  }
  if (typeFilter === "public") result = result.filter((c) => !c.isPrivate);
  if (typeFilter === "private") result = result.filter((c) => c.isPrivate);
  if (countryFilter) {
    const target = countryFilter.toLowerCase();
    result = result.filter((c) =>
      (c.country ?? []).some((cty) => (cty.name ?? "").toLowerCase() === target)
    );
  }
  return result;
}

function hasActiveFilters(search: string, typeFilter: string, countryFilter: string) {
  return !!search.trim() || !!typeFilter || !!countryFilter;
}

/** Primeira letra maiúscula: "brazil" → "Brazil", "global" → "Global" */
function formatCountryName(name: string): string {
  if (!name || typeof name !== "string") return "";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function formatCountries(country: CampaignOption["country"]): string {
  if (!country?.length) return "—";
  return country.map((c) => formatCountryName(c.name)).filter(Boolean).join(", ") || "—";
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [counts, setCounts] = useState<{ total: number; public: number; private: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "public" | "private">("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [detailCampaign, setDetailCampaign] = useState<CampaignOption | null>(null);

  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    campaigns.forEach((c) => {
      c.country?.forEach((cty) => {
        if (cty?.name) set.add(cty.name.toLowerCase());
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [campaigns]);

  type SortKey = "name" | "type" | "country" | null;
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
    let result = applyFilters(campaigns, search, typeFilter, countryFilter);
    if (sortKey) {
      result = [...result].sort((a, b) => {
        let valA: string | number | undefined = undefined;
        let valB: string | number | undefined = undefined;

        if (sortKey === "name") {
          valA = a.name;
          valB = b.name;
        } else if (sortKey === "type") {
          valA = a.isPrivate ? "privada" : "pública";
          valB = b.isPrivate ? "privada" : "pública";
        } else if (sortKey === "country") {
          valA = formatCountries(a.country);
          valB = formatCountries(b.country);
        }

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
  }, [campaigns, search, typeFilter, countryFilter, sortKey, sortDesc]);
  const displayCampaigns = filteredList;
  const displayTotal = displayCampaigns.length;
  const totalPages = Math.max(1, Math.ceil(displayTotal / LIMIT));
  const displayPage = Math.min(Math.max(1, page), totalPages);
  const paginatedCampaigns = useMemo(
    () => displayCampaigns.slice((displayPage - 1) * LIMIT, displayPage * LIMIT),
    [displayCampaigns, displayPage]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setTypeFilter("");
    setCountryFilter("");
    setPage(1);
  };

  useEffect(() => {
    Promise.all([getCampaignsCombo(), getCampaignCounts()])
      .then(([list, c]) => {
        setCampaigns(list);
        setCounts(c);
      })
      .catch(() => {
        setCampaigns([]);
        setCounts({ total: 0, public: 0, private: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  const openDetail = (campaign: CampaignOption) => setDetailCampaign(campaign);
  const closeModal = () => setDetailCampaign(null);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-8 md:px-12 lg:px-14 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Campanhas</h1>
        <p className="text-white/60 mt-1">
          Visualize quantas e quais campanhas existem e as estatísticas de cada uma.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-white/60 text-sm font-medium">Total</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? "—" : counts?.total ?? "—"}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-white/60 text-sm font-medium">Públicas</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? "—" : counts?.public ?? "—"}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-white/60 text-sm font-medium">Privadas</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? "—" : counts?.private ?? "—"}
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5">
        <p className="text-white/80 font-medium text-sm mb-3">Filtros</p>
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[200px]">
            <label className="block text-white/60 text-xs mb-1">Buscar por nome da campanha</label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ex: nome da campanha..."
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="min-w-[140px]">
            <label className="block text-white/60 text-xs mb-1">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter((e.target.value || "") as "" | "public" | "private");
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] [color-scheme:dark]"
            >
              <option value="">Todos</option>
              <option value="public">Pública</option>
              <option value="private">Privada</option>
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="block text-white/60 text-xs mb-1">País</label>
            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value || "");
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-background)] border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] [color-scheme:dark]"
            >
              <option value="">Todos</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>
                  {formatCountryName(c)}
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
          {hasActiveFilters(search, typeFilter, countryFilter) && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/60 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
        </form>
        {hasActiveFilters(search, typeFilter, countryFilter) && (
          <p className="text-white/50 text-xs mt-2">
            {displayTotal} resultado(s) com filtros aplicados.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/60">Carregando campanhas...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center text-white/60">Nenhuma campanha encontrada.</div>
        ) : displayCampaigns.length === 0 ? (
          <div className="p-12 text-center text-white/60">
            Nenhuma campanha encontrada. Ajuste busca ou filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th 
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('name')}
                  >
                    Nome {sortKey === 'name' && (sortDesc ? '▼' : '▲')}
                  </th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">
                    Host
                  </th>
                  <th
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('type')}
                  >
                    Tipo {sortKey === 'type' && (sortDesc ? '▼' : '▲')}
                  </th>
                  <th 
                    className="px-4 py-3 text-white/80 font-semibold text-sm cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('country')}
                  >
                    País {sortKey === 'country' && (sortDesc ? '▼' : '▲')}
                  </th>
                  <th className="px-4 py-3 text-white/80 font-semibold text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCampaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">
                      {c.name || "Sem título"}
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">
                      {c.host?.name_company || c.host?.username || "—"}
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      {c.isPrivate ? "Privada" : "Pública"}
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      {formatCountries(c.country)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openDetail(c)}
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
            Mostrando {(displayPage - 1) * LIMIT + 1}–{Math.min(displayPage * LIMIT, displayTotal)} de{" "}
            {displayTotal} campanhas
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

      {detailCampaign && (
        <AdminCampaignDetailModal campaign={detailCampaign} onClose={closeModal} />
      )}
    </div>
  );
}
