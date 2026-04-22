"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { creatorApi, CampaignWinner } from "@/lib/api/creator";
import TwitterAvatar from "@/components/ui/TwitterAvatar";

interface WinnersRankProps {
  campaignId: string;
}

export default function WinnersRank({ campaignId }: WinnersRankProps) {
  const [winners, setWinners] = useState<CampaignWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ username: string; feedback: string } | null>(null);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await creatorApi.getCampaignWinners(campaignId);
        setWinners(response || []);
      } catch (err: unknown) {
        console.error("Erro ao buscar vencedores da campanha:", err);
        setError("Erro ao carregar vencedores");
        setWinners([]);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchWinners();
    }
  }, [campaignId]);

  const sortedWinners = winners.sort((a, b) => a.rank - b.rank);

  const top3Desktop = [
    sortedWinners.find((w) => w.rank === 2),
    sortedWinners.find((w) => w.rank === 1),
    sortedWinners.find((w) => w.rank === 3),
  ].filter(Boolean) as CampaignWinner[];

  const top3Mobile = [
    sortedWinners.find((w) => w.rank === 1),
    sortedWinners.find((w) => w.rank === 2),
    sortedWinners.find((w) => w.rank === 3),
  ].filter(Boolean) as CampaignWinner[];

  const rest = sortedWinners.filter((w) => w.rank > 3);

  const totalDistributed = winners.reduce(
    (sum, winner) => sum + (winner.amount_received || 0),
    0
  );

  const getTrophyBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-[#cc9500]";
      case 2:
        return "bg-[#9fa4ac]";
      case 3:
        return "bg-[#c83d01]";
      default:
        return "bg-gray-400";
    }
  };

  const getAvatarBorder = (rank: number) => {
    switch (rank) {
      case 1:
        return "border-2 shadow-lg";
      case 2:
        return "border-2 shadow-lg";
      case 3:
        return "border-2 shadow-lg";
      default:
        return "border-2 border-gray-500";
    }
  };

  const getBorderColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#cc9500";
      case 2:
        return "#9fa4ac";
      case 3:
        return "#c83d01";
      default:
        return "#6b7280";
    }
  };

  const getTrophyIcon = () => {
    return (
      <svg
        className="w-6 h-6 text-gray-700"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
      </svg>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const renderTopWinnerCard = (winner: CampaignWinner, isCenter: boolean) => (
    <div
      key={winner.rank}
      className={`flex flex-col items-center ${
        isCenter ? "mb-6" : "mb-0"
      } w-full`}
    >
      {/* Avatar */}
      <div
        className={`w-24 h-24 rounded-xl overflow-hidden ${getAvatarBorder(
          winner.rank
        )} mb-3 relative z-10 bg-[#0D2436]`}
        style={{
          borderColor: getBorderColor(winner.rank),
          boxShadow: `0 0 20px ${getBorderColor(winner.rank)}60`,
        }}
      >
        <TwitterAvatar
          src={winner.twitter_profile_image}
          alt={winner.username}
          className="object-cover w-full h-full"
          fill
        />
      </div>

      {/* Username */}
      <div className="flex flex-col items-center gap-1 justify-center mb-1 relative z-10">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-bold text-lg text-center truncate max-w-[180px]">
            {winner.username}
          </h3>
          {(winner.submission_twitter ||
            winner.submission_instagram ||
            winner.submission_tiktok ||
            winner.submission_youtube) && !winner.submission_feedback?.trim() && (
            <a
              href={
                winner.submission_twitter ||
                winner.submission_instagram ||
                winner.submission_tiktok ||
                winner.submission_youtube
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
        {winner.submission_feedback?.trim() && (
          <button
            type="button"
            onClick={() =>
              setFeedbackModal({
                username: winner.username,
                feedback: winner.submission_feedback!,
              })
            }
            className="text-sm text-[var(--color-primary)] hover:underline cursor-pointer"
          >
            Look feedback
          </button>
        )}
      </div>

      {/* Palco / Prize Box */}
      <div className="relative w-full max-w-[400px] flex justify-center mt-4">
        {/* Imagem do Palco */}
        <img
          src="/assets/ranking/Palco.svg"
          alt="Podium"
          className="w-full h-auto drop-shadow-2xl transform scale-110"
          style={{
            filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.5))",
          }}
        />

        {/* Conteúdo sobre o palco */}
        <div className="absolute inset-0 flex flex-col items-center pt-1">
          {/* Troféu */}
          <div
            className={`w-12 h-12 rounded-lg ${getTrophyBackground(
              winner.rank
            )} flex items-center justify-center shadow-lg`}
          >
            {getTrophyIcon()}
          </div>

          {/* Valor */}
          <div className="flex flex-col items-center mt-10">
            <div className="flex items-center gap-2">
              <Image
                src="https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
                alt="USDC"
                width={20}
                height={20}
                className="rounded-full"
                unoptimized
              />
              <span className="text-white font-bold text-xl leading-none">
                $
                {(winner.amount_received || 0).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <span className="text-gray-400 text-xs uppercase tracking-widest mt-1.5">
              Prize
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-8">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-400">Loading winners...</div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      ) : !winners || winners.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">
            The winners have not yet been announced.
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Winners */}
          {top3Desktop.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 items-end max-w-7xl mx-auto px-4">
              {/* Mobile: ordem 1, 2, 3 */}
              <div className="md:hidden flex flex-col gap-8">
                {top3Mobile.map((winner) =>
                  renderTopWinnerCard(winner, winner.rank === 1)
                )}
              </div>

              {/* Desktop: ordem 2, 1, 3 */}
              <div className="hidden md:contents">
                {top3Desktop.map((winner) =>
                  renderTopWinnerCard(winner, winner.rank === 1)
                )}
              </div>
            </div>
          )}

          {/* Restante em Tabela */}
          {rest.length > 0 && (
            <div className="space-y-2">
              {/* Header com total distribuído */}
              <div className="flex justify-center">
                <div className="bg-[#1C3545]/30 rounded-full px-6 py-4 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-white text-sm">
                    All payments done - Total Distributed{" "}
                    <span className="font-bold">
                      $
                      {totalDistributed.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </span>
                </div>
              </div>

              {/* Tabela */}
              <div className="overflow-x-auto mt-8">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-black/50">
                    <tr>
                      <th className="text-left py-5 px-6 text-gray-300 font-medium whitespace-nowrap uppercase">
                        Winners (Rank)
                      </th>
                      <th className="text-left py-5 px-6 text-gray-300 font-medium whitespace-nowrap uppercase">
                        Name
                      </th>
                      <th className="text-left py-5 px-6 text-gray-300 font-medium whitespace-nowrap uppercase">
                        Prize
                      </th>
                      <th className="text-left py-5 px-6 text-gray-300 font-medium whitespace-nowrap uppercase">
                        Submission
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((winner, index) => (
                      <tr
                        key={`rest-${winner.rank}`}
                        className={`${
                          index % 2 === 1 ? "bg-black/20" : "bg-transparent"
                        }`}
                      >
                        <td className="py-4 px-6 text-white font-medium">
                          {winner.rank}
                        </td>
                        <td className="py-4 px-6 text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full overflow-hidden relative">
                              <TwitterAvatar
                                src={winner.twitter_profile_image}
                                alt={winner.username}
                                className="object-cover"
                                fill
                              />
                            </div>
                            <span>{winner.username}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Image
                              src="https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
                              alt="USDC"
                              width={20}
                              height={20}
                              className="rounded-full"
                              unoptimized
                            />
                            <span className="text-white">
                              $
                              {(winner.amount_received || 0).toLocaleString(
                                "pt-BR",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-white">
                          {winner.submission_feedback?.trim() ? (
                            <button
                              type="button"
                              onClick={() =>
                                setFeedbackModal({
                                  username: winner.username,
                                  feedback: winner.submission_feedback!,
                                })
                              }
                              className="text-sm text-[var(--color-primary)] hover:underline cursor-pointer text-left"
                            >
                              Look feedback
                            </button>
                          ) : winner.submission_twitter ? (
                            <a
                              href={winner.submission_twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-gray-300 flex items-center gap-2"
                            >
                              <span>Twitter</span>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          ) : winner.submission_instagram ? (
                            <a
                              href={winner.submission_instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-gray-300 flex items-center gap-2"
                            >
                              <span>Instagram</span>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          ) : winner.submission_tiktok ? (
                            <a
                              href={winner.submission_tiktok}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-gray-300 flex items-center gap-2"
                            >
                              <span>TikTok</span>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          ) : winner.submission_youtube ? (
                            <a
                              href={winner.submission_youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-gray-300 flex items-center gap-2"
                            >
                              <span>YouTube</span>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mensagem sobre geração do ranking */}
          {winners.length > 0 &&
            winners[0].payment_rank_generate_ai !== undefined && (
              <div className="flex justify-center">
                <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700/50 shadow-lg">
                  <p className="text-gray-400 text-xs text-center">
                    <span className="text-red-500">*</span>{" "}
                    {winners[0].payment_rank_generate_ai
                      ? "Ranking automatically generated by metrics automation."
                      : "Ranking compiled manually based on available metrics."}
                  </p>
                </div>
              </div>
            )}
        </>
      )}

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
