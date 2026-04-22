"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FiX,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { FaBroom, FaSearch } from "react-icons/fa";
import {
  CampaignDetails,
  CampaignSubmission,
  getCampaignSubmissions,
  saveWinners,
  getWinners,
} from "@/lib/api/host";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";

const DESKTOP_ITEMS_PER_PAGE = 10;
const MOBILE_ITEMS_PER_PAGE = 6;

interface SelectWinnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignDetails;
  onSave?: () => void;
}

interface WinnerRow {
  submission: CampaignSubmission;
  rank: number;
  valueAmount: number;
}

export default function SelectWinnersModal({
  isOpen,
  onClose,
  campaign,
  onSave,
}: SelectWinnersModalProps) {
  const [allSubmissions, setAllSubmissions] = useState<CampaignSubmission[]>(
    []
  );
  const [winners, setWinners] = useState<Map<string, WinnerRow>>(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobilePage, setMobilePage] = useState(1);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showTiers, setShowTiers] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const { showToast, hideToast, toast } = useToast();

  // Resetar página e busca quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setMobilePage(1);
      setSearchTerm("");
    }
  }, [isOpen]);

  // Resetar para primeira página quando o termo de busca muda
  useEffect(() => {
    setCurrentPage(1);
    setMobilePage(1);
  }, [searchTerm]);

  // Fetch TODOS os submissions uma vez quando o modal abre
  useEffect(() => {
    if (isOpen && campaign.id) {
      const fetchAllSubmissions = async () => {
        try {
          setIsLoading(true);
          setError(null);

          // Carregar todos os dados de uma vez (limit alto para pegar tudo)
          const [submissionsResponse, winnersResponse] = await Promise.all([
            getCampaignSubmissions(campaign.id, 1, 9999),
            getWinners(campaign.id).catch(() => ({ winners: [] })),
          ]);

          const fetchedSubmissions = submissionsResponse.leaderboard || [];
          const existingWinners = winnersResponse.winners || [];

          setAllSubmissions(fetchedSubmissions);

          // Create a map of existing winners by user_id
          const winnersByUserId = new Map<
            string,
            { rank: number; value_amount: number }
          >();
          existingWinners.forEach((winner) => {
            winnersByUserId.set(winner.user_id, {
              rank: winner.rank,
              value_amount: winner.value_amount || 0,
            });
          });

          // Initialize winners with existing ranks or 0
          const initialWinners = new Map<string, WinnerRow>();
          fetchedSubmissions.forEach((sub: CampaignSubmission) => {
            const existingWinner = winnersByUserId.get(sub.user_id);
            const rank = existingWinner ? existingWinner.rank : 0;
            const valueAmount = existingWinner
              ? existingWinner.value_amount
              : 0;

            initialWinners.set(String(sub.ordem), {
              submission: sub,
              rank: rank,
              valueAmount: valueAmount,
            });
          });
          setWinners(initialWinners);
        } catch (err: unknown) {
          console.error("Error fetching submissions:", err);
          setAllSubmissions([]);
          setWinners(new Map());
          const message =
            err instanceof Error ? err.message : "Failed to load submissions";
          setError(message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAllSubmissions();
    }
  }, [isOpen, campaign.id]);

  const handleRankChange = (submissionOrdem: string, rank: number) => {
    const newWinners = new Map(winners);
    const current = newWinners.get(submissionOrdem);
    if (current) {
      // Se o rank for 0, apenas remove o rank sem verificar duplicatas
      if (rank === 0) {
        const valueAmount = calculateValueAmount(0);
        newWinners.set(submissionOrdem, {
          ...current,
          rank: 0,
          valueAmount: valueAmount,
        });
        setWinners(newWinners);
        return;
      }

      // Se o rank for maior que 0, verifica se já existe outro vencedor com esse rank
      // Se existir, remove o rank desse outro vencedor (define como 0)
      newWinners.forEach((winner, key) => {
        if (key !== submissionOrdem && winner.rank === rank) {
          newWinners.set(key, {
            ...winner,
            rank: 0,
            valueAmount: 0,
          });
        }
      });

      // Calculate value based on rank and tiers
      const valueAmount = calculateValueAmount(rank);
      newWinners.set(submissionOrdem, {
        ...current,
        rank: rank,
        valueAmount: valueAmount,
      });
      setWinners(newWinners);
    }
  };

  const handleDragStart = (submissionOrdem: string) => {
    setDraggedItem(submissionOrdem);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetSubmissionOrdem: string) => {
    if (!draggedItem || draggedItem === targetSubmissionOrdem) {
      setDraggedItem(null);
      return;
    }

    // Create an ordered array of winners based on the current state
    const currentSortedArray = filteredSubmissions
      .map(
        (sub) =>
          winners.get(String(sub.ordem)) || {
            submission: sub,
            rank: 0,
            valueAmount: 0,
          }
      )
      .sort((a, b) => {
        if (a.rank === 0 && b.rank === 0) return 0;
        if (a.rank === 0) return 1;
        if (b.rank === 0) return -1;
        return a.rank - b.rank;
      });

    const draggedIndex = currentSortedArray.findIndex(
      (w) => String(w.submission.ordem) === draggedItem
    );
    const targetIndex = currentSortedArray.findIndex(
      (w) => String(w.submission.ordem) === targetSubmissionOrdem
    );

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    // Remove the dragged item and insert it at the new position
    const [removed] = currentSortedArray.splice(draggedIndex, 1);
    currentSortedArray.splice(targetIndex, 0, removed);

    // Reassign ranks based on the new position
    // All items up to the drop position receive sequential ranks
    const newWinners = new Map<string, WinnerRow>();
    let currentRank = 1;

    currentSortedArray.forEach((winner, index) => {
      // Assign sequential rank to all items up to the drop position (including the dragged item)
      if (index <= targetIndex) {
        const newRank = currentRank++;
        const valueAmount = calculateValueAmount(newRank);
        newWinners.set(String(winner.submission.ordem), {
          ...winner,
          rank: newRank,
          valueAmount: valueAmount,
        });
      } else {
        // Keep the current state for items after the drop position
        // If it had a rank before, keep it, otherwise keep rank 0
        newWinners.set(String(winner.submission.ordem), winner);
      }
    });

    // For all other items not in the ordered list
    winners.forEach((winner, id) => {
      if (!newWinners.has(id)) {
        newWinners.set(id, winner);
      }
    });

    setWinners(newWinners);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const calculateValueAmount = (rank: number): number => {
    if (!campaign.reward_tiers || rank === 0) return 0;

    // Find the tier corresponding to the rank
    for (const tier of campaign.reward_tiers) {
      if (rank >= tier.position_initial && rank <= tier.position_final) {
        return tier.payment_amount;
      }
    }
    return 0;
  };

  const clearSelection = () => {
    const clearedWinners = new Map<string, WinnerRow>();
    allSubmissions.forEach((sub: CampaignSubmission) => {
      clearedWinners.set(String(sub.ordem), {
        submission: sub,
        rank: 0,
        valueAmount: 0,
      });
    });
    setWinners(clearedWinners);
  };

  const getSubmissionUrls = (
    submission: CampaignSubmission
  ): Array<{ type: string; url: string }> => {
    const urls: Array<{ type: string; url: string }> = [];
    if (submission.submission_twitter)
      urls.push({ type: "Twitter", url: submission.submission_twitter });
    if (submission.submission_instagram)
      urls.push({ type: "Instagram", url: submission.submission_instagram });
    if (submission.submission_tiktok)
      urls.push({ type: "TikTok", url: submission.submission_tiktok });
    if (submission.submission_youtube)
      urls.push({ type: "YouTube", url: submission.submission_youtube });
    return urls;
  };

  // Helper function for backward compatibility (used in filter/search)
  const getSubmissionUrl = (submission: CampaignSubmission): string | null => {
    const urls = getSubmissionUrls(submission);
    return urls.length > 0 ? urls.map((u) => u.url).join(" ") : null;
  };

  const handleRowMouseEnter = (
    submission: CampaignSubmission,
    event: React.MouseEvent<HTMLTableRowElement>
  ) => {
    const rowElement = event.currentTarget;
    const rect = rowElement.getBoundingClientRect();
    setHoveredRow(submission.user_id || `submission-${submission.ordem}`);
    setTooltipPosition({
      x: rect.right + 10,
      y: rect.top,
    });
  };

  const handleRowMouseLeave = () => {
    setHoveredRow(null);
  };

  const getEngagement = (submission: CampaignSubmission): number => {
    const likes = submission.likes_twitter || 0;
    const retweets = submission.retweets_twitter || 0;
    return likes + retweets;
  };

  const getRankOptions = () => {
    let maxRank = 0;

    if (campaign.reward_tiers && campaign.reward_tiers.length > 0) {
      maxRank = Math.max(
        ...campaign.reward_tiers.map((tier) => tier.position_final)
      );
    }

    const options: { value: string; label: string }[] = [{ value: "", label: "—" }];
    for (let i = 1; i <= maxRank; i++) {
      options.push({ value: String(i), label: String(i) });
    }
    return options;
  };

  // Filtrar submissions localmente pelo termo de busca
  const filteredSubmissions = useMemo(() => {
    if (!searchTerm.trim()) {
      return allSubmissions;
    }
    return allSubmissions.filter((submission) =>
      submission.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allSubmissions, searchTerm]);

  // Sort by rank (ascending 1,2,3...), keeping rank 0 at the end
  const sortedWinners = useMemo(() => {
    return [...filteredSubmissions]
      .map(
        (sub) =>
          winners.get(String(sub.ordem)) || {
            submission: sub,
            rank: 0,
            valueAmount: 0,
          }
      )
      .sort((a, b) => {
        if (a.rank === 0 && b.rank === 0) return 0;
        if (a.rank === 0) return 1; // rank 0 goes to the end
        if (b.rank === 0) return -1;
        return a.rank - b.rank; // sort ascending (1, 2, 3...)
      });
  }, [filteredSubmissions, winners]);

  // Desktop pagination - paginação local baseada nos dados filtrados
  const totalPages = Math.max(
    1,
    Math.ceil(sortedWinners.length / DESKTOP_ITEMS_PER_PAGE)
  );
  const safeDesktopPage = Math.min(currentPage, totalPages);

  // Paginação local
  const paginatedWinners = sortedWinners.slice(
    (safeDesktopPage - 1) * DESKTOP_ITEMS_PER_PAGE,
    safeDesktopPage * DESKTOP_ITEMS_PER_PAGE
  );

  const totalMobilePages = Math.max(
    1,
    Math.ceil(sortedWinners.length / MOBILE_ITEMS_PER_PAGE)
  );

  const currentMobilePage = Math.min(mobilePage, totalMobilePages);
  const mobileWinners = sortedWinners.slice(
    (currentMobilePage - 1) * MOBILE_ITEMS_PER_PAGE,
    currentMobilePage * MOBILE_ITEMS_PER_PAGE
  );

  const renderMobileCards = () => {
    if (isLoading) {
      return (
        <div className="rounded-2xl border border-white/10 py-6 text-center text-gray-400">
          Loading submissions...
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-500/40 py-6 text-center text-red-400">
          {error}
        </div>
      );
    }

    if (sortedWinners.length === 0) {
      return (
        <div className="rounded-2xl border border-white/10 py-6 text-center text-gray-400">
          No submissions found.
        </div>
      );
    }

    return (
      <div className="space-y-5 pb-4">
        {mobileWinners.map((winnerRow, index) => {
          const submissionUrls = getSubmissionUrls(winnerRow.submission);
          const orderNumber = allSubmissions.indexOf(winnerRow.submission) + 1;

          return (
            <div
              key={`${winnerRow.submission.user_id}-${index}`}
              className="rounded-3xl p-5 border border-white/10 bg-gradient-to-br from-[#061C2C]/80 to-[#04111A]/80 shadow-[0_16px_40px_rgba(3,17,29,0.45)] cursor-pointer relative"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredRow(`${winnerRow.submission.user_id}-${index}`);
                setTooltipPosition({
                  x: rect.right + 10,
                  y: rect.top,
                });
              }}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-white font-semibold text-lg">
                    {winnerRow.submission.username}
                  </h4>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40 mt-2">
                    Submission #{orderNumber}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-white/60 uppercase">Rank</span>
                  <div className="relative">
                    <select
                      value={winnerRow.rank || ""}
                      onChange={(e) => {
                        const rank =
                          e.target.value === ""
                            ? 0
                            : parseInt(e.target.value) || 0;
                        handleRankChange(
                          String(winnerRow.submission.ordem),
                          rank
                        );
                      }}
                      className="w-20 h-12 bg-[#0D2436]/80 border-2 border-white/30 rounded-xl text-white text-center focus:border-[var(--color-primary)] focus:outline-none text-sm font-semibold appearance-none cursor-pointer pl-3 pr-8 hover:border-white/50 transition-colors"
                    >
                      {getRankOptions().map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="bg-[#0D2436] text-white"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl px-4 py-2 border border-white/10 bg-[#0D2436]/60 text-sm text-gray-200">
                <span className="uppercase tracking-[0.2em] text-xs text-white/60">
                  Value Amount
                </span>
                <span className="font-semibold text-green-400">
                  $
                  {winnerRow.valueAmount.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {submissionUrls.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  {submissionUrls.map((urlItem, idx) => (
                    <a
                      key={idx}
                      href={urlItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-white hover:text-[var(--color-primary)] transition-colors"
                    >
                      <FiExternalLink />
                      {urlItem.type}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {totalMobilePages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-400">
            <button
              onClick={() => setMobilePage((prev) => Math.max(1, prev - 1))}
              className="cursor-pointer px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40"
              disabled={currentMobilePage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentMobilePage} of {totalMobilePages}
            </span>
            <button
              onClick={() =>
                setMobilePage((prev) => Math.min(totalMobilePages, prev + 1))
              }
              className="cursor-pointer px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40"
              disabled={currentMobilePage === totalMobilePages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleSave = async () => {
    try {
      // Filter winners with rank > 0
      const winnersToSave = Array.from(winners.values())
        .filter((w) => w.rank > 0)
        .map((w) => ({
          user_id: w.submission.user_id,
          rank: w.rank,
        }));

      if (winnersToSave.length === 0) {
        alert("Please select at least one winner before saving.");
        return;
      }

      const ranks = winnersToSave.map((w) => w.rank);
      const uniqueRanks = new Set(ranks);
      if (ranks.length !== uniqueRanks.size) {
        alert(
          "Não é permitido ter ranks duplicados. Por favor, corrija antes de salvar."
        );
        return;
      }

      await saveWinners(campaign.id, winnersToSave);

      showToast("Winners saved successfully!", "success", 1500);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      console.error("Error saving winners:", err);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          <div className="relative z-10 bg-[var(--color-card)] rounded-2xl p-6 md:p-8 w-full max-w-4xl text-white max-h-[90vh] flex flex-col">
            <button
              aria-label="Close"
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-white"
            >
              <FiX size={20} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-2xl font-bold">Select Winners</h2>
              {/* Total do Prize */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/20 border border-blue-500 rounded-full">
                <span className="text-xm text-gray-300">Total Prize:</span>
                <span className="text-xm text-white font-bold">
                  {campaign.total_prize_pool}{" "}
                  {campaign.payment_token?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Reward Tiers Section */}
            {campaign.reward_tiers && campaign.reward_tiers.length > 0 && (
              <div className="mb-3 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowTiers((prev) => !prev)}
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-200 cursor-pointer"
                >
                  <span>Reward Tiers</span>
                  {showTiers ? (
                    <FiChevronUp className="w-5 h-5 text-gray-400 cursor-pointer" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-gray-400 cursor-pointer" />
                  )}
                </button>

                {showTiers && (
                  <div className="space-y-3">
                    {campaign.reward_tiers.map((tier, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
                      >
                        <div className="text-sm text-gray-400 whitespace-nowrap">
                          Tier {index + 1} Winners:
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="text-xs sm:text-sm text-gray-300 uppercase tracking-wide">
                            From
                          </span>
                          <input
                            type="number"
                            value={tier.position_initial}
                            readOnly
                            className="w-16 px-3 py-1.5 bg-transparent border border-white/30 rounded-full text-white text-center text-sm"
                          />
                          <span className="text-xs sm:text-sm text-gray-300 uppercase tracking-wide">
                            To
                          </span>
                          <input
                            type="number"
                            value={tier.position_final}
                            readOnly
                            className="w-16 px-3 py-1.5 bg-transparent border border-white/30 rounded-full text-white text-center text-sm"
                          />
                          <span className="text-xs sm:text-sm text-gray-300 uppercase tracking-wide whitespace-nowrap">
                            Reward per winner
                          </span>
                          <input
                            type="text"
                            value={`$ ${tier.payment_amount.toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}`}
                            readOnly
                            className="w-28 px-3 py-1.5 bg-transparent border border-white/30 rounded-full text-white text-center text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search and Clear Selection */}
            <div className="mb-3">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-300 whitespace-nowrap">
                  Define winners
                </label>
                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search for creators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 bg-transparent text-white rounded-full border border-gray-600 hover:border-white focus:border-white focus:outline-none transition-colors placeholder:text-gray-500 text-sm"
                  />
                </div>
                <button
                  onClick={clearSelection}
                  className="cursor-pointer px-4 py-2 border border-white/50 text-white rounded-full font-medium hover:bg-white/10 transition-all flex items-center gap-2 whitespace-nowrap text-sm"
                >
                  <FaBroom className="w-4 h-4" />
                  CLEAR SELECTION
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-[400px] -mx-2">
              <div className="hidden md:flex bg-[var(--color-card)] rounded-2xl overflow-hidden flex-1 flex-col min-h-[350px]">
                {/* Fixed Header */}
                <div className="bg-white/5 border-b border-white/10">
                  <table className="w-full text-sm table-fixed">
                    <thead>
                      <tr>
                        <th className="text-left py-5 px-6 text-gray-400 font-medium whitespace-nowrap uppercase w-48 min-w-[180px]">
                          Input Rank
                        </th>
                        <th className="text-left py-5 px-6 text-gray-400 font-medium whitespace-nowrap uppercase">
                          User
                        </th>
                        <th className="text-right py-5 px-6 text-gray-400 font-medium whitespace-nowrap uppercase min-w-[140px] w-40">
                          Value Amount
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-sm table-fixed">
                    <tbody>
                      {isLoading ? (
                        <tr key="loading">
                          <td
                            colSpan={3}
                            className="text-center py-8 text-gray-400"
                          >
                            Loading submissions...
                          </td>
                        </tr>
                      ) : paginatedWinners.length === 0 ? (
                        <tr key="empty">
                          <td
                            colSpan={3}
                            className="text-center py-8 text-gray-400"
                          >
                            No submissions found.
                          </td>
                        </tr>
                      ) : (
                        paginatedWinners.map((winner, index) => {
                          const submissionUrls = getSubmissionUrls(
                            winner.submission
                          );
                          // Calcular índice global para alternar cores das linhas
                          const globalIndex =
                            (safeDesktopPage - 1) * DESKTOP_ITEMS_PER_PAGE +
                            index +
                            1;
                          const isEven = globalIndex % 2 === 0;

                          return (
                            <tr
                              key={String(winner.submission.ordem)}
                              className={`${
                                isEven ? "bg-white/5" : "bg-transparent"
                              } border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer relative ${
                                draggedItem === String(winner.submission.ordem)
                                  ? "opacity-50"
                                  : ""
                              }`}
                              draggable
                              onDragStart={() =>
                                handleDragStart(String(winner.submission.ordem))
                              }
                              onDragOver={handleDragOver}
                              onDrop={() =>
                                handleDrop(String(winner.submission.ordem))
                              }
                              onDragEnd={handleDragEnd}
                              onMouseEnter={(e) =>
                                handleRowMouseEnter(winner.submission, e)
                              }
                              onMouseLeave={handleRowMouseLeave}
                            >
                              <td className="py-4 px-6 w-48 min-w-[180px]">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="cursor-move text-gray-400 shrink-0"
                                    draggable={false}
                                  >
                                    ⋮⋮
                                  </span>
                                  <div className="relative min-w-0 flex-1">
                                    <select
                                      value={winner.rank || ""}
                                      onChange={(e) => {
                                        const rank =
                                          e.target.value === ""
                                            ? 0
                                            : parseInt(e.target.value) || 0;
                                        handleRankChange(
                                          String(winner.submission.ordem),
                                          rank
                                        );
                                      }}
                                      className="w-full max-w-20 h-12 bg-[#0D2436]/80 border-2 border-white/30 rounded-xl text-white text-center focus:border-[var(--color-primary)] focus:outline-none text-sm font-semibold appearance-none cursor-pointer pl-3 pr-8 hover:border-white/50 transition-colors"
                                      draggable={false}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {getRankOptions().map((option) => (
                                        <option
                                          key={option.value}
                                          value={option.value}
                                          className="bg-[#0D2436] text-white"
                                        >
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                    <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none w-4 h-4" />
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-white font-medium truncate">
                                {winner.submission.username}
                              </td>
                              <td className="py-4 px-6 text-green-400 font-medium text-right whitespace-nowrap min-w-[140px] w-40">
                                $
                                {winner.valueAmount.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {sortedWinners.length > 0 && totalPages > 1 && (
                  <div className="hidden md:flex items-center justify-between gap-6 mt-4 text-sm text-gray-300 pt-4 border-t border-white/10 px-6 pb-4">
                    <span>
                      Page {safeDesktopPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, safeDesktopPage - 1))
                        }
                        className="cursor-pointer px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40"
                        disabled={safeDesktopPage === 1}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(totalPages, safeDesktopPage + 1)
                          )
                        }
                        className="cursor-pointer px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40"
                        disabled={safeDesktopPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="md:hidden overflow-y-auto flex-1 mt-4">
                {renderMobileCards()}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between gap-4">
                <button
                  aria-label="Close"
                  onClick={onClose}
                  className="cursor-pointer px-6 py-3 border border-white/50 text-white rounded-full font-medium hover:bg-white/10 transition-all"
                >
                  BACK
                </button>
                <Button
                  variant="default"
                  className="px-6 py-3 flex items-center font-bold justify-center gap-2 whitespace-nowrap cursor-pointer"
                  onClick={handleSave}
                >
                  SAVE
                </Button>
              </div>

              <div />
            </div>

            {/* Tooltip para desktop */}
            {hoveredRow &&
              paginatedWinners.find(
                (w) =>
                  (w.submission.user_id ||
                    `submission-${w.submission.ordem}`) === hoveredRow
              ) && (
                <div
                  className="fixed z-50 pointer-events-none hidden md:block"
                  style={{
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`,
                  }}
                >
                  {(() => {
                    const winner = paginatedWinners.find(
                      (w) =>
                        (w.submission.user_id ||
                          `submission-${w.submission.ordem}`) === hoveredRow
                    );
                    if (!winner) return null;
                    const submission = winner.submission;
                    return (
                      <div className="bg-gradient-to-br from-[#061C2C]/95 to-[#04111A]/95 rounded-2xl p-5 border border-white/20 shadow-2xl min-w-[240px] backdrop-blur-sm">
                        <div className="text-gray-400 text-sm mb-4">
                          @{submission.username}
                        </div>
                        <div className="text-white text-sm font-medium mb-3">
                          Datas of campaign
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="text-gray-300">
                            Engagement:{" "}
                            {getEngagement(submission).toLocaleString("pt-BR")}
                          </div>
                          <div className="text-gray-300">
                            Retweets: {submission.retweets_twitter || 0}
                          </div>
                          <div className="text-gray-300">
                            Likes: {submission.likes_twitter || 0}
                          </div>
                          <div className="text-gray-300">
                            Views:{" "}
                            {(submission.views_twitter || 0).toLocaleString(
                              "pt-BR"
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

            {/* Tooltip para mobile */}
            {hoveredRow &&
              mobileWinners.find(
                (w, idx) => `${w.submission.user_id}-${idx}` === hoveredRow
              ) && (
                <div
                  className="fixed z-50 pointer-events-none md:hidden"
                  style={{
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`,
                  }}
                >
                  {(() => {
                    const winnerIndex = mobileWinners.findIndex(
                      (w, idx) =>
                        `${w.submission.user_id}-${idx}` === hoveredRow
                    );
                    const winner = mobileWinners[winnerIndex];
                    if (!winner) return null;
                    const submission = winner.submission;
                    return (
                      <div className="bg-gradient-to-br from-[#061C2C]/95 to-[#04111A]/95 rounded-2xl p-5 border border-white/20 shadow-2xl min-w-[240px] backdrop-blur-sm">
                        <div className="text-white text-xl font-semibold mb-1">
                          {submission.username}
                        </div>
                        <div className="text-gray-400 text-sm mb-4">
                          @{submission.username}
                        </div>
                        <div className="text-white text-sm font-medium mb-3">
                          Datas of campaign
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="text-gray-300">
                            Engagement:{" "}
                            {getEngagement(submission).toLocaleString("pt-BR")}
                          </div>
                          <div className="text-gray-300">
                            Post:{" "}
                            {submission.submission_twitter ||
                            submission.submission_instagram ||
                            submission.submission_tiktok ||
                            submission.submission_youtube
                              ? 1
                              : 0}
                          </div>
                          <div className="text-gray-300">
                            Views:{" "}
                            {(submission.views_twitter || 0).toLocaleString(
                              "pt-BR"
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
          </div>
        </div>
      )}

      {/* Toast renderizado fora do modal para aparecer mesmo após fechar */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
    </>
  );
}
