"use client";

import { useState, useEffect } from "react";
import { sendPaymentKols } from "@/lib/api/host";
import { CampaignDetails } from "@/lib/api/host";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface MakePaymentsKolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignDetails;
}

export default function MakePaymentsKolsModal({
  isOpen,
  onClose,
  campaign,
}: MakePaymentsKolsModalProps) {
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
      await sendPaymentKols(campaign.id);
      setIsProcessing(false);
      setShowSuccessModal(true);
    } catch (err: unknown) {
      console.error("Error making payments to KOLs:", err);
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
  if (showSuccessModal)
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[var(--color-card)] rounded-2xl max-w-lg w-full p-8 text-center">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">Success!</h2>
            <p className="text-gray-300 text-lg">
              Payments sent successfully to all creators
            </p>
          </div>

          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-48 h-48">
              {paymentAnimation ? (
                <Lottie
                  animationData={paymentAnimation}
                  loop={false}
                  autoplay={true}
                />
              ) : (
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 mx-auto">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4">
            <button
              onClick={handleBackToProfile}
              className="cursor-pointer w-full py-4 px-6 bg-[var(--color-primary)] text-white rounded-full font-bold hover:bg-[var(--color-primary)]/90 transition-all"
            >
              BACK TO PROFILE
            </button>
            <button
              onClick={handleGoToDashboard}
              className="cursor-pointer w-full py-4 px-6 border-2 border-white/20 text-white rounded-full font-bold hover:bg-white/10 transition-all"
            >
              GO TO DASHBOARD
            </button>
          </div>
        </div>
      </div>
    );

  // Modal de Confirmação
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-card)] rounded-2xl max-w-lg w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Send Payments to Creators
          </h2>
          <p className="text-gray-300">
            You are about to send payments to all invited creators in this
            private campaign
          </p>
        </div>

        {/* Campaign Info */}
        <div className="bg-[var(--color-background)] rounded-xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-4">{campaign.title}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total Creators:</span>
              <span className="text-white font-medium">
                {campaign.list_kols?.length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total Amount:</span>
              <span className="text-white font-medium">
                ${campaign.total_prize_pool?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
          <div className="flex gap-3">
            <svg
              className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-yellow-500 font-semibold mb-1">
                Important Notice
              </p>
              <p className="text-yellow-500/90 text-sm">
                This action will send the specified amount to each creator's
                wallet. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleMakePayments}
            disabled={isProcessing}
            className="cursor-pointer w-full py-4 px-6 bg-[var(--color-primary)] text-white rounded-full font-bold hover:bg-[var(--color-primary)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                PROCESSING...
              </span>
            ) : (
              "CONFIRM PAYMENT"
            )}
          </button>
          <button
            aria-label="Close"
            onClick={onClose}
            disabled={isProcessing}
            className="cursor-pointer w-full py-4 px-6 border-2 border-white/20 text-white rounded-full font-bold hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

