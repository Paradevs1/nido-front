"use client";

import { useState, useEffect, useMemo } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { getCampaignSubmissions, CampaignSubmission } from "@/lib/api/host";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

const MOBILE_ITEMS_PER_PAGE = 6;
const DESKTOP_ITEMS_PER_PAGE = 10;

type SortField = "order" | "name" | "submission" | "amount" | "createdOn";
type SortDirection = "asc" | "desc";

interface CampaignSubmissionsTableProps {
  campaignId: string;
  searchTerm: string;
  isPrivate?: boolean;
  isCac?: boolean;
  campaignStatus?: string;
}

export default function CampaignSubmissionsTable({
  campaignId,
  searchTerm,
  isPrivate = false,
  isCac = false,
  campaignStatus,
}: CampaignSubmissionsTableProps) {
  const [allSubmissions, setAllSubmissions] = useState<CampaignSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("order");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [mobilePage, setMobilePage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [detailModal, setDetailModal] = useState<{
    username: string;
    urls: Array<{ type: string; url: string }>;
    feedback: string;
  } | null>(null);

  // Carregar TODOS os dados de uma vez
  useEffect(() => {
    const fetchAllSubmissions = async () => {
      try {
        setIsLoading(true);
        
        // Usar a rota leaderboard-submits para todas as campanhas (públicas e privadas)
        // Ela retorna o amount do list_kols para campanhas privadas
        const response = await getCampaignSubmissions(
          campaignId,
          1,
          9999 // Carregar todos de uma vez
        );
        const submissionsData =
          response.leaderboard || response.submissions || [];
        setAllSubmissions(submissionsData);
        
        setError(null);
      } catch (err: unknown) {
        setError(err.message || "Failed to load submissions");
        setAllSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (campaignId) {
      fetchAllSubmissions();
    }
  }, [campaignId, isPrivate]);

  // Resetar páginas quando searchTerm mudar
  useEffect(() => {
    setCurrentPage(1);
    setMobilePage(1);
  }, [searchTerm]);

  const handleSort = (field: SortField) => {
    // Não permitir ordenar por amount se for CAC
    if (isCac && field === "amount") {
      return;
    }
    const newDirection =
      field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };

  const getSubmissionUrls = (
    submission: CampaignSubmission
  ): Array<{ type: string; url: string }> => {
    const urls: Array<{ type: string; url: string }> = [];
    
    // Para campanhas privadas, usar submissions_kols (array de links)
    if (isPrivate && submission.submissions_kols && submission.submissions_kols.length > 0) {
      submission.submissions_kols.forEach((link, index) => {
        if (link && link.trim()) {
          urls.push({ type: `Link ${index + 1}`, url: link.trim() });
        }
      });
    } else {
      // Para campanhas públicas, usar campos fixos
      if (submission.submission_twitter)
        urls.push({ type: "Twitter", url: submission.submission_twitter });
      if (submission.submission_instagram)
        urls.push({ type: "Instagram", url: submission.submission_instagram });
      if (submission.submission_tiktok)
        urls.push({ type: "TikTok", url: submission.submission_tiktok });
      if (submission.submission_youtube)
        urls.push({ type: "YouTube", url: submission.submission_youtube });
    }
    
    return urls;
  };

  // Helper function for backward compatibility (used in filter/search)
  const getSubmissionUrl = (submission: CampaignSubmission): string | null => {
    const urls = getSubmissionUrls(submission);
    const feedback = submission.submission_feedback?.trim() || "";
    const joinedUrls = urls.length > 0 ? urls.map((u) => u.url).join(" ") : "";
    const joined = `${feedback} ${joinedUrls}`.trim();
    return joined.length > 0 ? joined : null;
  };

  const getSignatureUrl = (submission: CampaignSubmission): string | null => {
    if (!submission.signature || !submission.chain) return null;

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
    };

    const baseUrl = chainMap[submission.chain.toLowerCase()];
    return baseUrl ? `${baseUrl}${submission.signature}` : null;
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

  // Filtrar localmente por searchTerm
  const filteredSubmissions = useMemo(() => {
    if (!searchTerm.trim()) {
      return allSubmissions;
    }
    return allSubmissions.filter(
      (submission) =>
        submission.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSubmissionUrl(submission)
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [allSubmissions, searchTerm]);

  const sortedSubmissions = useMemo(() => {
    return [...filteredSubmissions].sort((a, b) => {
      let valA: any, valB: any;

      switch (sortField) {
        case "order":
          // Ordenar por índice no array original de submissões
          valA = allSubmissions.indexOf(a);
          valB = allSubmissions.indexOf(b);
          break;
        case "name":
          valA = a.username.toLowerCase();
          valB = b.username.toLowerCase();
          break;
        case "submission":
          valA = getSubmissionUrl(a) || "";
          valB = getSubmissionUrl(b) || "";
          break;
        case "amount":
          valA = (a as any).amount || (a as any).amount_received || 0;
          valB = (b as any).amount || (b as any).amount_received || 0;
          break;
        case "createdOn":
          valA = a.date_submit ? new Date(a.date_submit).getTime() : 0;
          valB = b.date_submit ? new Date(b.date_submit).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredSubmissions, sortField, sortDirection, allSubmissions]);

  // Paginação local
  const totalMobilePages = Math.max(
    1,
    Math.ceil(sortedSubmissions.length / MOBILE_ITEMS_PER_PAGE)
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sortedSubmissions.length / DESKTOP_ITEMS_PER_PAGE)
  );

  const safeDesktopPage = Math.min(currentPage, totalPages);
  const currentMobilePage = Math.min(mobilePage, totalMobilePages);

  const mobileSubmissions = sortedSubmissions.slice(
    (currentMobilePage - 1) * MOBILE_ITEMS_PER_PAGE,
    currentMobilePage * MOBILE_ITEMS_PER_PAGE
  );

  const desktopSubmissions = sortedSubmissions.slice(
    (safeDesktopPage - 1) * DESKTOP_ITEMS_PER_PAGE,
    safeDesktopPage * DESKTOP_ITEMS_PER_PAGE
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <FaSort className="inline ml-2 text-gray-500" />;
    return sortDirection === "asc" ? (
      <FaSortUp className="inline ml-2 text-gray-400" />
    ) : (
      <FaSortDown className="inline ml-2 text-gray-400" />
    );
  };

  const headers: { key: SortField | null; label: string }[] = isPrivate && !isCac
    ? [
        { key: "order", label: "ORDER SUBMISSIONS" },
        { key: "name", label: "NAME" },
        { key: "submission", label: "SUBMISSIONS" },
        { key: "amount", label: "AMOUNT" },
        { key: "createdOn", label: "CREATED ON" },
        { key: null, label: "SIGNATURE" },
        { key: null, label: "WINNERS" },
      ]
    : isPrivate
      ? [
          { key: "order", label: "ORDER SUBMISSIONS" },
          { key: "name", label: "NAME" },
          { key: "submission", label: "SUBMISSIONS" },
          { key: "createdOn", label: "CREATED ON" },
          { key: null, label: "SIGNATURE" },
          { key: null, label: "WINNERS" },
        ]
      : [
          { key: "order", label: "ORDER SUBMISSIONS" },
          { key: "name", label: "NAME" },
          { key: "submission", label: "SUBMISSIONS" },
          { key: "createdOn", label: "CREATED ON" },
        ];

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

    if (sortedSubmissions.length === 0) {
      return (
        <div className="rounded-2xl border border-white/10 py-6 text-center text-gray-400">
          No submissions found.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {mobileSubmissions.map((submission, index) => {
          const submissionUrls = getSubmissionUrls(submission);
          const feedbackText = submission.submission_feedback?.trim() || "";
          const orderNumber = allSubmissions.indexOf(submission) + 1;
          return (
            <div
              key={`${submission.user_id}-${index}`}
              className="rounded-3xl p-5 border border-white/10 bg-gradient-to-br from-[#061C2C]/80 to-[#04111A]/80 shadow-[0_16px_40px_rgba(3,17,29,0.55)] cursor-pointer relative"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredRow(`${submission.user_id}-${index}`);
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
                    {submission.username}
                  </h4>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40 mt-2">
                    Submitted •{" "}
                    {submission.date_submit ? (
                      formatDistanceToNow(new Date(submission.date_submit), {
                        addSuffix: true,
                        locale: enUS,
                      })
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
                <span className="text-xs font-semibold text-white bg-white/10 rounded-full px-3 py-1">
                  #{orderNumber}
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between rounded-2xl px-4 py-2 border border-white/10 bg-[#0D2436]/60 text-sm text-gray-200">
                  <span className="uppercase tracking-[0.2em] text-xs text-white/60">
                    Submissions
                  </span>
                  <span className="font-semibold text-white">
                    {feedbackText
                      ? submissionUrls.length > 0
                        ? `${submissionUrls.length} + feedback`
                        : "Feedback"
                      : submissionUrls.length > 0
                        ? submissionUrls.length
                        : "N/A"}
                  </span>
                </div>

                {isPrivate && (
                  <div className="flex items-center justify-between rounded-2xl px-4 py-2 border border-white/10 bg-[#0D2436]/60 text-sm text-gray-200">
                    <span className="uppercase tracking-[0.2em] text-xs text-white/60">
                      Signature
                    </span>
                    {(() => {
                      const signatureUrl = getSignatureUrl(submission);
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
                        <span className="text-sm text-gray-400">
                          {submission.signature ? submission.signature : "N/A"}
                        </span>
                      );
                    })()}
                  </div>
                )}

                {isPrivate && (
                  <div className="flex items-center justify-between rounded-2xl px-4 py-2 border border-white/10 bg-[#0D2436]/60 text-sm text-gray-200">
                    <span className="uppercase tracking-[0.2em] text-xs text-white/60">
                      Winners
                    </span>
                    <span className={`text-sm font-medium ${campaignStatus?.toLowerCase() !== "completed" ? "text-gray-400" : submission.winner === true ? "text-green-400" : submission.winner === false ? "text-red-400" : "text-gray-400"}`}>
                      {campaignStatus?.toLowerCase() !== "completed" ? "N/A" : submission.winner === true ? "Yes" : submission.winner === false ? "No" : "N/A"}
                    </span>
                  </div>
                )}

                {(() => {
                  const hasLinks = submissionUrls.length > 0;
                  const hasFeedback = Boolean(feedbackText);
                  const shouldUseModal = submissionUrls.length >= 2 || hasFeedback;

                  if (!hasLinks && !hasFeedback) return <span className="text-gray-500">N/A</span>;

                  if (!shouldUseModal && hasLinks) {
                    const only = submissionUrls[0];
                    return (
                      <a
                        href={only.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-white hover:text-[var(--color-primary)] transition-colors"
                      >
                        <FiExternalLink />
                        {only.type}
                      </a>
                    );
                  }

                  return (
                    <button
                      type="button"
                      onClick={() =>
                        setDetailModal({
                          username: submission.username,
                          urls: submissionUrls,
                          feedback: feedbackText,
                        })
                      }
                      className="text-sm text-[var(--color-primary)] hover:underline cursor-pointer text-left"
                    >
                      View details
                    </button>
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
              className="px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40 cursor-pointer"
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
              className="px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40 cursor-pointer"
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
                    className={`py-5 px-6 text-gray-400 font-medium whitespace-nowrap ${header.label === "WINNERS" ? "text-center" : "text-left"}`}
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
                <tr>
                  <td
                    colSpan={headers.length}
                    className="text-center py-8 text-gray-400"
                  >
                    Loading submissions...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="text-center py-8 text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : desktopSubmissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="text-center py-8 text-gray-400"
                  >
                    No submissions found.
                  </td>
                </tr>
              ) : (
                desktopSubmissions.map((submission, index) => {
                  const submissionUrls = getSubmissionUrls(submission);
                  const feedbackText = submission.submission_feedback?.trim() || "";
                  // Calcular índice global para exibição
                  const globalIndex =
                    (safeDesktopPage - 1) * DESKTOP_ITEMS_PER_PAGE + index + 1;

                  return (
                    <tr
                      key={submission.ordem}
                      className={`${
                        index % 2 === 0 ? "bg-white/5" : "bg-transparent"
                      } border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer relative`}
                      onMouseEnter={(e) => handleRowMouseEnter(submission, e)}
                      onMouseLeave={handleRowMouseLeave}
                    >
                      <td className="py-4 px-6 text-gray-300">{globalIndex}</td>
                      <td className="py-4 px-6 text-white font-medium">
                        {submission.username}
                      </td>
                      <td className="py-4 px-6">
                        {(() => {
                          const hasLinks = submissionUrls.length > 0;
                          const hasFeedback = Boolean(feedbackText);
                          const shouldUseModal = submissionUrls.length >= 2 || hasFeedback;

                          if (!hasLinks && !hasFeedback) return <span className="text-gray-500">N/A</span>;

                          if (!shouldUseModal && hasLinks) {
                            const only = submissionUrls[0];
                            return (
                              <a
                                href={only.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-300 hover:text-white hover:underline flex items-center gap-2 transition-colors"
                              >
                                <FiExternalLink />
                                {only.type}
                              </a>
                            );
                          }

                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailModal({
                                  username: submission.username,
                                  urls: submissionUrls,
                                  feedback: feedbackText,
                                });
                              }}
                              className="text-sm text-[var(--color-primary)] hover:underline text-left cursor-pointer"
                            >
                              View details
                            </button>
                          );
                        })()}
                      </td>
                      {isPrivate && !isCac && (
                        <td className="py-4 px-6 text-white font-semibold">
                          ${((submission.amount || submission.amount_received) || 0).toFixed(2)}
                        </td>
                      )}
                      <td className="py-4 px-6 text-gray-400">
                        {submission.date_submit ? (
                          formatDistanceToNow(new Date(submission.date_submit), {
                            addSuffix: true,
                            locale: enUS,
                          })
                        ) : (
                          "N/A"
                        )}
                      </td>
                      {isPrivate && (
                        <td className="py-4 px-6 text-gray-300">
                          {(() => {
                            const signatureUrl = getSignatureUrl(submission);
                            if (signatureUrl) {
                              return (
                                <a
                                  href={signatureUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-white hover:underline flex items-center gap-2 transition-colors"
                                >
                                  <FiExternalLink />
                                  View in Explorer
                                </a>
                              );
                            }
                            return (
                              <span className="text-gray-500">
                                {submission.signature ? submission.signature : "N/A"}
                              </span>
                            );
                          })()}
                        </td>
                      )}
                      {isPrivate && (
                        <td className="py-4 px-6 text-gray-300 text-center">
                          {campaignStatus?.toLowerCase() !== "completed" ? (
                            <span className="text-gray-500">N/A</span>
                          ) : submission.winner === true ? (
                            <span className="text-green-400 font-medium">Yes</span>
                          ) : submission.winner === false ? (
                            <span className="text-red-400 font-medium">No</span>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {sortedSubmissions.length > 0 && (
        <div className="hidden md:flex items-center justify-between mt-4 text-sm text-gray-300 px-6 pb-2">
          <span>
            Page {safeDesktopPage} of {totalPages}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(Math.max(1, safeDesktopPage - 1))}
              className="cursor-pointer px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40"
              disabled={safeDesktopPage === 1}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, safeDesktopPage + 1))
              }
              className="cursor-pointer px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40"
              disabled={safeDesktopPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
      <div className="md:hidden">{renderMobileCards()}</div>

      {/* Tooltip para desktop */}
      {hoveredRow &&
        desktopSubmissions.find(
          (s) => (s.user_id || `submission-${s.ordem}`) === hoveredRow
        ) && (
          <div
            className="fixed z-50 pointer-events-none hidden md:block"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
            }}
          >
            {(() => {
              const submission = desktopSubmissions.find(
                (s) => (s.user_id || `submission-${s.ordem}`) === hoveredRow
              );
              if (!submission) return null;
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
                      {(submission.views_twitter || 0).toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      {/* Tooltip para mobile */}
      {hoveredRow &&
        mobileSubmissions.find(
          (s, idx) => `${s.user_id}-${idx}` === hoveredRow
        ) && (
          <div
            className="fixed z-50 pointer-events-none md:hidden"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
            }}
          >
            {(() => {
              const submissionIndex = mobileSubmissions.findIndex(
                (s, idx) => `${s.user_id}-${idx}` === hoveredRow
              );
              const submission = mobileSubmissions[submissionIndex];
              if (!submission) return null;
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
                      Post: {(submission.submission_twitter || submission.submission_instagram || submission.submission_tiktok || submission.submission_youtube) ? 1 : 0}
                    </div>
                    <div className="text-gray-300">
                      Views:{" "}
                      {(submission.views_twitter || 0).toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      {/* Modal details (links + feedback) */}
      {detailModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDetailModal(null)}
            aria-hidden
          />
          <div className="relative z-10 bg-[var(--color-card)] rounded-2xl border border-white/10 shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Submission — {detailModal.username}
              </h3>
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex-1 min-h-0">
              {detailModal.urls.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-400 text-xs mb-2">Submission links</p>
                  <ul className="space-y-2">
                    {detailModal.urls.map((u, idx) => (
                      <li key={`${u.url}-${idx}`}>
                        <a
                          href={u.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-white hover:underline flex items-center gap-2 transition-colors text-sm break-all"
                        >
                          <FiExternalLink />
                          <span className="text-gray-400">{u.type}:</span> {u.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {detailModal.feedback?.trim() ? (
                <div>
                  <p className="text-gray-400 text-xs mb-2">Feedback</p>
                  <textarea
                    readOnly
                    value={detailModal.feedback}
                    rows={10}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-gray-200 whitespace-pre-wrap break-words resize-y min-h-[180px] focus:outline-none focus:border-white/40 cursor-text"
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No feedback provided.</p>
              )}
            </div>
            <div className="p-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDetailModal(null)}
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
