"use client";

import { useState, useEffect } from "react";
import CampaignCard from "@/components/home/CampaignCard";
import { getHostCampaigns, CampaignPublic } from "@/lib/api/host";

export default function HostMyCampaigns() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [campaigns, setCampaigns] = useState<CampaignPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
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

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        const selectedOption = categories.find((cat) => cat.label === selectedCategory);
        const categoryValue = selectedOption?.value;
        const categoryParam =
          !categoryValue || categoryValue === "All" ? undefined : categoryValue;
        const response = await getHostCampaigns(1, 50, categoryParam);
        setCampaigns(response.campaigns || []);
      } catch (err: unknown) {
        setError(err.message || "Failed to load campaigns");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [selectedCategory]);

  // No need for client-side filtering since API handles it
  const filteredCampaigns = campaigns;

  return (
    <div className="py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            My Campaigns
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
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
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          // Loading state
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-[var(--color-card)] rounded-2xl p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-600 rounded mb-4"></div>
              <div className="h-3 bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-600 rounded mb-4 w-2/3"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-600 rounded w-1/4"></div>
                <div className="h-3 bg-gray-600 rounded w-1/4"></div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-2 text-center py-12 text-red-400">
            Error: {error}
          </div>
        ) : filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))
        ) : (
          // Empty state
          <div className="col-span-2 text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No campaigns found</div>
            <p className="text-gray-500">
              Create your first campaign to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
