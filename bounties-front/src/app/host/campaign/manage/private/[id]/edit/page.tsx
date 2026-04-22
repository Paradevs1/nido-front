"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCampaignById, CampaignDetails } from "@/lib/api/host";
import CreatePrivateCampaignHeroSection from "@/components/host/campaigns/CreatePrivateCampaignHeroSection";
import CreatePrivateCampaignForm from "@/components/host/campaigns/CreatePrivateCampaignForm";

export default function EditPrivateCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState("task");

  useEffect(() => {
    if (id) {
      const fetchCampaignDetails = async () => {
        try {
          setIsLoading(true);
          const response = await getCampaignById(id);
          
          // Verificar se é realmente uma campanha privada
          if (!response.campaign.isPrivate) {
            setError("This is not a private campaign");
            setCampaign(null);
          } else {
            setCampaign(response.campaign);
            setError(null);
          }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading campaign...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <button
            onClick={() => router.push("/host/campaign/manage")}
            className="cursor-pointer px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-all"
          >
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Campaign not found</p>
          <button
            onClick={() => router.push("/host/campaign/manage")}
            className="cursor-pointer px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-all"
          >
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-hidden w-full min-h-screen">
      <CreatePrivateCampaignHeroSection currentStep={currentStep} isEditing={true} />
      <CreatePrivateCampaignForm
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        initialData={campaign}
        isEditing={true}
      />
    </div>
  );
}

