"use client";

import CreateHostHeroSection from "@/components/host/create/CreateHostHeroSection";
import CreateCompanyForm from "@/components/host/create/CreateCompanyForm";

export default function HostCreatePage() {
  return (
    <div className="relative overflow-x-hidden w-full min-h-screen">
      <div className="min-h-screen pb-10">
        <CreateHostHeroSection />
        <CreateCompanyForm />
      </div>
    </div>
  );
}
