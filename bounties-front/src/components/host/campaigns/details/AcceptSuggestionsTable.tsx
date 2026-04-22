"use client";

import { useState, useEffect, useMemo } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { getSuggestedRatings, SuggestedRating } from "@/lib/api/host";

const MOBILE_ITEMS_PER_PAGE = 6;

type SortField = "rank" | "name" | "mindshare" | "valueAmount" | "link";
type SortDirection = "asc" | "desc";

interface AcceptSuggestionsTableProps {
  campaignId: string;
}

export default function AcceptSuggestionsTable({
  campaignId,
}: AcceptSuggestionsTableProps) {
  const [winners, setWinners] = useState<SuggestedRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [mobilePage, setMobilePage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        setIsLoading(true);
        const response = await getSuggestedRatings(campaignId);
        setWinners(response.ranking || []);
        setError(null);
      } catch (err: unknown) {
        setError(err.message || "Failed to load winners");
        setWinners([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (campaignId) {
      fetchWinners();
    }
  }, [campaignId]);

  const handleSort = (field: SortField) => {
    const newDirection =
      field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };

  const getSubmissionUrls = (
    winner: SuggestedRating
  ): Array<{ type: string; url: string }> => {
    const urls: Array<{ type: string; url: string }> = [];
    if (winner.submission_twitter)
      urls.push({ type: "Twitter", url: winner.submission_twitter });
    if (winner.submission_instagram)
      urls.push({ type: "Instagram", url: winner.submission_instagram });
    if (winner.submission_tiktok)
      urls.push({ type: "TikTok", url: winner.submission_tiktok });
    if (winner.submission_youtube)
      urls.push({ type: "YouTube", url: winner.submission_youtube });
    return urls;
  };

  const getSubmissionUrl = (winner: SuggestedRating): string | null => {
    const urls = getSubmissionUrls(winner);
    return urls.length > 0 ? urls.map((u) => u.url).join(" ") : null;
  };

  const calcTooltipPosition = (clientX: number, clientY: number) => {
    const tooltipWidth = 280;
    const tooltipHeight = 340;
    const offset = 16;
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x = clientX + offset;
    let y = clientY + offset;

    // If overflows right, flip to left of cursor
    if (x + tooltipWidth > vw - margin) {
      x = clientX - tooltipWidth - offset;
    }
    // Clamp left
    if (x < margin) x = margin;
    // If overflows bottom, flip above cursor
    if (y + tooltipHeight > vh - margin) {
      y = clientY - tooltipHeight - offset;
    }
    // Clamp top
    if (y < margin) y = margin;

    return { x, y };
  };

  const handleRowMouseEnter = (winner: SuggestedRating, event: React.MouseEvent) => {
    setHoveredRow(winner.user_id || `winner-${winner.rank}`);
    const pos = calcTooltipPosition(event.clientX, event.clientY);
    setTooltipPosition(pos);
  };

  const handleRowMouseMove = (event: React.MouseEvent) => {
    const pos = calcTooltipPosition(event.clientX, event.clientY);
    setTooltipPosition(pos);
  };

  const handleRowMouseLeave = () => {
    setHoveredRow(null);
  };

  const getEngagement = (winner: SuggestedRating): number => {
    return (winner.likes_twitter || 0) + (winner.retweets_twitter || 0) + (winner.replies_twitter || 0) + (winner.quotes_twitter || 0) + (winner.bookmarks_twitter || 0);
  };

  const sortedWinners = useMemo(() => {
    return [...winners].sort((a, b) => {
      let valA: any, valB: any;

      switch (sortField) {
        case "rank":
          valA = a.rank;
          valB = b.rank;
          break;
        case "name":
          valA = a.username.toLowerCase();
          valB = b.username.toLowerCase();
          break;
        case "mindshare":
          valA = a.mindshare_score || 0;
          valB = b.mindshare_score || 0;
          break;
        case "valueAmount":
          valA = a.amount_received;
          valB = b.amount_received;
          break;
        case "link":
          valA = getSubmissionUrl(a) || "";
          valB = getSubmissionUrl(b) || "";
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [winners, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <FaSort className="inline ml-2 text-gray-500" />;
    return sortDirection === "asc" ? (
      <FaSortUp className="inline ml-2 text-gray-400" />
    ) : (
      <FaSortDown className="inline ml-2 text-gray-400" />
    );
  };

  const headers: { key: SortField | null; label: string }[] = [
    { key: "rank", label: "Campaign Rank" },
    { key: "name", label: "User" },
    { key: "mindshare", label: "Mindshare Score" },
    { key: "valueAmount", label: "Value Amount" },
    { key: "link", label: "Link Post" },
  ];

  const totalPages = Math.max(1, Math.ceil(sortedWinners.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedWinners = sortedWinners.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  useEffect(() => {
    setMobilePage(1);
    setCurrentPage(1);
  }, [sortedWinners.length]);

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
          Loading suggestions...
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
          No suggestions found.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {mobileWinners.map((winner, index) => {
          const submissionUrls = getSubmissionUrls(winner);
          return (
            <div
              key={`${winner.user_id}-${index}`}
              className="rounded-3xl p-5 border border-white/10 bg-gradient-to-br from-[#061C2C]/80 to-[#04111A]/80 shadow-[0_16px_40px_rgba(3,17,29,0.55)] cursor-pointer relative"
              onMouseEnter={(e) => {
                setHoveredRow(`${winner.user_id}-${index}`);
                setTooltipPosition(calcTooltipPosition(e.clientX, e.clientY));
              }}
              onMouseMove={(e) => {
                setTooltipPosition(calcTooltipPosition(e.clientX, e.clientY));
              }}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-white font-semibold text-lg">
                    @{winner.username}
                  </h4>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40 mt-2">
                    Rank • #{winner.rank}
                  </p>
                  <p className="text-xs text-[var(--color-primary)] font-medium mt-1">
                    Mindshare: {(winner.mindshare_score || 0).toFixed(2)}%
                  </p>
                </div>
                <span className="text-xs font-semibold text-green-400 bg-green-500/10 rounded-full px-3 py-1">
                  ${(winner.amount_received || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {submissionUrls.length > 0 ? (
                  submissionUrls.map((urlItem, idx) => (
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
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">No submission links.</span>
                )}
              </div>
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
                setMobilePage((prev) =>
                  Math.min(totalMobilePages, prev + 1)
                )
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

  return (
    <div>
      <div className="hidden md:block bg-[var(--color-card)] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-white/5 border-b border-white/10">
          <tr>
            {headers.map((header) => (
              <th
                key={header.label}
                className="text-left py-5 px-6 text-gray-400 font-medium whitespace-nowrap"
              >
                {header.key ? (
                  <button
                    onClick={() => handleSort(header.key as SortField)}
                    className="flex items-center uppercase hover:text-white transition-colors"
                  >
                    {header.label}
                    <SortIcon field={header.key as SortField} />
                  </button>
                ) : (
                  <span className="uppercase">{header.label}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr key="loading">
              <td
                colSpan={headers.length}
                className="text-center py-8 text-gray-400"
              >
                Loading winners...
              </td>
            </tr>
          ) : error ? (
            <tr key="error">
              <td
                colSpan={headers.length}
                className="text-center py-8 text-red-500"
              >
                {error}
              </td>
            </tr>
          ) : paginatedWinners.length === 0 ? (
            <tr key="empty">
              <td
                colSpan={headers.length}
                className="text-center py-8 text-gray-400"
              >
                Rank recommendations are generated automatically once the
                campaign is complete.
              </td>
            </tr>
          ) : (
            paginatedWinners.map((winner, index) => {
              const submissionUrls = getSubmissionUrls(winner);
              const globalIndex = (currentPage - 1) * itemsPerPage + index;
              const uniqueKey = winner.user_id || `winner-${index}`;

              return (
                <tr
                  key={uniqueKey}
                  className={`${
                    globalIndex % 2 === 0 ? "bg-white/5" : "bg-transparent"
                  } border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer relative`}
                  onMouseEnter={(e) => handleRowMouseEnter(winner, e)}
                  onMouseMove={handleRowMouseMove}
                  onMouseLeave={handleRowMouseLeave}
                >
                  <td className="py-4 px-6 text-gray-300">{winner.rank}</td>
                  <td className="py-4 px-6 text-white font-medium">
                    {winner.username}
                  </td>
                  <td className="py-4 px-6 text-[var(--color-primary)] font-medium">
                    {(winner.mindshare_score || 0).toFixed(2)}%
                  </td>
                  <td className="py-4 px-6 text-green-400 font-medium">
                    $
                    {(winner.amount_received || 0).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-4 px-6">
                    {submissionUrls.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {submissionUrls.map((urlItem, idx) => (
                          <a
                            key={idx}
                            href={urlItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-white hover:underline flex items-center gap-2 transition-colors"
                          >
                            <FiExternalLink />
                            {urlItem.type}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      </div>
      </div>

      {sortedWinners.length > 0 && (
        <div className="hidden md:flex items-center justify-between mt-4 text-sm text-gray-300 px-6 pb-2">
          <span>
            Page {safeCurrentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
              className="cursor-pointer px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40"
              disabled={safeCurrentPage === 1}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))
              }
              className="cursor-pointer px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40"
              disabled={safeCurrentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="md:hidden">{renderMobileCards()}</div>

      {/* Tooltip para desktop */}
      {hoveredRow && paginatedWinners.find((w) => (w.user_id || `winner-${w.rank}`) === hoveredRow) && (
        <div
          className="fixed z-50 pointer-events-none hidden md:block"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          {(() => {
            const winner = paginatedWinners.find((w) => (w.user_id || `winner-${w.rank}`) === hoveredRow);
            if (!winner) return null;
            return (
              <div className="bg-gradient-to-br from-[#061C2C]/95 to-[#04111A]/95 rounded-2xl p-5 border border-white/20 shadow-2xl min-w-[260px] backdrop-blur-sm">
                <div className="text-gray-400 text-sm mb-2">
                  @{winner.username}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[var(--color-primary)] text-lg font-bold">
                    {(winner.mindshare_score || 0).toFixed(2)}%
                  </span>
                  <span className="text-gray-400 text-xs">Mindshare</span>
                </div>
                <div className="text-white text-sm font-medium mb-3">
                  Engagement Details
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Total Engagement</span>
                    <span className="text-white font-medium">{getEngagement(winner).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Views</span>
                    <span className="text-white">{(winner.views_twitter || 0).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Likes</span>
                    <span className="text-white">{(winner.likes_twitter || 0).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Retweets</span>
                    <span className="text-white">{(winner.retweets_twitter || 0).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Replies</span>
                    <span className="text-white">{(winner.replies_twitter || 0).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Quotes</span>
                    <span className="text-white">{(winner.quotes_twitter || 0).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Bookmarks</span>
                    <span className="text-white">{(winner.bookmarks_twitter || 0).toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Tooltip para mobile */}
      {hoveredRow && mobileWinners.find((w, idx) => `${w.user_id}-${idx}` === hoveredRow) && (
        <div
          className="fixed z-50 pointer-events-none md:hidden"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          {(() => {
            const winnerIndex = mobileWinners.findIndex((w, idx) => `${w.user_id}-${idx}` === hoveredRow);
            const winner = mobileWinners[winnerIndex];
            if (!winner) return null;
            return (
              <div className="bg-gradient-to-br from-[#061C2C]/95 to-[#04111A]/95 rounded-2xl p-5 border border-white/20 shadow-2xl min-w-[260px] backdrop-blur-sm">
                <div className="text-gray-400 text-sm mb-2">
                  @{winner.username}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[var(--color-primary)] text-lg font-bold">
                    {(winner.mindshare_score || 0).toFixed(2)}%
                  </span>
                  <span className="text-gray-400 text-xs">Mindshare</span>
                </div>
                <div className="text-white text-sm font-medium mb-3">
                  Engagement Details
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Total Engagement</span>
                    <span className="text-white font-medium">{getEngagement(winner).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Views</span>
                    <span className="text-white">{(winner.views_twitter || 0).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Likes</span>
                    <span className="text-white">{(winner.likes_twitter || 0).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Retweets</span>
                    <span className="text-white">{(winner.retweets_twitter || 0).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Replies</span>
                    <span className="text-white">{(winner.replies_twitter || 0).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Quotes</span>
                    <span className="text-white">{(winner.quotes_twitter || 0).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Bookmarks</span>
                    <span className="text-white">{(winner.bookmarks_twitter || 0).toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
