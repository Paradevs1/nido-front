"use client";

import { ExploreCampaigns } from "@/components/home";
import { getAllPublicCampaigns, CampaignPublic } from "@/lib/api/host";
import { useEffect, useState } from "react";
import ManageCampaignsHeader from "@/components/host/campaigns/ManageCampaignsHeader";
import { getHostProfile, HostProfile } from "@/lib/api/host";
import CampaignTypeModal from "@/components/host/campaigns/CampaignTypeModal";

const LIMIT_PER_PAGE = 10;

export default function CreatorCampaignPage() {
  const [campaigns, setCampaigns] = useState<CampaignPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCampaigns = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllPublicCampaigns(page, LIMIT_PER_PAGE, 'active');
      setCampaigns(response.campaigns || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(response.page || page);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns(1);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const profile = await getHostProfile();
        setHostProfile(profile);
      } catch (error) {
        console.error("Failed to fetch host profile:", error);
        setHostProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const resolvedHostName = isLoadingProfile ? undefined : hostProfile?.username;

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="mb-4">
          <ManageCampaignsHeader
            hostName={resolvedHostName}
            subtitle={null}
            description="Browse the latest campaigns from other hosts and take inspiration for your next launch."
            ctaHref="/host/campaign/create"
            ctaLabel="CREATE NEW CAMPAIGN NOW"
            onCreateClick={() => setIsModalOpen(true)}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="order-2 lg:order-1 lg:col-span-3">
            <ExploreCampaigns
              campaigns={campaigns}
              loading={loading}
              error={error}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={fetchCampaigns}
            />
          </div>

          <div className="order-1 lg:order-2" />
        </div>
      </div>

      <CampaignTypeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
