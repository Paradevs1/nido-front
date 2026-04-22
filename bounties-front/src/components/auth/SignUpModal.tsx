"use client";

import { useState } from "react";
import Image from "next/image";
import EmailVerificationModal from "./EmailVerificationModal";
import {
  setHostEmailVerificationPending,
  clearHostEmailVerificationPending,
} from "@/lib/auth/hostEmailVerificationPending";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export default function SignUpModal({ isOpen, onClose, onSwitchToLogin }: SignUpModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [pendingUserData, setPendingUserData] = useState<{
    userData: any;
    token: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSignUp = async () => {
    const username = (
      document.getElementById("username-signup-input") as HTMLInputElement
    ).value.trim();
    const email = (
      document.getElementById("email-signup-input") as HTMLInputElement
    ).value.trim();
    const password = (
      document.getElementById("password-signup-input") as HTMLInputElement
    ).value;
    const confirmPassword = (
      document.getElementById(
        "confirm-password-signup-input"
      ) as HTMLInputElement
    ).value;

    // Validação básica
    if (!username || !email || !password || !confirmPassword) {
      setPasswordError("Please fill in all fields");
      return;
    }

    if (!acceptedTerms) {
      setPasswordError("You must accept the Terms & Conditions and Privacy Policy to continue");
      return;
    }

    // Validação de senhas iguais
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");

    try {
      setIsLoading(true);

      // Importar dinamicamente para evitar problemas de SSR
      const { registerHost } = await import("@/lib/api/auth");

      const response = await registerHost({ username, email, password });

      setHostEmailVerificationPending(email);

      // Mapear a resposta do backend para o formato do User
      const userData = {
        id: response.user._id || response.user.id,
        username: response.user.username,
        email: response.user.email,
        role: "host" as const,
        avatar:
          response.user.logo_company || response.user.twitter_profile_image,
        createdAt: new Date(response.user.createdAt || Date.now()),
        updatedAt: new Date(response.user.updatedAt || Date.now()),
      };

      setPendingUserData({ userData, token: response.token });
      setVerificationEmail(email);
      setIsVerificationModalOpen(true);
    } catch (error: unknown) {
      console.error("Error during registration:", error);
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSignUp();
    }
  };

  const handleEmailVerified = () => {
    clearHostEmailVerificationPending();
    // Nao auto-logar apos criar conta — host deve logar manualmente com email/senha
    setIsVerificationModalOpen(false);
    setPendingUserData(null);
    onClose();
    // Abrir modal de login company
    if (onSwitchToLogin) onSwitchToLogin();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
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
            You're one step away
          </h2>
          <p className="text-gray-300 text-lg">
            From earning in global standards
          </p>
        </div>

        {/* Sign Up Form */}
        <div className="space-y-4 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username-signup-input"
                placeholder="Enter your username..."
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[var(--color-primary)] focus:outline-none"
                onKeyDown={handleKeyDown}
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email-signup-input"
                placeholder="Enter your email address..."
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[var(--color-primary)] focus:outline-none"
                onKeyDown={handleKeyDown}
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password-signup-input"
                placeholder="Enter your password..."
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[var(--color-primary)] focus:outline-none"
                onKeyDown={handleKeyDown}
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password-signup-input"
                placeholder="Confirm your password..."
                className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg border focus:outline-none transition-colors ${
                  passwordError 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-600 focus:border-[var(--color-primary)]'
                }`}
                onKeyDown={handleKeyDown}
              />
            </div>

            {passwordError && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">{passwordError}</p>
              </div>
            )}

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-[var(--color-primary)] bg-gray-700 border-gray-600 rounded focus:ring-[var(--color-primary)] focus:ring-2"
              />
              <label htmlFor="terms-checkbox" className="text-gray-300 text-xs">
                By continuing, you acknowledge that you understand and agree to
                the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              onClick={handleSignUp}
              disabled={isLoading || !acceptedTerms}
              type="button"
              className="cursor-pointer w-full bg-white text-black py-4 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "SIGN UP"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-gray-300 text-sm">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-[var(--color-primary)] hover:underline font-medium cursor-pointer"
            >
              Login here
            </button>
          </p>
          <p className="text-gray-300 text-sm">
            Need help? Contact us now at{" "}
            <a
              href="mailto:nidodotglobal@gmail.com"
              className="text-[var(--color-primary)] hover:underline"
            >
              nidodotglobal@gmail.com
            </a>
          </p>

          {/* COMENTADO PARA DESENVOLVER TERMOS E POLÍTICAS DE PRIVACIDADE
          <p className="text-gray-400 text-xs">
            By continuing, you acknowledge that you understand and agree to the{" "}
            <a href="#" className="text-[var(--color-primary)] hover:underline">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-[var(--color-primary)] hover:underline">
              Privacy Policy
            </a>
          </p> */}

          <div />
        </div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setPendingUserData(null);
        }}
        email={verificationEmail}
        onVerified={handleEmailVerified}
      />
    </div>
  );
}
