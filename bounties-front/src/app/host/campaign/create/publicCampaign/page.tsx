"use client";

import { useState } from "react";
import CreateCampaignHeroSection from "@/components/host/campaigns/CreateCampaignHeroSection";
import CreateCampaignForm from "@/components/host/campaigns/CreateCampaignForm";

export default function CreateCampaignPage() {
  const [currentStep, setCurrentStep] = useState("task");

  return (
    <div className="relative overflow-x-hidden w-full min-h-screen">
      <CreateCampaignHeroSection currentStep={currentStep} />
      <CreateCampaignForm currentStep={currentStep} setCurrentStep={setCurrentStep} />
    </div>
  );
}
