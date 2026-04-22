"use client";

import { GuestLayout } from "@/components/layout";
import AutoRedirectFromHome from "@/components/auth/AutoRedirectFromHome";
import {
  HeroSection,
  CreateCampaignCard,
  HowItWorks,
  ExploreCampaigns,
  RecentEarners,
} from "@/components/home";

export default function Home() {
  return (
    <GuestLayout>
      <AutoRedirectFromHome />
      <div className="min-h-screen pt-24">
        <div className="max-w-[1440px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="order-2 lg:order-1 lg:col-span-3">
              <HeroSection />
              <RecentEarners />
              <div>
                <ExploreCampaigns />
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <CreateCampaignCard />
              <HowItWorks />
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
