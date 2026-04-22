"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCampaignsCombo, getCampaignCounts, type CampaignOption } from "@/lib/api/admin";
import AdminPaymentCampaignCard from "@/components/admin/AdminPaymentCampaignCard";

const LIMIT = 12;

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

function formatCountryName(name: string): string {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export default function AdminPaymentsByCampaignPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [counts, setCounts] = useState<{ total: number; public: number; private: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "public" | "private">("");
  const [countryFilter, setCountryFilter] = useState("");

  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    campaigns.forEach((c) => {
      c.country?.forEach((cty) => {
        if (cty?.name) set.add(cty.name.toLowerCase());
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [campaigns]);

  const filteredList = useMemo(
    () => applyFilters(campaigns, search, typeFilter, countryFilter),
    [campaigns, search, typeFilter, countryFilter]
  );

  const displayTotal = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(displayTotal / LIMIT));
  const displayPage = Math.min(Math.max(1, page), totalPages);

  const paginatedCampaigns = useMemo(
    () => filteredList.slice((displayPage - 1) * LIMIT, displayPage * LIMIT),
    [filteredList, displayPage]
  );

  const load = useCallback(() => {
    setLoading(true);
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

  useEffect(() => {
    load();
  }, [load]);

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

  const goToCampaign = (c: CampaignOption) => {
    router.push(`/admin/payments/campaigns/${encodeURIComponent(c.id)}`);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-8 md:px-12 lg:px-14 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Pagamentos por campanha</h1>
        <p className="text-white/60 mt-1">
          Escolha uma campanha para ver todos os pagamentos relacionados (por criador), com status e comprovantes
          quando existirem. Mesma origem de dados da lista geral de pagamentos, filtrada por campanha.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-white/60 text-sm font-medium">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{loading ? "—" : counts?.total ?? "—"}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-white/60 text-sm font-medium">Públicas</p>
          <p className="text-2xl font-bold text-white mt-1">{loading ? "—" : counts?.public ?? "—"}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-white/60 text-sm font-medium">Privadas</p>
          <p className="text-2xl font-bold text-white mt-1">{loading ? "—" : counts?.private ?? "—"}</p>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5">
        <p className="text-white/80 font-medium text-sm mb-3">Filtros</p>
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[200px] flex-1">
            <label className="block text-white/60 text-xs mb-1">Buscar por nome da campanha</label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nome da campanha..."
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
              <option value="">Todas</option>
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
          <p className="text-white/50 text-xs mt-2">{displayTotal} resultado(s) com filtros aplicados.</p>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-white/60 rounded-xl border border-white/10 bg-white/5">Carregando campanhas...</div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 text-center text-white/60 rounded-xl border border-white/10 bg-white/5">Nenhuma campanha encontrada.</div>
      ) : filteredList.length === 0 ? (
        <div className="p-12 text-center text-white/60 rounded-xl border border-white/10 bg-white/5">
          Nenhuma campanha com esses filtros. Ajuste a busca.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {paginatedCampaigns.map((c) => (
            <AdminPaymentCampaignCard key={c.id} campaign={c} onSelect={goToCampaign} />
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-white/60 text-sm">
            Mostrando {(displayPage - 1) * LIMIT + 1}–{Math.min(displayPage * LIMIT, displayTotal)} de {displayTotal}{" "}
            campanhas
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={displayPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors cursor-pointer"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 text-white/80 text-sm">
              Página {displayPage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={displayPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors cursor-pointer"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
