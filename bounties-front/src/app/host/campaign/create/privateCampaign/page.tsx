"use client";

import { useState } from "react";
import CreatePrivateCampaignHeroSection from "@/components/host/campaigns/CreatePrivateCampaignHeroSection";
import CreatePrivateCampaignForm from "@/components/host/campaigns/CreatePrivateCampaignForm";

export default function CreatePrivateCampaignPage() {
  const [currentStep, setCurrentStep] = useState("task");

  return (
    <div className="relative overflow-x-hidden w-full min-h-screen">
      <CreatePrivateCampaignHeroSection currentStep={currentStep} />
      <CreatePrivateCampaignForm currentStep={currentStep} setCurrentStep={setCurrentStep} />
    </div>
  );
}
