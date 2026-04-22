"use client";

import { useState, useEffect, useMemo } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { getWinners, Winner } from "@/lib/api/host";

const MOBILE_ITEMS_PER_PAGE = 6;

type SortField = "rank" | "name" | "valueAmount" | "link";
type SortDirection = "asc" | "desc";

interface WinnersTableProps {
  campaignId: string;
  searchTerm: string;
}

export default function WinnersTable({
  campaignId,
  searchTerm,
}: WinnersTableProps) {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [mobilePage, setMobilePage] = useState(1);
  const [feedbackModal, setFeedbackModal] = useState<{ username: string; feedback: string } | null>(null);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        setIsLoading(true);
        const response = await getWinners(campaignId);
        setWinners(response.winners || []);
        setError(null);
      } catch (err: any) {
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
    winner: Winner
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

  const getSubmissionUrl = (winner: Winner): string | null => {
    if (winner.submission_feedback?.trim()) return winner.submission_feedback;
    const urls = getSubmissionUrls(winner);
    return urls.length > 0 ? urls.map((u) => u.url).join(" ") : null;
  };

  const getSignatureUrl = (winner: Winner): string | null => {
    if (!winner.signature || !winner.chain) return null;

    const chainMap: Record<string, string> = {
      arbitrum: "https://arbiscan.io/tx/",
      base: "https://basescan.org/tx/",
      ethereum: "https://etherscan.io/tx/",
      berachain: "https://berascan.com/tx/",
      bsc: "https://bscscan.com/tx/",
      hyperevm: "https://hyperevmscan.io/tx/",
      polygon: "https://polygonscan.com/tx/",
      solana: "https://solscan.io/tx/",
      sui: "https://suiscan.xyz/mainnet/tx/",
      stellar: "https://stellar.expert/explorer/public/tx/",
    };

    const baseUrl = chainMap[winner.chain.toLowerCase()];
    return baseUrl ? `${baseUrl}${winner.signature}` : null;
  };

  const filteredWinners = useMemo(() => {
    const name = (w: Winner) => (w.user_name || w.username) ?? "";
    return winners.filter(
      (winner) =>
        name(winner).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSubmissionUrl(winner)
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [winners, searchTerm]);

  const sortedWinners = useMemo(() => {
    return [...filteredWinners].sort((a, b) => {
      let valA: any, valB: any;

      switch (sortField) {
        case "rank":
          valA = a.rank;
          valB = b.rank;
          break;
        case "name":
          valA = ((a.user_name || a.username) ?? "").toLowerCase();
          valB = ((b.user_name || b.username) ?? "").toLowerCase();
          break;
        case "valueAmount":
          valA = a.value_amount;
          valB = b.value_amount;
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
  }, [filteredWinners, sortField, sortDirection]);

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
    { key: "valueAmount", label: "Value Amount" },
    { key: "link", label: "Submission" },
    { key: null, label: "Signature" },
  ];

  const totalPages = Math.max(
    1,
    Math.ceil(sortedWinners.length / itemsPerPage)
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedWinners = sortedWinners.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  useEffect(() => {
    setMobilePage(1);
    setCurrentPage(1);
  }, [sortedWinners.length, searchTerm]);

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
          Loading winners...
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
          No winners found.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {mobileWinners.map((winner, index) => {
          const submissionUrls = getSubmissionUrls(winner);
          return (
            <div
              key={`${winner.id}-${index}`}
              className="rounded-3xl p-5 border border-white/10 bg-gradient-to-br from-[#061C2C]/80 to-[#04111A]/80 shadow-[0_16px_40px_rgba(3,17,29,0.55)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-white font-semibold text-lg">
                    {winner.user_name || winner.username}
                  </h4>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40 mt-2">
                    Rank • #{winner.rank}
                  </p>
                </div>
                <span className="text-xs font-semibold text-green-400 bg-green-500/10 rounded-full px-3 py-1">
                  $
                  {(
                    winner.value_amount ||
                    winner.amount_received ||
                    0
                  ).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {winner.submission_feedback?.trim() ? (
                  <button
                    type="button"
                    onClick={() =>
                      setFeedbackModal({
                        username: winner.user_name || (winner as any).username || "",
                        feedback: winner.submission_feedback!,
                      })
                    }
                    className="text-sm text-[var(--color-primary)] hover:underline cursor-pointer text-left"
                  >
                    Look feedback
                  </button>
                ) : submissionUrls.length > 0 ? (
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
                  <span className="text-gray-400 text-sm">
                    No submission links.
                  </span>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs uppercase tracking-[0.18em] text-white/40 mb-1">
                  Signature
                </p>
                {(() => {
                  const signatureUrl = getSignatureUrl(winner);
                  if (signatureUrl) {
                    return (
                      <a
                        href={signatureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-white hover:text-[var(--color-primary)] transition-colors"
                      >
                        <FiExternalLink />
                        View in Explorer
                      </a>
                    );
                  }
                  return (
                    <p className="text-sm text-gray-300">
                      {winner.signature ? (
                        winner.signature
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </p>
                  );
                })()}
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
                    No winners found.
                  </td>
                </tr>
              ) : (
                paginatedWinners.map((winner, index) => {
                  const submissionUrls = getSubmissionUrls(winner);
                  const globalIndex = (currentPage - 1) * itemsPerPage + index;
                  const uniqueKey =
                    winner.id || winner.user_id || `winner-${index}`;

                  return (
                    <tr
                      key={uniqueKey}
                      className={`${
                        globalIndex % 2 === 0 ? "bg-white/5" : "bg-transparent"
                      } border-b border-white/5 hover:bg-white/10 transition-colors`}
                    >
                      <td className="py-4 px-6 text-gray-300">{winner.rank}</td>
                      <td className="py-4 px-6 text-white font-medium">
                        {winner.user_name || winner.username}
                      </td>
                      <td className="py-4 px-6 text-green-400 font-medium">
                        $
                        {(
                          winner.value_amount ||
                          winner.amount_received ||
                          0
                        ).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-4 px-6">
                        {winner.submission_feedback?.trim() ? (
                          <button
                            type="button"
                            onClick={() =>
                              setFeedbackModal({
                                username: winner.user_name || (winner as any).username || "",
                                feedback: winner.submission_feedback!,
                              })
                            }
                            className="text-sm text-[var(--color-primary)] hover:underline cursor-pointer text-left"
                          >
                            Look feedback
                          </button>
                        ) : submissionUrls.length > 0 ? (
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
                      <td className="py-4 px-6 text-gray-300">
                        {(() => {
                          const signatureUrl = getSignatureUrl(winner);
                          if (signatureUrl) {
                            return (
                              <a
                                href={signatureUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-300 hover:text-white hover:underline flex items-center gap-2 transition-colors"
                              >
                                <FiExternalLink />
                                View in Explorer
                              </a>
                            );
                          }
                          return winner.signature ? (
                            winner.signature
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          );
                        })()}
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

      {feedbackModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setFeedbackModal(null)}
            aria-hidden
          />
          <div className="relative z-10 bg-[var(--color-card)] rounded-2xl border border-white/10 shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Feedback — {feedbackModal.username}
              </h3>
              <button
                type="button"
                onClick={() => setFeedbackModal(null)}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex-1 min-h-0">
              <textarea
                readOnly
                value={feedbackModal.feedback}
                rows={12}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-gray-200 whitespace-pre-wrap break-words resize-y min-h-[200px] focus:outline-none focus:border-white/40 cursor-text"
              />
            </div>
            <div className="p-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setFeedbackModal(null)}
                className="w-full py-2.5 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
