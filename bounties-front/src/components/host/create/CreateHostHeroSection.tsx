"use client";

import { BRAND_DISPLAY_NAME } from "@/lib/branding/links";

export default function CreateHostHeroSection() {
  return (
    <div className="pt-24 pb-6">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="text-[var(--color-primary)] text-lg font-semibold mb-4">
          Become a Host
        </div>

        <h1 className="text-2xl lg:text-4xl font-bold text-white mb-6 leading-tight">
          {`WELCOME TO ${BRAND_DISPLAY_NAME.toUpperCase()} HOST`}
        </h1>

        <p className="text-lg text-gray-300">
          We need to collect certain information to create your account so you can start creating your campaigns.
        </p>
      </div>
    </div>
  );
}

