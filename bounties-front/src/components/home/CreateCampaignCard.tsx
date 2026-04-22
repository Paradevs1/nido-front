"use client";

import Link from "next/link";

export default function CreateCampaignCard() {
  return (
    <div className="bg-[var(--color-card)] rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        Create a campaign
      </h3>
      <p className="text-gray-300 text-sm leading-relaxed">
        Define your needs, value and have your content delivered to over 200
        kols. Come be a Host.
      </p>
    </div>
  );
}
