"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import CampaignCard from "./CampaignCard";
import { campaignApi, CampaignFilters } from "@/lib/api/campaign";
import { CampaignPublic } from "@/lib/api/host";

interface ExploreCampaignsProps {
  campaigns?: CampaignPublic[];
  loading?: boolean;
  error?: string | null;
  noTopPadding?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export default function ExploreCampaigns({
  campaigns: campaignsProp,
  loading: loadingProp,
  error: errorProp,
  noTopPadding = false,
  totalPages: totalPagesProp,
  currentPage: currentPageProp,
  onPageChange,
}: ExploreCampaignsProps = {}) {
  const isControlled = Array.isArray(campaignsProp);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState<"All" | "Public" | "Private">("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [campaignsState, setCampaignsState] = useState<CampaignPublic[]>([]);
  const [loadingState, setLoadingState] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limitPerPage = 8;
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const lastCategoryRef = useRef<string>("All");
  const hasInitialFetchRef = useRef(false);

  const campaigns = campaignsProp ?? campaignsState;
  const loading = loadingProp ?? loadingState;
  const error = errorProp ?? errorState;

  const categoryOptions = [
    { label: "All", value: "All" },
    { label: "DeFi", value: "defi" },
    { label: "Game", value: "game" },
    { label: "RWA", value: "rwa" },
    { label: "NFT", value: "nft" },
    { label: "Social", value: "social" },
    { label: "DAO", value: "dao" },
    { label: "Staking", value: "staking" },
    { label: "GameFi", value: "gamefi" },
    { label: "Trading", value: "trading" },
    { label: "Neo Bank", value: "neo-bank" },
    { label: "Prediction Market", value: "prediction-market" },
    { label: "Other", value: "other" },
  ];

  const selectedCategoryRef = useRef(selectedCategory);
  
  useEffect(() => {
    selectedCategoryRef.current = selectedCategory;
  }, [selectedCategory]);

  const fetchCampaigns = useCallback(
    async (page: number = 1, category?: string) => {
      if (isControlled) return;

      // Cancela request anterior para evitar respostas atrasadas sobrescrevendo estado.
      const controller = new AbortController();
      abortControllerRef.current?.abort();
      abortControllerRef.current = controller;

      const requestId = ++requestIdRef.current;

      try {
        setLoadingState(true);
        setErrorState(null);

        const categoryToUse = category ?? selectedCategoryRef.current;
        const selectedOption = categoryOptions.find((cat) => cat.label === categoryToUse);
        const categoryValue = selectedOption?.value;
        const filters: CampaignFilters = {
          page,
          limit: limitPerPage,
          ...(categoryValue &&
            categoryValue !== "All" && { category: categoryValue }),
        };

        const response = await campaignApi.getAllCampaigns(filters, controller.signal);

        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        if (!response) throw new Error("Invalid API response");

        setCampaignsState((response.campaigns || []) as CampaignPublic[]);
        setTotalPages(response.totalPages || 0);
        setCurrentPage(response.page || 1);
      } catch (err: unknown) {
        // Ignore cancelamentos (AbortController).
        const errName = (typeof err === "object" && err && "name" in err)
          ? (err as { name?: unknown }).name
          : undefined;
        if (controller.signal.aborted || errName === "AbortError") return;

        console.error("Error fetching campaigns:", err);
        setErrorState("Failed to load campaigns. Please try again.");
      } finally {
        // Só atualiza loading quando for a última request válida.
        if (!controller.signal.aborted && requestId === requestIdRef.current) {
          setLoadingState(false);
        }
      }
    },
    [isControlled]
  );

  const fetchCampaignsRef = useRef(fetchCampaigns);
  useEffect(() => {
    fetchCampaignsRef.current = fetchCampaigns;
  }, [fetchCampaigns]);

  useEffect(() => {
    if (isControlled) return;

    if (!hasInitialFetchRef.current) {
      hasInitialFetchRef.current = true;
      lastCategoryRef.current = selectedCategory;
      fetchCampaignsRef.current(1, selectedCategory);
    } else if (selectedCategory !== lastCategoryRef.current) {
      lastCategoryRef.current = selectedCategory;
      fetchCampaignsRef.current(1, selectedCategory);
    }
  }, [selectedCategory, isControlled]);

  useEffect(() => {
    if (isControlled) {
      setCurrentPage(1);
      setTotalPages(1);
    }
  }, [campaignsProp, isControlled]);

  const [globalCategories, setGlobalCategories] = useState<Set<string> | null>(null);
  const [globalCountries, setGlobalCountries] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (isControlled) {
      const cats = new Set<string>();
      const ctry = new Set<string>();
      (campaignsProp || []).forEach((c) => {
        c.content_categories?.forEach((cat) => {
          if (cat.slug) cats.add(cat.slug.toLowerCase());
        });
        c.country?.forEach((co) => {
          if (co.name?.trim()) {
            const trimmed = co.name.trim();
            const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
            ctry.add(formatted);
          }
        });
      });
      setGlobalCategories(cats);
      setGlobalCountries(ctry);
    } else {
      // Fetch broadly to extract ALL active categories and countries in the DB
      campaignApi
        .getAllCampaigns({ limit: 1000 })
        .then((res) => {
          const cats = new Set<string>();
          const ctry = new Set<string>();
          res.campaigns.forEach((c) => {
            c.content_categories?.forEach((cat) => {
              if (cat.slug) cats.add(cat.slug.toLowerCase());
            });
            c.country?.forEach((co) => {
              if (co.name?.trim()) {
                const trimmed = co.name.trim();
                const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
                ctry.add(formatted);
              }
            });
          });
          setGlobalCategories(cats);
          setGlobalCountries(ctry);
        })
        .catch(console.error);
    }
  }, [isControlled, campaignsProp]);

