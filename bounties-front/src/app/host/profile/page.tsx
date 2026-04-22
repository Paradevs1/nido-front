"use client";

import { useState } from "react";
import HostProfileInfo from '@/components/host/profile/HostProfileInfo';
import HostMyCampaigns from '@/components/host/profile/HostMyCampaigns';
import CampaignTypeModal from '@/components/host/campaigns/CampaignTypeModal';

export default function HostProfilePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative overflow-x-hidden w-full min-h-screen">
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <HostProfileInfo onCreateClick={() => setIsModalOpen(true)} />
            </div>
            <div className="lg:col-span-2">
              <HostMyCampaigns />
            </div>
          </div>
        </div>
      </div>

      <CampaignTypeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
