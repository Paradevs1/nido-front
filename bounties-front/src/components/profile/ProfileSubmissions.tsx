"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { creatorApi, SubmittedCampaign } from "@/lib/api/creator";
import Image from "next/image";
import { renderMarkdown } from "@/utils/markdown";

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

export default function ProfileSubmissions() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [submittedCampaigns, setSubmittedCampaigns] = useState<
    SubmittedCampaign[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchSubmittedCampaigns = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const selectedOption = categoryOptions.find((cat) => cat.label === selectedCategory);
      const categoryValue = selectedOption?.value;
      const categoryParam =
        !categoryValue || categoryValue === "All" ? undefined : categoryValue;

      const response = await creatorApi.getSubmittedCampaigns(
        page,
        10,
        categoryParam
      );

      if (!response) {
        throw new Error("Invalid API response");
      }

      setSubmittedCampaigns(response.campaigns || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.page || 1);
    } catch (err) {
      console.error("Error fetching submitted campaigns:", err);
      setError("Failed to load submitted campaigns. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmittedCampaigns(1);
  }, [selectedCategory]);

  const filteredCampaigns = submittedCampaigns.filter((campaign) => {
    return true;
  });

  const handleCardClick = (campaignId: string) => {
    router.push(`/creator/campaign/${campaignId}`);
  };

  return (
    <div className="bg-transparent">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">My Submissions</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((category) => (
            <button
              key={category.label}
              onClick={() => setSelectedCategory(category.label)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors cursor-pointer ${
                selectedCategory === category.label
                  ? "bg-[var(--color-background-card-campaign)] text-white"
                  : "bg-transparent text-white border border-white hover:bg-[var(--color-background-card-campaign)]"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <p className="text-white">Loading submitted campaigns...</p>
        </div>
      )}

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
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <button
                onClick={() => fetchSubmittedCampaigns(currentPage)}
                className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  You don't have any submitted campaigns at the moment
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading &&
          !error &&
          filteredCampaigns.map((campaign) => {
            return (
              <div
                key={campaign.campaignId}
                onClick={() => handleCardClick(campaign.campaignId)}
                className="bg-[var(--color-card)] rounded-3xl cursor-pointer p-6 flex flex-col h-full min-h-[280px]"
              >
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg md:text-xl leading-tight mb-2 break-words">
                      {campaign.title}
                    </h3>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      campaign.status === "active"
                        ? "bg-green-500"
                        : campaign.status === "completed"
                        ? "bg-red-500"
                        : campaign.status === "waiting payment"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                </div>

                <div className="text-white text-sm md:text-base mb-4 line-clamp-2 flex-grow">
                  {renderMarkdown(
                    campaign.about_project.length > 150
                      ? `${campaign.about_project.substring(0, 150)}...`
                      : campaign.about_project
                  )}
                </div>

                <div className="flex items-center gap-3 mb-4 text-sm text-gray-300 flex-wrap">
                  {/* <div className="flex items-center gap-1 bg-[#26485E] px-3 py-1 rounded-full">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="whitespace-nowrap">
                      {campaign.total_submissions} submission(s)
                    </span>
                  </div> */}
                  <div className="flex items-center justify-center gap-1 bg-[#26485E] px-3 py-1 rounded-full">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="whitespace-nowrap text-center">
                      {campaign.deadline_detailed.is_expired
                        ? "Expired"
                        : campaign.deadline_detailed.days === 0 &&
                          campaign.deadline_detailed.hours === 0 &&
                          campaign.deadline_detailed.total_minutes > 0
                        ? (
                            <>
                              {campaign.deadline_detailed.total_minutes}m
                            </>
                          )
                        : (
                            <>
                              {campaign.deadline_detailed.days}d {campaign.deadline_detailed.hours}h {campaign.deadline_detailed.minutes}m
                            </>
                          )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#26485E] px-3 py-1 rounded-full border border-white/20">
                    <span className="whitespace-nowrap">
                      {campaign.content_categories
                        .map((cat) => cat.slug)
                        .join(", ")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div></div>
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
                      alt="USDC"
                      width={16}
                      height={16}
                      className="rounded-full"
                      unoptimized
                    />
                    <span>
                    {campaign.isPrivate && !campaign.is_cac
                      ? (campaign.user_amount ?? campaign.total_prize_pool)
                      : campaign.total_prize_pool}{" "}
                    USDC
                  </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {!loading && filteredCampaigns.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => fetchSubmittedCampaigns(currentPage - 1)}
            disabled={currentPage <= 1}
            className="cursor-pointer px-4 py-2 bg-[var(--color-card)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>

          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => fetchSubmittedCampaigns(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="cursor-pointer px-4 py-2 bg-[var(--color-card)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
