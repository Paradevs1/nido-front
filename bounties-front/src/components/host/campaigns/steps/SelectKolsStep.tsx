"use client";

import { useState, useEffect, useMemo } from "react";
import { getKols } from "@/lib/api/host";
import type { Kol } from "@/lib/api/host";
import { CampaignFormData, KolReward } from "../types";
import { useDebounce } from "@/hooks/useDebounce";
import { FaXmark, FaCheck } from "react-icons/fa6";
import TwitterAvatar from "@/components/ui/TwitterAvatar";
import CustomSelect from "@/components/ui/CustomSelect";

interface SelectKolsStepProps {
  data: CampaignFormData;
  onChange: (data: CampaignFormData) => void;
}

export default function SelectKolsStep({
  data,
  onChange,
}: SelectKolsStepProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [kols, setKols] = useState<Kol[]>([]);
  const [allKolsCache, setAllKolsCache] = useState<Record<string, Kol>>({});
  const [loading, setLoading] = useState(false);
  const [selectedKols, setSelectedKols] = useState<KolReward[]>(
    data.list_kols || []
  );
  const [defaultReward, setDefaultReward] = useState<number>(0);
  const [customRewards, setCustomRewards] = useState<Record<string, number>>({});
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const handleCacChange = (checked: boolean) => {
    const updatedData = { ...data, is_cac: checked };
    if (!checked) {
      delete updatedData.format_cac;
      delete updatedData.quantity_conversion;
      delete updatedData.cac_value_per_conversion;
      delete updatedData.cac_max_amount_per_creator;
    }
    onChange(updatedData);
  };

  // Fetch KOLs based on search and pagination
  useEffect(() => {
    const fetchKols = async () => {
      try {
        setLoading(true);
        const response = await getKols(debouncedSearch || undefined, currentPage, 10);
        const kolsList = response.kols || [];
        setKols(kolsList);
        
        // Atualizar informações de paginação
        if (response.pagination) {
          const total = response.pagination.totalPages || 
                        Math.ceil((response.pagination.total || 0) / (response.pagination.limit || 10));
          setTotalPages(total);
        }
        
        // Atualizar cache de todos os KOLs
        setAllKolsCache((prevCache) => {
          const newCache = { ...prevCache };
          kolsList.forEach((kol) => {
            newCache[kol.id] = kol;
          });
          return newCache;
        });
        
        if (!initialLoadDone) {
          setInitialLoadDone(true);
        }
      } catch (error) {
        console.error("Error fetching KOLs:", error);
        setKols([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKols();
  }, [debouncedSearch, currentPage, initialLoadDone]);

  // Não precisamos mais do segundo useEffect
  // Os KOLs selecionados já são buscados no primeiro useEffect

  const isCacMode = data.is_cac || false;

  const updateKolsList = (kolsList: KolReward[]) => {
    // Se for modo CAC, total_prize_pool = qtd de creators * máximo por creator
    if (isCacMode) {
      const creatorsCount = kolsList.length;
      const maxPerCreator = Number(data.cac_max_amount_per_creator) || 0;
      onChange({
        ...data,
        list_kols: kolsList,
        total_prize_pool: creatorsCount * maxPerCreator,
      });
    } else {
      // Calcular total_prize_pool apenas se não for CAC
      const total = kolsList.reduce((sum, k) => sum + (k.amount || 0), 0);
      onChange({ ...data, list_kols: kolsList, total_prize_pool: total });
    }
  };

  const handleSelectKol = (kol: Kol) => {
    if (!selectedKols.find((k) => k.userId === kol.id)) {
      let amount = 0;
      
      // Se não for modo CAC, usar lógica de valor
      if (!isCacMode) {
        // Se tiver valor customizado, usa ele, senão usa o default
        amount = customRewards[kol.id] !== undefined 
          ? customRewards[kol.id] 
          : defaultReward;
      }
      
      const newSelected = [
        ...selectedKols,
        { userId: kol.id, amount },
      ];
      setSelectedKols(newSelected);
      updateKolsList(newSelected);
      
      // Adicionar ao cache
      setAllKolsCache({ ...allKolsCache, [kol.id]: kol });
    }
  };

  const handleRemoveKol = (userId: string) => {
    const newSelected = selectedKols.filter((k) => k.userId !== userId);
    const newCustomRewards = { ...customRewards };
    delete newCustomRewards[userId];
    setCustomRewards(newCustomRewards);
    setSelectedKols(newSelected);
    updateKolsList(newSelected);
  };

  const handleDefaultRewardChange = (value: number) => {
    setDefaultReward(value);
    
    // Atualizar todos os KOLs que não têm valor customizado
    const updatedKols = selectedKols.map((kol) => {
      if (customRewards[kol.userId] === undefined) {
        return { ...kol, amount: value };
      }
      return kol;
    });
    
    setSelectedKols(updatedKols);
    updateKolsList(updatedKols);
  };

  const handleAmountChange = (userId: string, amount: number) => {
    // Salvar como valor customizado (tem prioridade sobre o default)
    const newCustomRewards = { ...customRewards, [userId]: amount };
    setCustomRewards(newCustomRewards);
    
    const newSelected = selectedKols.map((k) =>
      k.userId === userId ? { ...k, amount } : k
    );
    setSelectedKols(newSelected);
    updateKolsList(newSelected);
  };

  const isKolSelected = (kolId: string) => {
    return selectedKols.some((k) => k.userId === kolId);
  };

  const getSelectedKol = (kolId: string) => {
    return selectedKols.find((k) => k.userId === kolId);
  };

  const handleKolClick = (kol: Kol) => {
    if (isKolSelected(kol.id)) {
      handleRemoveKol(kol.id);
    } else {
      handleSelectKol(kol);
    }
  };

  // Resetar para página 1 quando buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Ordenar KOLs: selecionados primeiro, depois os não selecionados
  const sortedKols = useMemo(() => {
    const selected: Kol[] = [];
    const notSelected: Kol[] = [];
    
    kols.forEach((kol) => {
      if (isKolSelected(kol.id)) {
        selected.push(kol);
      } else {
        notSelected.push(kol);
      }
    });
    
    return [...selected, ...notSelected];
  }, [kols, selectedKols]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white mb-8">
        Select Creators for Your Private Campaign
      </h2>

      {/* CAC - Customer Acquisition Cost */}
      {(
        <div className="pb-4 border-b border-white/10">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                id="campaign-is-cac"
                checked={data.is_cac || false}
                onChange={(e) => handleCacChange(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  data.is_cac
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                    : "border-white/30 bg-transparent group-hover:border-white/50"
                }`}
              >
                {data.is_cac && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-white text-md font-medium">
              CAC - Customer Acquisition Cost
            </span>
          </label>
          {data.is_cac && (
            <div className="mt-3 ml-8 space-y-3">
              <p className="text-gray-400 text-sm">
                Payment system will be changed to CAC mode
              </p>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  CAC Format <span className="text-[var(--color-primary)]">*</span>
                </label>
                <CustomSelect
                  id="campaign-format-cac"
                  options={[
                    { value: "clicks", label: "Clicks" },
                    { value: "view", label: "Views" },
                  ]}
                  value={data.format_cac || ""}
                  onChange={(value) =>
                    onChange({ ...data, format_cac: value as 'clicks' | 'view' })
                  }
                  placeholder="Select CAC format"
                />
                <p className="text-gray-400 text-xs mt-1">
                  Defines how conversions are measured: by link clicks or content views
                </p>
              </div>
              {data.format_cac && (
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    {data.format_cac === 'clicks' ? 'Clicks' : 'Views'} per Conversion{" "}
                    <span className="text-[var(--color-primary)]">*</span>
                  </label>
                  <input
                    id="campaign-quantity-conversion"
                    type="number"
                    min="1"
                    step="1"
                    value={data.quantity_conversion || ""}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        quantity_conversion: Number(e.target.value),
                      })
                    }
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder={data.format_cac === 'clicks' ? "e.g., 10" : "e.g., 1000"}
                    className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    How many {data.format_cac === 'clicks' ? 'clicks' : 'views'} count as 1 conversion
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Search Creators{" "}
            <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username..."
            className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
          />
        </div>

        {/* CAC Mode Fields */}
        {isCacMode ? (
          <>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Value per Conversion ($){" "}
                <span className="text-[var(--color-primary)]">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={data.cac_value_per_conversion || ""}
                onChange={(e) => {
                  onChange({
                    ...data,
                    cac_value_per_conversion: Number(e.target.value),
                  });
                }}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="10.00"
                className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
              />
              <p className="text-gray-400 text-xs mt-2">
                Amount paid per converted user (e.g., $10 per conversion)
              </p>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Maximum Amount per Creator ($){" "}
                <span className="text-[var(--color-primary)]">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={data.cac_max_amount_per_creator || ""}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  const creatorsCount = selectedKols.length;
                  onChange({
                    ...data,
                    cac_max_amount_per_creator: value,
                    total_prize_pool: creatorsCount * value, // Total Reward Pool = creators * maximum per creator
                  });
                }}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="1000.00"
                className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
              />
              <p className="text-gray-400 text-xs mt-2">
                Maximum amount a creator can receive regardless of conversion count (e.g., $1000 max)
              </p>
              {data.cac_value_per_conversion && data.cac_max_amount_per_creator && (
                <p className="text-gray-400 text-xs mt-1">
                  Maximum conversions: {Math.floor((data.cac_max_amount_per_creator || 0) / (data.cac_value_per_conversion || 1))} users
                </p>
              )}
            </div>
          </>
        ) : (
          /* Default Reward Input - Only show when NOT in CAC mode */
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Default Reward Amount{" "}
              <span className="text-gray-400 text-xs">(applies to all selected creators)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={defaultReward || ""}
              onChange={(e) => handleDefaultRewardChange(Number(e.target.value))}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="0.00"
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
            />
            {selectedKols.length > 0 && defaultReward > 0 && (
              <p className="text-gray-400 text-xs mt-2">
                This amount will be applied to {selectedKols.filter(k => customRewards[k.userId] === undefined).length} creator{selectedKols.filter(k => customRewards[k.userId] === undefined).length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </div>

      {/* KOLs List - Unified */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Creators</h3>
          {selectedKols.length > 0 && (
            <span className="text-sm text-gray-400">
              {selectedKols.length} selected
            </span>
          )}
        </div>
        {loading ? (
          <div className="text-gray-400 text-center py-8 rounded-full">Loading...</div>
        ) : kols.length === 0 ? (
          <div className="text-gray-400 text-center py-8 rounded-full">
            {searchTerm
              ? "No creators found matching your search"
              : "No creators available"}
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {sortedKols.map((kol) => {
                const isSelected = isKolSelected(kol.id);
                const selectedKol = getSelectedKol(kol.id);
                const kolInfo = allKolsCache[kol.id] || kol;

                return (
                  <div
                    key={kol.id}
                    onClick={() => handleKolClick(kol)}
                    className="w-full bg-[var(--color-card)] rounded-full p-3 border border-white/10 hover:border-white/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-[var(--color-primary)]/20">
                          <TwitterAvatar
                            src={kolInfo?.twitter_profile_image}
                            alt={kolInfo?.username || "Creator"}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate text-sm">
                            {kolInfo?.username || "Unknown"}
                          </p>
                        </div>
                        {/* Only show reward input when NOT in CAC mode */}
                        {isSelected && selectedKol && !isCacMode && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <label className="text-white text-xs font-medium whitespace-nowrap">
                              Reward:
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={selectedKol.amount || ""}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleAmountChange(
                                  selectedKol.userId,
                                  Number(e.target.value)
                                );
                              }}
                              onWheel={(e) => {
                                e.stopPropagation();
                                e.currentTarget.blur();
                              }}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="0.00"
                              className="w-20 bg-transparent text-white placeholder:text-white/60 px-2 py-1 rounded-full border border-white/30 outline-none focus:border-[var(--color-primary)] transition-all text-xs"
                            />
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                            <FaCheck className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="cursor-pointer px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="cursor-pointer px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
