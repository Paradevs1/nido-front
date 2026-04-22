"use client";

import { useState } from "react";
import CampaignTypeModal from "@/components/host/campaigns/CampaignTypeModal";
import { useRouter } from "next/navigation";

export default function CreateCampaignSelectPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
    router.push("/host/campaign");
  };

  return (
    <div className="relative overflow-x-hidden w-full min-h-screen">
      <CampaignTypeModal isOpen={isModalOpen} onClose={handleClose} />
    </div>
  );
}
