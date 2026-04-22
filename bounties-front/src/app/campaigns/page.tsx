"use client";

import { GuestLayout } from "@/components/layout";
import { ExploreCampaigns } from "@/components/home";

export default function CampaignsPage() {
  return (
    <GuestLayout>
      <div className="min-h-screen pt-24">
        <div className="max-w-[1440px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="order-2 lg:order-1 lg:col-span-3">
              <ExploreCampaigns />
            </div>
            <div className="order-1 lg:order-2" />
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}

