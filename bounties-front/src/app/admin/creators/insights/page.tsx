"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCreatorsInsightsList,
  getAdminUserDetail,
  getCreatorsInsightsOptions,
  setUserActive,
  type AdminCreatorsInsightsFilters,
  type AdminCreatorsInsightsOptionsResponse,
  type ProfileStats,
} from "@/lib/api/admin";
import { ALL_LANGUAGES } from "@/data/allLanguages";
import CustomSelect from "@/components/ui/CustomSelect";

/** ISO 639-1 (e códigos do onboarding) → nome legível, igual ao LanguageMultiSelect */
const LANGUAGE_CODE_TO_LABEL = new Map<string, string>(
  ALL_LANGUAGES.map((l) => [l.value.trim().toLowerCase(), l.label])
);

const LIMIT = 20;

const EMPTY_INSIGHTS_OPTIONS: AdminCreatorsInsightsOptionsResponse = {
  average_views_per_post: [],
  primary_language: [],
  fluent_language: [],
  audience_region: [],
  content_category_list: [],
  content_formats: [],
  crypto_experience: [],
  trading_experience: [],
  main_chains: [],
};

function normalizeInsightsOptions(raw: unknown): AdminCreatorsInsightsOptionsResponse {
  const keys: (keyof AdminCreatorsInsightsOptionsResponse)[] = [
    "average_views_per_post",
    "primary_language",
    "fluent_language",
    "audience_region",
    "content_category_list",
    "content_formats",
    "crypto_experience",
    "trading_experience",
    "main_chains",
  ];
  const out: AdminCreatorsInsightsOptionsResponse = { ...EMPTY_INSIGHTS_OPTIONS };
  if (!raw || typeof raw !== "object") return out;
  const o = raw as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (Array.isArray(v)) {
      out[k] = v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
    }
  }
  return out;
}

/** Mesmo padrão visual dos inputs da área de filtros + alinhado ao CustomSelect da plataforma */
const INSIGHTS_SELECT_TRIGGER =
  "!rounded-lg py-2 px-3 text-sm min-h-[42px] border-white/20 bg-white/10";

const INSIGHTS_SELECT_SEARCH = {
  searchable: true,
  searchPlaceholder: "Digite para filtrar…",
} as const;

function filterOptionsWithAll(values: string[], labelFor: (v: string) => string) {
  return [{ value: "", label: "All" }, ...values.map((v) => ({ value: v, label: labelFor(v) }))];
}

function insightSelectOnChange(
  v: string | string[],
  key: keyof AdminCreatorsInsightsFilters,
  update: (k: keyof AdminCreatorsInsightsFilters, value: string) => void
) {
  update(key, typeof v === "string" ? v : "");
}

type CreatorInsightsRow = Awaited<ReturnType<typeof getCreatorsInsightsList>>["creators"][number];

type CreatorDetail = {
  id?: string;
  isActive?: boolean;
  twitter_username?: string;
  username_discord?: string;
  username_instagram?: string;
  username_telegram?: string;
  username_tiktok?: string;
  username_youtube?: string;
  average_views_per_post?: string;

  content_formats?: string[];
  crypto_content_specialization?: string[];
  crypto_experience?: string;
  example_content_links?: string;
  favorite_protocols_projects?: string;
  investment_participation_style?: string;
  main_chains?: string[];
  main_chains_other?: string;
  trading_experience?: string;
  audience_region?: string[];
  audience_size?: string;
  content_category_list?: Array<string> | Array<{ slug?: string }> | undefined;
  first_login?: boolean | null;
  fluent_language?: string;
  fluent_language_others?: string;
  primary_language?: string;
};

