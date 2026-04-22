"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CompanyLoginModal from "./HostLoginModal";
import SignUpModal from "./SignUpModal";
import { usePrivy } from "@privy-io/react-auth";
import { getAuthedHomeRedirectPath } from "@/lib/auth/getAuthedHomeRedirectPath";
import { prefetchPostLoginDestination } from "@/lib/auth/prefetchPostLoginDestination";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const privy = usePrivy();
  const { login } = privy;
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  /**
   * Não fechar o modal só porque o Privy ainda tem sessão Twitter/Google no browser —
   * isso impedia escolher Creator vs Host. Com sessão já válida na API,
   * manda direto para creator, host ou admin.
   */
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === "undefined") return;
    const target = getAuthedHomeRedirectPath();
    if (!target) return;
    onClose();
    prefetchPostLoginDestination(router, target);
    router.replace(target);
  }, [isOpen, onClose, router]);

  const closeAllModals = () => {
    setIsCompanyModalOpen(false);
    setIsSignUpModalOpen(false);
    onClose();
  };

  const handleCreatorLogin = async () => {
    try {
      await login({ loginMethods: ["twitter", "google"] });
    } catch (error) {
      console.error("Erro no login:", error);
    }
  };

  if (!isOpen) {
    return null;
  }
  if (!isOpen) return null;

  // Quando um sub-modal estiver aberto, não renderizar o conteúdo do LoginModal
  if (isSignUpModalOpen) {
    return <SignUpModal isOpen={true} onClose={() => closeAllModals()} onSwitchToLogin={() => { setIsSignUpModalOpen(false); setIsCompanyModalOpen(true); }} />;
  }

  if (isCompanyModalOpen) {
    return <CompanyLoginModal isOpen={true} onClose={() => closeAllModals()} onSwitchToRegister={() => { setIsCompanyModalOpen(false); setIsSignUpModalOpen(true); }} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Background Blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-8 w-full max-w-4xl">
        {/* Creator Card */}
        <div
          onClick={handleCreatorLogin}
          className="bg-[var(--color-card)] rounded-3xl p-8 md:p-10 cursor-pointer group flex-1"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 group-hover:text-[var(--color-primary)]">
            Creator <span className="text-[var(--color-primary)]">&gt;</span>
          </h3>
          <p className="text-gray-300 text-base md:text-xl leading-relaxed">
            Want to participate in campaigns and receive money
          </p>
        </div>

        {/* Company Card */}
        <div
          onClick={() => setIsCompanyModalOpen(true)}
          className="bg-[var(--color-card)] rounded-3xl p-8 md:p-10 cursor-pointer group flex-1"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 group-hover:text-[var(--color-primary)]">
            Company <span className="text-[var(--color-primary)]">&gt;</span>
          </h3>
          <p className="text-gray-300 text-base md:text-xl leading-relaxed">
            Want to create campaigns and grow your branding and numbers
          </p>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center px-4">
        <p className="text-gray-300 text-xs md:text-sm">
          Not registered yet?{" "}
          <button
            onClick={() => setIsSignUpModalOpen(true)}
            className="text-[var(--color-primary)] hover:text-orange-400 font-medium underline cursor-pointer"
          >
            Sign Up or Register in here
          </button>
        </p>
      </div>
    </div>
  );
}
