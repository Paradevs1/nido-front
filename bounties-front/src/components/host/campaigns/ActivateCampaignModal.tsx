"use client";

import { useState, useEffect } from "react";
import BaseButton from "@/components/ui/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface ActivateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate: () => void; // Manteremos o nome da prop por consistência, mas a função mudou
  campaignId?: string;
  isPrivate?: boolean; // Flag para identificar se é campanha privada
}

export default function ActivateCampaignModal({ isOpen, onClose, onActivate, campaignId, isPrivate = false }: ActivateCampaignModalProps) {
  const router = useRouter();
  const [checkAnimation, setCheckAnimation] = useState<any>(null);

  useEffect(() => {
    // Carregar animação de sucesso
    const loadAnimation = async () => {
      try {
        const checkRes = await fetch("/assets/motion/check-motion.json");
        const checkData = await checkRes.json();
        setCheckAnimation(checkData);
      } catch (error) {
        console.error("Error loading animation:", error);
      }
    };
    loadAnimation();
  }, []);

  if (!isOpen) return null;

  const handleActivate = () => {
    if (campaignId) {
      // Redirecionar para rota correta baseado no tipo de campanha
      const route = isPrivate 
        ? `/host/campaign/manage/private/${campaignId}`
        : `/host/campaign/manage/${campaignId}`;
      router.push(route);
    }
    onActivate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-card)] rounded-2xl max-w-lg w-full p-8 text-center">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Congrats!</h2>
          <p className="text-gray-300 text-lg">Campaign created successfully!</p>
        </div>

        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-48 h-48">
            {checkAnimation ? (
              <Lottie
                animationData={checkAnimation}
                loop={false}
                autoplay={true}
              />
            ) : (
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Button */}
        <div className="mb-8">
          <BaseButton 
            onClick={handleActivate}
            className="cursor-pointer w-full py-4 font-bold border-2 border-[var(--color-primary)]"
          >
            GO ACTIVATE THE CAMPAIGN
          </BaseButton>
        </div>

        {/* Footer */}
        <div />
      </div>
    </div>
  );
}