function formatHandle(handle: string | undefined) {
  if (!handle?.trim()) return "—";
  return `@${handle}`;
}

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function normalizeReadableValue(value: string): string {
  const cleaned = value.replace(/[_-]+/g, " ").trim();
  if (!cleaned) return "—";

  const lowered = cleaned.toLowerCase();
  const specialMap: Record<string, string> = {
    web3: "Web3",
    defi: "DeFi",
    dao: "DAO",
    nft: "NFT",
    nfts: "NFTs",
    ido: "IDO",
    ico: "ICO",
  };

  if (specialMap[lowered]) return specialMap[lowered];
  return toTitleCase(cleaned);
}

function mapLanguageCodeToName(code: string): string {
  const normalized = code.trim().toLowerCase();
  const fromAll = LANGUAGE_CODE_TO_LABEL.get(normalized);
  if (fromAll) return fromAll;
  return toTitleCase(normalized);
}

function formatLanguage(value: string | undefined): string {
  if (!value?.trim()) return "—";
  const parts = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return "—";
  return parts.map(mapLanguageCodeToName).join(", ");
}

function formatArray(values: unknown): string {
  if (!Array.isArray(values)) return "—";
  if (values.length === 0) return "—";
  return values
    .map((v) => {
      if (typeof v === "string") return normalizeReadableValue(v);
      if (v && typeof v === "object" && "slug" in v) {
        const slug = (v as { slug?: unknown }).slug;
        return typeof slug === "string" ? normalizeReadableValue(slug) : "";
      }
      return String(v ?? "");
    })
    .filter(Boolean)
    .join(", ");
}

