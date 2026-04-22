"use client";

import { useRouter } from "next/navigation";

interface CampaignTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CampaignTypeModal({
  isOpen,
  onClose,
}: CampaignTypeModalProps) {
  const router = useRouter();

  const handlePublicCampaign = () => {
    router.push("/host/campaign/create/publicCampaign");
  };

  const handlePrivateCampaign = () => {
    router.push("/host/campaign/create/privateCampaign");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Background Blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-8 w-full max-w-4xl">
        {/* Public Campaign Card */}
        <div
          onClick={handlePublicCampaign}
          className="bg-[var(--color-card)] rounded-3xl p-8 md:p-10 cursor-pointer group flex-1"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 group-hover:text-[var(--color-primary)] transition-colors">
            Public Campaign{" "}
            <span className="text-[var(--color-primary)]">&gt;</span>
          </h3>
          <p className="text-gray-300 text-base md:text-xl leading-relaxed">
            Open campaigns with performance based ranking and automated rewards
          </p>
        </div>

        {/* Private Campaign Card */}
        <div
          onClick={handlePrivateCampaign}
          className="bg-[var(--color-card)] rounded-3xl p-8 md:p-10 cursor-pointer group flex-1"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 group-hover:text-[var(--color-primary)] transition-colors">
            Private Campaign{" "}
            <span className="text-[var(--color-primary)]">&gt;</span>
          </h3>
          <p className="text-gray-300 text-base md:text-xl leading-relaxed">
            Invite selected creators with fixed payouts and full participant control
          </p>
        </div>
      </div>
    </div>
  );
}
