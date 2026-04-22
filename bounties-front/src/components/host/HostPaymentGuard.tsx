"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getActiveAccount } from "@/lib/api/host";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import {
  HOST_PENDING_ACTIVATION_PATH,
  isHostUserInactive,
} from "@/lib/auth/hostAccountStatus";

/** Ativar para exigir pagamento à plataforma (Nido) para criar conta host. Atualmente desativado. */
const ENABLE_PAYMENT_GUARD = false;

const ActivateAccountModal = dynamic(
  () => import("./create/ActivateAccountModal"),
  { ssr: false }
);

interface HostPaymentGuardProps {
  children: React.ReactNode;
}

export default function HostPaymentGuard({ children }: HostPaymentGuardProps) {
  const { user, isAuthenticated, isHostAuthenticated, login } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingPayment, setIsCheckingPayment] = useState(ENABLE_PAYMENT_GUARD);
  const [needsPayment, setNeedsPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(ENABLE_PAYMENT_GUARD);
  const [, setError] = useState<string | null>(null);

  // Inactive: primeiro concluir /host/create; só então pending-activation
  useEffect(() => {
    if (!isAuthenticated || !isHostAuthenticated || !user) return;

    if (isHostUserInactive(user)) {
      if (user.registerCompleted === false) {
        if (pathname !== "/host/create") {
          router.replace("/host/create");
        }
        return;
      }
      if (pathname !== HOST_PENDING_ACTIVATION_PATH) {
        router.replace(HOST_PENDING_ACTIVATION_PATH);
      }
      return;
    }

    if (!user.registerCompleted && pathname !== "/host/create") {
      router.push("/host/create");
    }
  }, [isAuthenticated, isHostAuthenticated, user, router, pathname]);

  // Fluxo de verificação de pagamento (apenas quando ENABLE_PAYMENT_GUARD === true)
  useEffect(() => {
    if (!ENABLE_PAYMENT_GUARD) {
      setIsCheckingPayment(false);
      setIsLoading(false);
      return;
    }
    const checkPaymentStatus = async () => {
      if (!isAuthenticated || !isHostAuthenticated) {
        setIsLoading(false);
        setIsCheckingPayment(false);
        return;
      }
      if (user && isHostUserInactive(user)) {
        setIsLoading(false);
        setIsCheckingPayment(false);
        return;
      }
      if (user && !user.registerCompleted) {
        if (pathname !== "/host/create") router.push("/host/create");
        setIsLoading(false);
        setIsCheckingPayment(false);
        return;
      }
      if (pathname === "/host/create") {
        setIsLoading(false);
        setIsCheckingPayment(false);
        return;
      }
      if (user?.active_account_host === true) {
        setNeedsPayment(false);
        setIsCheckingPayment(false);
        setIsLoading(false);
        return;
      }
      try {
        const response = await getActiveAccount();
        if (response.active_account_host === true) {
          if (user) login({ ...user, active_account_host: true });
          setNeedsPayment(false);
        } else {
          setNeedsPayment(true);
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
        setNeedsPayment(true);
      } finally {
        setIsCheckingPayment(false);
        setIsLoading(false);
      }
    };
    checkPaymentStatus();
  }, [isAuthenticated, isHostAuthenticated, user, router, login, pathname]);

  const handlePaymentSuccess = async () => {
    if (!ENABLE_PAYMENT_GUARD) return;
    try {
      const response = await getActiveAccount();
      if (response.active_account_host === true) {
        if (user) login({ ...user, active_account_host: true });
        setNeedsPayment(false);
      } else {
        setError("Payment not confirmed. Please contact support.");
      }
    } catch {
      setError("Failed to verify payment. Please refresh and try again.");
    }
  };

  if (ENABLE_PAYMENT_GUARD && (isLoading || isCheckingPayment)) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "var(--color-background)" }}
      >
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (ENABLE_PAYMENT_GUARD && needsPayment) {
    return (
      <div
        className="fixed inset-0 z-[100]"
        style={{ background: "var(--color-background)" }}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Account Activation Required</h2>
            <p className="text-gray-400">Please complete the payment to activate your account</p>
          </div>
        </div>
        <ActivateAccountModal
          isOpen={true}
          onClose={() => {}}
          onSuccess={handlePaymentSuccess}
          canClose={false}
        />
      </div>
    );
  }

  return <>{children}</>;
}

