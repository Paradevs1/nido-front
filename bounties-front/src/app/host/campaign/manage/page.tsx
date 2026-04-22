"use client";

import { useState, useEffect } from "react";
import HostCampaignsKPIs from "@/components/host/campaigns/HostCampaignsKPIs";
import HostCampaignsTable from "@/components/host/campaigns/HostCampaignsTable";
import ManageCampaignsHeader from "@/components/host/campaigns/ManageCampaignsHeader";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { FaSearch } from "react-icons/fa";
import { getHostProfile, HostProfile } from "@/lib/api/host";
import CampaignTypeModal from "@/components/host/campaigns/CampaignTypeModal";

export default function HostCampaignsManagePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const profile = await getHostProfile();
        setHostProfile(profile);
      } catch (error) {
        console.error("Failed to fetch host profile:", error);
        // Handle error appropriately
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const breadcrumbItems = [
    { label: "Campaigns", href: "/host/campaign" },
    { label: "Manage Campaigns", isCurrent: true },
  ];

  const hostName = isLoadingProfile ? "Loading..." : hostProfile?.username || "Host";

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-32">
        <Breadcrumb items={breadcrumbItems} />
        <ManageCampaignsHeader 
          hostName={isLoadingProfile ? undefined : hostProfile?.username}
          onCreateClick={() => setIsModalOpen(true)}
        />

        {/* Details Section */}
        <div className="mb-4">
          <h3 className="text-sm text-gray-400 mb-2">Details</h3>
        </div>

        {/* Quests Section (KPIs) */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">Campaigns</h3>
          <p className="text-gray-300 mb-6">
            Manage your campaigns and see which ones had the best results.
          </p>
          <HostCampaignsKPIs />
        </div>

        <div className="flex justify-start mb-6">
          <div className="relative w-full max-w-sm">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search for campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent text-white rounded-full border border-gray-600 hover:border-white focus:border-white focus:outline-none transition-colors placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Campaigns Table Section */}
        <div className="rounded-2xl overflow-hidden bg-transparent md:bg-[var(--color-card)]">
          <HostCampaignsTable searchTerm={searchTerm} />
        </div>
      </div>

      <CampaignTypeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