  const activeCategoryOptions = useMemo(() => {
    if (!globalCategories) return categoryOptions;
    return categoryOptions.filter(
      (c) => c.value === "All" || globalCategories.has(c.value.toLowerCase())
    );
  }, [globalCategories]);

  const countryOptions = useMemo(() => {
    if (!globalCountries) return ["All"];
    return ["All", ...Array.from(globalCountries).sort((a, b) => a.localeCompare(b))];
  }, [globalCountries]);

  const filteredCampaigns = useMemo(() => {
    let list = campaigns || [];

    if (visibilityFilter === "Public") {
      list = list.filter((c) => !c.isPrivate);
    } else if (visibilityFilter === "Private") {
      list = list.filter((c) => c.isPrivate === true);
    }

    if (selectedCategory !== "All") {
      list = list.filter((campaign) =>
        campaign.content_categories?.some((cat) =>
          cat.slug?.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }

    if (selectedCountry !== "All") {
      list = list.filter((campaign) =>
        campaign.country?.some(
          (c) => c.name?.trim().toLowerCase() === selectedCountry.toLowerCase()
        )
      );
    }

    return list;
  }, [campaigns, selectedCategory, visibilityFilter, selectedCountry]);

  return (
    <div className={noTopPadding ? "pt-6 pb-12" : "py-12"}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-white">
          Explore Campaigns
        </h2>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors cursor-pointer"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
            Filters
          </span>
          <svg
            className={`w-5 h-5 text-white/60 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {filtersOpen && (
          <div className="border-t border-white/10 p-5 md:p-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Category
                </span>
                <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 -mx-1">
                  {activeCategoryOptions.map((category) => (
                    <button
                      key={category.label}
                      onClick={() => setSelectedCategory(category.label)}
                      className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        selectedCategory === category.label
                          ? "bg-[var(--color-background-card-campaign)] text-white shadow-sm"
                          : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Type
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(["All", "Public", "Private"] as const).map((value) => (
                      <button
                        key={value}
                        onClick={() => setVisibilityFilter(value)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                          visibilityFilter === value
                            ? "bg-[var(--color-background-card-campaign)] text-white shadow-sm"
                            : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        {value === "All" ? "All Campaigns" : value}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3 flex-1 min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Country
                  </span>
                  <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 -mx-1">
                    {countryOptions.map((country) => (
                      <button
                        key={country}
                        onClick={() => setSelectedCountry(country)}
                        className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                          selectedCountry === country
                            ? "bg-[var(--color-background-card-campaign)] text-white shadow-sm"
                            : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        {country === "All" ? "All Countries" : country}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && !loading && (
        <div className="text-center py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-red-400 text-lg font-semibold mb-2">
                Error loading campaigns
              </h3>
              <button
                onClick={() => fetchCampaigns(currentPage)}
                className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`relative grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 transition-opacity duration-300 ${
          loading && campaigns.length > 0 ? "opacity-60" : "opacity-100"
        }`}
      >
        {loading && campaigns.length > 0 && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/20"
            aria-hidden
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span className="text-sm text-white/80">Loading...</span>
            </div>
          </div>
        )}
        {filteredCampaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}

        {!loading && filteredCampaigns.length === 0 && !error && (
          <div className="col-span-2 text-center py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-blue-400 text-lg font-semibold mb-2">
                  Information
                </h3>
                <p className="text-white text-lg">
                  You don&apos;t have any campaigns at the moment
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {(() => {
        const resolvedTotalPages = isControlled ? (totalPagesProp ?? 0) : totalPages;
        const resolvedCurrentPage = isControlled ? (currentPageProp ?? 1) : currentPage;
        const showPagination = campaigns.length > 0 && resolvedTotalPages > 1;

        if (!showPagination) return null;

        const handlePrev = () => {
          if (isControlled && onPageChange) {
            onPageChange(resolvedCurrentPage - 1);
          } else {
            fetchCampaigns(resolvedCurrentPage - 1);
          }
        };

        const handleNext = () => {
          if (isControlled && onPageChange) {
            onPageChange(resolvedCurrentPage + 1);
          } else {
            fetchCampaigns(resolvedCurrentPage + 1);
          }
        };

        return (
          <div className="flex justify-center items-center gap-4 mt-8 py-4">
            <button
              onClick={handlePrev}
              disabled={resolvedCurrentPage <= 1 || loading}
              className="cursor-pointer px-4 py-2 bg-[var(--color-card)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>

            <span className="text-white min-w-[6rem] text-center">
              Page {resolvedCurrentPage} of {resolvedTotalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={resolvedCurrentPage >= resolvedTotalPages || loading}
              className="cursor-pointer px-4 py-2 bg-[var(--color-card)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
        );
      })()}
    </div>
  );
}
