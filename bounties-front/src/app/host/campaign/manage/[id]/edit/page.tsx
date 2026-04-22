"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import CreateCampaignHeroSection from "@/components/host/campaigns/CreateCampaignHeroSection";
import CreateCampaignForm from "@/components/host/campaigns/CreateCampaignForm";
import { getCampaignById, CampaignDetails } from "@/lib/api/host";

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [currentStep, setCurrentStep] = useState("task");
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchCampaignDetails = async () => {
        try {
          setIsLoading(true);
          const response = await getCampaignById(id);
          if (response.campaign.status !== "inactive") {
            setError("Only inactive campaigns can be edited.");
            return;
          }
          setCampaign(response.campaign);
          setError(null);
        } catch (err: unknown) {
          setError(err.message || "Failed to load campaign details");
          setCampaign(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCampaignDetails();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
        <p className="text-red-500 text-xl">{error}</p>
        <button 
          onClick={() => router.push('/host/campaign/manage')}
          className="px-4 py-2 border border-white rounded-full hover:bg-white/10"
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-hidden w-full min-h-screen">
      <CreateCampaignHeroSection currentStep={currentStep} isEditing={true} />
      <CreateCampaignForm 
        currentStep={currentStep} 
        setCurrentStep={setCurrentStep} 
        initialData={campaign}
        isEditing={true}
      />
    </div>
  );
}

