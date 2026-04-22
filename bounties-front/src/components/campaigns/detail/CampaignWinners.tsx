"use client";

import { useEffect, useState } from "react";
import { creatorApi, CampaignWinner } from "@/lib/api/creator";

interface CampaignWinnersProps {
  campaignId: string;
}

export default function CampaignWinners({
  campaignId,
}: CampaignWinnersProps) {
  const [winners, setWinners] = useState<CampaignWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
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

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const sortedWinners = winners.sort((a, b) => a.rank - b.rank);

  return (
    <div className="bg-transparent">
      <div className="rounded-2xl overflow-hidden hover:bg-[#1C3545] transition-colors">
        <button
          className="cursor-pointer w-full flex justify-between items-center py-3 px-6 text-left font-normal text-white bg-transparent"
          onClick={toggleDropdown}
        >
          <span className="text-lg font-semibold text-white">Winners Rank</span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isOpen && (
          <div className="px-6 py-3 text-white text-md bg-[var(--color-background-card-campaign)]">
            {loading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 w-full bg-gray-800/50 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            ) : error ? (
              <p className="text-gray-400 text-sm">{error}</p>
            ) : !winners || winners.length === 0 ? (
              <p className="text-gray-400 text-sm">
                The winners have not yet been announced.
              </p>
            ) : (
              <div className="space-y-2.5">
                {sortedWinners.map((winner, index) => (
                  <div
                    key={`${winner.rank}-${index}`}
                    className="flex flex-col gap-1 py-3 px-4 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:border-gray-600/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-base min-w-[24px]">
                          {winner.rank}
                        </span>
                        <span className="text-white font-medium text-sm">
                          {winner.username}
                        </span>
                      </div>
                      <span className="text-white font-semibold text-sm">
                        ${winner.amount_received.toLocaleString()}
                      </span>
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
                        className="text-sm text-[var(--color-primary)] hover:underline cursor-pointer text-left pl-9"
                      >
                        Look feedback
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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