export default function AdminCreatorsInsightsPage() {
  const [rows, setRows] = useState<CreatorInsightsRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<CreatorDetail | null>(null);
  const [activeUpdatingId, setActiveUpdatingId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<AdminCreatorsInsightsFilters>({
    average_views_per_post: "",
    primary_language: "",
    fluent_language: "",
    audience_region: "",
    content_category_list: "",
    content_formats: "",
    crypto_experience: "",
    trading_experience: "",
    main_chains: "",
  });
  const [options, setOptions] = useState<AdminCreatorsInsightsOptionsResponse>(EMPTY_INSIGHTS_OPTIONS);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const loadFilterOptions = useCallback(() => {
    setOptionsLoading(true);
    setOptionsError(null);
    getCreatorsInsightsOptions()
      .then((res) => {
        setOptions(normalizeInsightsOptions(res));
        setOptionsError(null);
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Não foi possível carregar as opções dos filtros.";
        setOptionsError(msg);
        setOptions(EMPTY_INSIGHTS_OPTIONS);
      })
      .finally(() => {
        setOptionsLoading(false);
      });
  }, []);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getCreatorsInsightsList({
          page,
          limit: LIMIT,
          search,
          average_views_per_post: filters.average_views_per_post,
          primary_language: filters.primary_language,
          fluent_language: filters.fluent_language,
          audience_region: filters.audience_region,
          content_category_list: filters.content_category_list,
          content_formats: filters.content_formats,
          crypto_experience: filters.crypto_experience,
          trading_experience: filters.trading_experience,
          main_chains: filters.main_chains,
        });
        if (cancelled) return;
        setRows(Array.isArray(res.creators) ? res.creators : []);
        setTotal(res.total ?? 0);
        setTotalPages(res.totalPages ?? 0);
        if (res.profile_stats) setProfileStats(res.profile_stats);
      } catch (e: unknown) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Erro ao carregar creators insights";
        setError(message);
        setRows([]);
        setTotal(0);
        setTotalPages(0);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, [page, search, filters]);

  /** Opções = só valores que existem em algum creator (API); idiomas ordenados pelo nome exibido */
  const filterSelectOptions = useMemo(() => {
    const sortLangCodesByLabel = (codes: string[]) =>
      [...codes].sort((a, b) =>
        mapLanguageCodeToName(a).localeCompare(mapLanguageCodeToName(b), "en", { sensitivity: "base" })
      );
    return {
      ...options,
      primary_language: sortLangCodesByLabel(options.primary_language),
      fluent_language: sortLangCodesByLabel(options.fluent_language),
    };
  }, [options]);

  const selectedRowIndexText = useMemo(() => {
    if (!selectedId) return "";
    const idx = rows.findIndex((r) => r?.id === selectedId);
    return idx >= 0 ? `#${idx + 1}` : "";
  }, [rows, selectedId]);

  const openDetails = async (creatorId?: string) => {
    if (!creatorId) return;

    setSelectedId(creatorId);
    setDetail(null);
    setDetailLoading(true);

    try {
      const user = await getAdminUserDetail(creatorId);
      setDetail(user as CreatorDetail);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedId(null);
    setDetail(null);
    setDetailLoading(false);
    setActiveUpdatingId(null);
  };

  const handleToggleActive = async () => {
    if (!selectedId || detail?.isActive === undefined) return;
    const newActive = detail.isActive === false;

    try {
      setActiveUpdatingId(selectedId);
      await setUserActive(selectedId, newActive);
      setDetail((d) => (d ? { ...d, isActive: newActive } : d));
      setRows((prev) =>
        prev.map((r) => (r.id === selectedId ? { ...r, isActive: newActive } : r))
      );
    } catch {
      // noop
    } finally {
      setActiveUpdatingId(null);
    }
  };

  const updateFilter = (key: keyof AdminCreatorsInsightsFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearch("");
    setFilters({
      average_views_per_post: "",
      primary_language: "",
      fluent_language: "",
      audience_region: "",
      content_category_list: "",
      content_formats: "",
      crypto_experience: "",
      trading_experience: "",
      main_chains: "",
    });
    setPage(1);
  };

  const submitInsightsSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-8 md:px-12 lg:px-14 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Creator Insights</h1>
        <p className="text-white/60 mt-1">Resumo por usernames e average views por post.</p>
      </div>

      {/* Profile Stats */}
      {profileStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-white/50 text-xs">Total Creators (full login)</p>
            <p className="text-xl font-bold text-white mt-1">{profileStats.total_creators}</p>
          </div>
          {([
            { key: "twitter" as const, label: "Twitter/X", color: "text-blue-400" },
            { key: "instagram" as const, label: "Instagram", color: "text-pink-400" },
            { key: "tiktok" as const, label: "TikTok", color: "text-purple-400" },
            { key: "youtube" as const, label: "YouTube", color: "text-red-400" },
            { key: "telegram" as const, label: "Telegram", color: "text-blue-300" },
            { key: "discord" as const, label: "Discord", color: "text-indigo-400" },
          ]).map(({ key, label, color }) => (
            <div key={key} className="p-4 rounded-xl border border-white/10 bg-white/5">
              <p className={`text-xs ${color}`}>{label}</p>
              <p className="text-xl font-bold text-white mt-1">{profileStats[key]}</p>
              <p className="text-white/30 text-[10px] mt-0.5">
                {profileStats.total_creators > 0
                  ? `${Math.round((profileStats[key] / profileStats.total_creators) * 100)}%`
                  : "0%"}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-white/80 font-medium text-sm">Filters</p>
          {optionsLoading && <span className="text-white/50 text-xs">Carregando opções…</span>}
        </div>
        {optionsError && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-100 text-sm">
            <span>Filtros: {optionsError}</span>
            <button
              type="button"
              onClick={() => loadFilterOptions()}
              className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-medium"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-end mb-4">
          <div className="min-w-[320px] flex-1">
            <label className="block text-white/60 text-xs mb-1">Search (all columns)</label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitInsightsSearch();
                }
              }}
              placeholder="Twitter, Discord, Instagram, avg views, audience size..."
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <button
            type="button"
            onClick={submitInsightsSearch}
            className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            Search
          </button>
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-white/60 text-xs mb-1">Avg views/post</label>
            <CustomSelect
              {...INSIGHTS_SELECT_SEARCH}
              className="w-full"
              triggerClassName={INSIGHTS_SELECT_TRIGGER}
              placeholder="All"
              options={filterOptionsWithAll(filterSelectOptions.average_views_per_post, normalizeReadableValue)}
              value={filters.average_views_per_post ?? ""}
              onChange={(v) => insightSelectOnChange(v, "average_views_per_post", updateFilter)}
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1">Primary Language</label>
            <CustomSelect
              {...INSIGHTS_SELECT_SEARCH}
              className="w-full"
              triggerClassName={INSIGHTS_SELECT_TRIGGER}
              menuClassName="max-h-72"
              placeholder="All"
              options={filterOptionsWithAll(filterSelectOptions.primary_language, formatLanguage)}
              value={filters.primary_language ?? ""}
              onChange={(v) => insightSelectOnChange(v, "primary_language", updateFilter)}
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1">Fluent Language</label>
            <CustomSelect
              {...INSIGHTS_SELECT_SEARCH}
              className="w-full"
              triggerClassName={INSIGHTS_SELECT_TRIGGER}
              menuClassName="max-h-72"
              placeholder="All"
              options={filterOptionsWithAll(filterSelectOptions.fluent_language, formatLanguage)}
              value={filters.fluent_language ?? ""}
              onChange={(v) => insightSelectOnChange(v, "fluent_language", updateFilter)}
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1">Audience Region</label>
            <CustomSelect
              {...INSIGHTS_SELECT_SEARCH}
              className="w-full"
              triggerClassName={INSIGHTS_SELECT_TRIGGER}
              placeholder="All"
              options={filterOptionsWithAll(filterSelectOptions.audience_region, normalizeReadableValue)}
              value={filters.audience_region ?? ""}
              onChange={(v) => insightSelectOnChange(v, "audience_region", updateFilter)}
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1">Content Category</label>
            <CustomSelect
              {...INSIGHTS_SELECT_SEARCH}
              className="w-full"
              triggerClassName={INSIGHTS_SELECT_TRIGGER}
              placeholder="All"
              options={filterOptionsWithAll(filterSelectOptions.content_category_list, normalizeReadableValue)}
              value={filters.content_category_list ?? ""}
              onChange={(v) => insightSelectOnChange(v, "content_category_list", updateFilter)}
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1">Content Formats</label>
            <CustomSelect
              {...INSIGHTS_SELECT_SEARCH}
              className="w-full"
              triggerClassName={INSIGHTS_SELECT_TRIGGER}
              placeholder="All"
              options={filterOptionsWithAll(filterSelectOptions.content_formats, normalizeReadableValue)}
              value={filters.content_formats ?? ""}
              onChange={(v) => insightSelectOnChange(v, "content_formats", updateFilter)}
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1">Crypto Experience</label>
            <CustomSelect
              {...INSIGHTS_SELECT_SEARCH}
              className="w-full"
              triggerClassName={INSIGHTS_SELECT_TRIGGER}
              placeholder="All"
              options={filterOptionsWithAll(filterSelectOptions.crypto_experience, normalizeReadableValue)}
              value={filters.crypto_experience ?? ""}
              onChange={(v) => insightSelectOnChange(v, "crypto_experience", updateFilter)}
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1">Trading Experience</label>
            <CustomSelect
              {...INSIGHTS_SELECT_SEARCH}
              className="w-full"
              triggerClassName={INSIGHTS_SELECT_TRIGGER}
              placeholder="All"
              options={filterOptionsWithAll(filterSelectOptions.trading_experience, normalizeReadableValue)}
              value={filters.trading_experience ?? ""}
              onChange={(v) => insightSelectOnChange(v, "trading_experience", updateFilter)}
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1">Main Chains</label>
            <CustomSelect
              {...INSIGHTS_SELECT_SEARCH}
              className="w-full"
              triggerClassName={INSIGHTS_SELECT_TRIGGER}
              placeholder="All"
              options={filterOptionsWithAll(filterSelectOptions.main_chains, normalizeReadableValue)}
              value={filters.main_chains ?? ""}
              onChange={(v) => insightSelectOnChange(v, "main_chains", updateFilter)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
        <table className="min-w-[1000px] w-full border-collapse">
          <thead>
            <tr className="text-left text-white/70 text-sm">
              <th className="px-4 py-3 border-b border-white/10">Twitter / X</th>
              <th className="px-4 py-3 border-b border-white/10">Discord</th>
              <th className="px-4 py-3 border-b border-white/10">Instagram</th>
              <th className="px-4 py-3 border-b border-white/10">Telegram</th>
              <th className="px-4 py-3 border-b border-white/10">TikTok</th>
              <th className="px-4 py-3 border-b border-white/10">YouTube</th>
              <th className="px-4 py-3 border-b border-white/10">Avg views/post</th>
              <th className="px-4 py-3 border-b border-white/10">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: LIMIT }).map((_, i) => (
                <tr key={i} className="text-white/60">
                  <td className="px-4 py-4 border-b border-white/10">—</td>
                  <td className="px-4 py-4 border-b border-white/10">—</td>
                  <td className="px-4 py-4 border-b border-white/10">—</td>
                  <td className="px-4 py-4 border-b border-white/10">—</td>
                  <td className="px-4 py-4 border-b border-white/10">—</td>
                  <td className="px-4 py-4 border-b border-white/10">—</td>
                  <td className="px-4 py-4 border-b border-white/10">—</td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-white/60">
                  Nenhum creator encontrado.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4 border-b border-white/10">
                    <span className="font-medium text-white">{formatHandle(r.twitter_username)}</span>
                  </td>
                  <td className="px-4 py-4 border-b border-white/10">
                    <span className="font-medium text-white">{formatHandle(r.username_discord)}</span>
                  </td>
                  <td className="px-4 py-4 border-b border-white/10">
                    <span className="font-medium text-white">{formatHandle(r.username_instagram)}</span>
                  </td>
                  <td className="px-4 py-4 border-b border-white/10">
                    <span className="font-medium text-white">{formatHandle(r.username_telegram)}</span>
                  </td>
                  <td className="px-4 py-4 border-b border-white/10">
                    <span className="font-medium text-white">{formatHandle(r.username_tiktok)}</span>
                  </td>
                  <td className="px-4 py-4 border-b border-white/10">
                    <span className="font-medium text-white">{formatHandle(r.username_youtube)}</span>
                  </td>
                  <td className="px-4 py-4 border-b border-white/10 text-white">
                    {r.average_views_per_post?.trim() ? r.average_views_per_post : "—"}
                  </td>
                  <td className="px-4 py-4 border-b border-white/10">
                    <button
                      type="button"
                      onClick={() => openDetails(r.id)}
                      className="text-[var(--color-primary)] hover:underline text-sm font-medium cursor-pointer"
                    >
                      Mais informações
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-white/60 text-sm">
            Mostrando {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} de {total} creators
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
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Modal detalhes */}
      {selectedId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 cursor-pointer"
          onClick={closeDetails}
        >
          <div
            className="bg-[var(--color-background)] border border-white/20 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4 gap-4">
              <h2 className="text-xl font-bold text-white">
                Mais informações {selectedRowIndexText ? <span className="text-white/50">({selectedRowIndexText})</span> : null}
              </h2>
              <button
                type="button"
                onClick={closeDetails}
                className="text-white/60 hover:text-white text-2xl leading-none"
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>

            {detailLoading ? (
              <div className="text-white/60">Carregando...</div>
            ) : !detail ? (
              <div className="text-white/60">Não foi possível carregar os dados.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white/80 mb-2">Onboarding</h3>
                    <div className="text-sm text-white/70 space-y-2">
                      <div>
                        <div className="text-white/50">New Informations</div>
                        <div className="text-white">
                          {detail.first_login === false ? "Completed" : "Not completed"}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/50">primary_language</div>
                        <div className="text-white">{formatLanguage(detail.primary_language)}</div>
                      </div>
                      <div>
                        <div className="text-white/50">fluent_language</div>
                        <div className="text-white">{formatLanguage(detail.fluent_language)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white/80 mb-2">Conteúdo</h3>
                    <div className="text-sm text-white/70 space-y-2">
                      <div>
                        <div className="text-white/50">average_views_per_post</div>
                        <div className="text-white">
                          {detail.average_views_per_post ? normalizeReadableValue(detail.average_views_per_post) : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/50">content_formats</div>
                        <div className="text-white">{formatArray(detail.content_formats)}</div>
                      </div>
                      <div>
                        <div className="text-white/50">crypto_content_specialization</div>
                        <div className="text-white">{formatArray(detail.crypto_content_specialization)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white/80 mb-2">Audience</h3>
                    <div className="text-sm text-white/70 space-y-2">
                      <div>
                        <div className="text-white/50">audience_size</div>
                        <div className="text-white">
                          {detail.audience_size ? normalizeReadableValue(detail.audience_size) : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/50">audience_region</div>
                        <div className="text-white">{formatArray(detail.audience_region)}</div>
                      </div>
                      <div>
                        <div className="text-white/50">content_category_list</div>
                        <div className="text-white">{formatArray(detail.content_category_list)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white/80 mb-2">Crypto & Trading</h3>
                    <div className="text-sm text-white/70 space-y-2">
                      <div>
                        <div className="text-white/50">crypto_experience</div>
                        <div className="text-white">
                          {detail.crypto_experience ? normalizeReadableValue(detail.crypto_experience) : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/50">trading_experience</div>
                        <div className="text-white">
                          {detail.trading_experience ? normalizeReadableValue(detail.trading_experience) : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/50">main_chains</div>
                        <div className="text-white">{formatArray(detail.main_chains)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-white/80 mb-2">Handles & Links</h3>
                  <div className="text-sm text-white/70 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-white/50">twitter_username</div>
                      <div className="text-white">{formatHandle(detail.twitter_username)}</div>
                    </div>
                    <div>
                      <div className="text-white/50">username_discord</div>
                      <div className="text-white">{formatHandle(detail.username_discord)}</div>
                    </div>
                    <div>
                      <div className="text-white/50">username_instagram</div>
                      <div className="text-white">{formatHandle(detail.username_instagram)}</div>
                    </div>
                    <div>
                      <div className="text-white/50">username_telegram</div>
                      <div className="text-white">{formatHandle(detail.username_telegram)}</div>
                    </div>
                    <div>
                      <div className="text-white/50">username_tiktok</div>
                      <div className="text-white">{formatHandle(detail.username_tiktok)}</div>
                    </div>
                    <div>
                      <div className="text-white/50">username_youtube</div>
                      <div className="text-white">{formatHandle(detail.username_youtube)}</div>
                    </div>
                    <div className="md:col-span-1">
                      <div className="text-white/50">example_content_links</div>
                      <div className="text-white break-words">
                        {detail.example_content_links?.trim() ? detail.example_content_links : "—"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-white/70 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-white/50">favorite_protocols_projects</div>
                      <div className="text-white">
                        {detail.favorite_protocols_projects
                          ? normalizeReadableValue(detail.favorite_protocols_projects)
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/50">investment_participation_style</div>
                      <div className="text-white">
                        {detail.investment_participation_style
                          ? normalizeReadableValue(detail.investment_participation_style)
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toggle isActive (verificação) */}
                {detail.id && (
                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={detail.isActive !== false}
                      disabled={activeUpdatingId === detail.id}
                      onClick={handleToggleActive}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-50 ${
                        detail.isActive !== false ? "bg-emerald-500" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                          detail.isActive !== false ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                      <span className="sr-only">{detail.isActive !== false ? "Ativo" : "Inativo"}</span>
                    </button>

                    <span className={detail.isActive !== false ? "text-emerald-400" : "text-white/50"}>
                      {activeUpdatingId === detail.id ? "..." : detail.isActive !== false ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={closeDetails}
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

