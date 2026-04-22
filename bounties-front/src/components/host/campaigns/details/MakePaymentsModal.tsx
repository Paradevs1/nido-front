"use client";

import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import { CampaignDetails, makePayments } from "@/lib/api/host";
import Button from "@/components/ui/Button";
import Image from "next/image";

interface MakePaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignDetails;
}

export default function MakePaymentsModal({
  isOpen,
  onClose,
  campaign,
}: MakePaymentsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentAnimation, setPaymentAnimation] = useState<any>(null);

  useEffect(() => {
    // Carregar animação de pagamento
    const loadAnimations = async () => {
      try {
        const paymentRes = await fetch("/assets/motion/motion-payment.json");
        const paymentData = await paymentRes.json();
        setPaymentAnimation(paymentData);
      } catch (error) {
        console.error("Error loading animations:", error);
      }
    };
    loadAnimations();
  }, []);

  if (!isOpen) return null;

  const handleMakePayments = async () => {
    try {
      setIsProcessing(true);
      await makePayments(campaign.id, false);
      setIsProcessing(false);
      setShowSuccessModal(true);
    } catch (err: unknown) {
      console.error("Error making payments:", err);
      alert(err.message || "Failed to process payments. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleBackToProfile = () => {
    setShowSuccessModal(false);
    onClose();
    if (typeof window !== "undefined") {
      window.location.href = "/host/profile";
    }
  };

  const handleGoToDashboard = () => {
    setShowSuccessModal(false);
    onClose();
    if (typeof window !== "undefined") {
      window.location.href = "/host/campaign/manage";
    }
  };

  // Modal de Sucesso
  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        <div className="relative z-10 bg-[var(--color-card)] rounded-2xl p-8 max-w-lg w-full mx-4 text-white">
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white"
          >
            <FiX size={20} />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Finished Payment</h2>
            <p className="text-gray-300 mb-6">
              Payments were made automatically to Creators.
            </p>

            <div className="flex justify-center mb-8">
              <div className="w-48 h-48">
                {paymentAnimation && (
                  <Lottie
                    animationData={paymentAnimation}
                    loop={true}
                    autoplay={true}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleBackToProfile}
                className="flex-1 px-6 py-2 text-white bg-transparent border border-white/50 rounded-full font-medium whitespace-nowrap cursor-pointer"
              >
                BACK TO PROFILE
              </button>
              <Button
                variant="default"
                className="flex-1 px-6 py-2 border-[var(--color-primary)] whitespace-nowrap text-base font-bold cursor-pointer"
                onClick={handleGoToDashboard}
              >
                GO TO DASHBOARD
              </Button>
            </div>

            <div />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 bg-[var(--color-card)] rounded-2xl p-8 max-w-md w-full mx-4 text-white">
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white cursor-pointer"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-2xl font-bold text-center mb-8">Make Payments</h2>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              You are about to make payments to the selected winners.
            </p>
            <p className="text-sm text-gray-400">
              Total do Prize:{" "}
              <span className="text-white font-bold">
                ${campaign.total_prize_pool.toLocaleString()}{" "}
                {campaign.payment_token?.toUpperCase()}
              </span>
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            variant="white"
            className="px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-sm sm:text-base cursor-pointer"
            onClick={handleMakePayments}
            disabled={isProcessing}
          >
            {isProcessing ? "PROCESSING..." : "MAKE PAYMENTS"}
          </Button>
        </div>

        <div />
      </div>
    </div>
  );
}
