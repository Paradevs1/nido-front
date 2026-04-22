"use client";

import {
  HeroSection,
  CreateCampaignCard,
  HowItWorks,
  ExploreCampaigns,
  RecentEarners,
  WelcomeBanner
} from "@/components/home";

export default function CreatorPage() {
  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <div className="order-1 lg:order-2">
            <HowItWorks variant="creator" />
          </div>

          <div className="order-2 lg:order-1 lg:col-span-3">
            <WelcomeBanner />
            <RecentEarners />
            <ExploreCampaigns noTopPadding />
          </div>
        </div>
      </div>
    </div>
  );
}
