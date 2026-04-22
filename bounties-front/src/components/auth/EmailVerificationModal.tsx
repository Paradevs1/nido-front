"use client";

import { useState, useEffect } from "react";
import { resendVerificationCode, validateEmailCode } from "@/lib/api/host";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerified: () => void;
  /** Para empilhar acima de outro modal (ex.: login company). */
  stackClassName?: string;
}

export default function EmailVerificationModal({
  isOpen,
  onClose,
  email,
  onVerified,
  stackClassName = "z-50",
}: EmailVerificationModalProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutos em segundos
  const [timerKey, setTimerKey] = useState(0); // Key para forçar reinício do timer

  // Timer de expiração do código
  useEffect(() => {
    if (!isOpen) {
      setTimeRemaining(600);
      return;
    }

    setTimeRemaining(600); // Resetar quando o modal abrir ou timer reiniciar

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timerKey]);

  // Resetar timer quando reenviar código
  const handleResendCode = async () => {
    setError("");
    setSuccess("");

    try {
      setIsResending(true);
      await resendVerificationCode({ email });
      setSuccess("Verification code sent successfully!");
      // Reiniciar o timer forçando o useEffect a recriar o intervalo
      setTimerKey((prev) => prev + 1);
    } catch (error: unknown) {
      console.error("Error resending code:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error resending verification code. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const handleValidateCode = async () => {
    if (!code || code.length < 6) {
      setError("Please enter the verification code");
      return;
    }

    setError("");
    setSuccess("");

    try {
      setIsLoading(true);
      const response = await validateEmailCode({ email, code });
      
      if (response.email_verified) {
        setSuccess("Email verified successfully!");
        setTimeout(() => {
          onVerified();
        }, 1000);
      }
    } catch (error: unknown) {
      console.error("Error validating code:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Invalid verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleValidateCode();
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${stackClassName}`}
    >
      {/* Background Blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 bg-[var(--color-card)] rounded-2xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Verify your email
          </h2>
          <p className="text-gray-300 text-lg">
            We sent a verification code to
          </p>
          <p className="text-[var(--color-primary)] font-medium mt-1">
            {email}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Code expires in {formatTime(timeRemaining)}
          </p>
        </div>

        {/* Verification Form */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Verification Code
            </label>
            <div className="flex gap-2 items-stretch">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  setCode(value);
                  setError("");
                }}
                placeholder="Enter code..."
                maxLength={6}
                className="flex-1 min-w-0 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-[var(--color-primary)] focus:outline-none text-center text-xl tracking-widest font-mono"
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button
                onClick={handleValidateCode}
                disabled={isLoading || !code || code.length < 6}
                type="button"
                className="cursor-pointer bg-white text-black px-3 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 text-sm"
              >
                {isLoading ? "Verifying..." : "VERIFY"}
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-xs mt-1">{error}</p>
            )}
            {success && (
              <p className="text-green-400 text-xs mt-1">{success}</p>
            )}
          </div>

          <div className="text-center">
            <p className="text-gray-300 text-sm mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={isResending}
              type="button"
              className="cursor-pointer bg-gray-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

