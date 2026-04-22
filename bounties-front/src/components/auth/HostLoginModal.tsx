"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useUser } from "@/lib/contexts/UserContext";
import {
  HOST_PENDING_ACTIVATION_PATH,
  resolveHostAccountStatusFromLogin,
} from "@/lib/auth/hostAccountStatus";
import {
  getHostEmailVerificationPending,
  clearHostEmailVerificationPending,
  setHostEmailVerificationPending,
} from "@/lib/auth/hostEmailVerificationPending";
import { AuthApiError, loginHost } from "@/lib/api/auth";
import {
  BRAND_CONTACT_EMAIL,
  BRAND_CONTACT_MAILTO,
} from "@/lib/branding/links";
import EmailVerificationModal from "./EmailVerificationModal";

function shouldOfferEmailVerification(error: unknown): boolean {
  if (error instanceof AuthApiError) {
    if (error.code === "EMAIL_NOT_VERIFIED") return true;
    // login-host só usa 403 para e-mail não verificado
    if (error.status === 403) return true;
  }
  if (error instanceof Error) {
    return /verify your email|not verified|email not verified/i.test(
      error.message
    );
  }
  return false;
}

interface CompanyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export default function CompanyLoginModal({ isOpen, onClose, onSwitchToRegister }: CompanyLoginModalProps) {
  const { login: authLogin, logout: authLogout } = useAuth();
  const { login: userLogin } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setIsVerificationOpen(false);
      setLoginSuccess("");
      return;
    }
    const pending = getHostEmailVerificationPending();
    if (pending) {
      setVerificationEmail(pending);
      setIsVerificationOpen(true);
      requestAnimationFrame(() => {
        const el = document.getElementById(
          "email-company-input"
        ) as HTMLInputElement | null;
        if (el && !el.value.trim()) el.value = pending;
      });
    } else {
      setIsVerificationOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCompanyLogin = async () => {
    const email = (document.getElementById('email-company-input') as HTMLInputElement).value.trim();
    const password = (document.getElementById('password-company-input') as HTMLInputElement).value;

    // Validação básica
    if (!email || !password) {
      setLoginError("Please fill in all fields");
      return;
    }

    setLoginError("");
    setLoginSuccess("");

    try {
      setIsLoading(true);
      // Limpar sessao anterior (creator) antes de logar como host
      authLogout();

      const response = await loginHost({ email, password });

      clearHostEmailVerificationPending();

      const userType = (response.user.user_type || response.user.userType || '').toUpperCase();
      const isAdmin = userType === 'ADMIN';

      const accountStatus = isAdmin
        ? ('active' as const)
        : resolveHostAccountStatusFromLogin(response.user, response.token);

      const userData = {
        id: response.user._id || response.user.id,
        name: response.user.name || response.user.username || '',
        username: response.user.username,
        email: response.user.email,
        role: (isAdmin ? 'admin' : 'host') as any,
        avatar: response.user.logo_company || response.user.twitter_profile_image,
        registerCompleted: response.user.registerCompleted ?? (isAdmin ? true : undefined),
        accountStatus,
        createdAt: new Date(response.user.createdAt || Date.now()),
        updatedAt: new Date(response.user.updatedAt || Date.now()),
      };

      await authLogin(userData, response.token);
      userLogin(userData);
      onClose();

      if (isAdmin) {
        window.location.href = '/admin';
        return;
      }

      // Usar window.location para garantir full reload (cookie httpOnly ja setado)
      // Perfil da empresa antes da tela de aprovação (inactive)
      if (userData.registerCompleted === false) {
        window.location.href = '/host/create';
        return;
      }
      if (accountStatus === 'inactive') {
        window.location.href = HOST_PENDING_ACTIVATION_PATH;
        return;
      }
      window.location.href = '/host/campaign';
    } catch (error: unknown) {
      console.error("Error during login:", error);
      const normalizedEmail = email.trim().toLowerCase();
      if (shouldOfferEmailVerification(error)) {
        const targetEmail =
          normalizedEmail || getHostEmailVerificationPending() || "";
        if (targetEmail) {
          setHostEmailVerificationPending(targetEmail);
          setVerificationEmail(targetEmail);
          setIsVerificationOpen(true);
          setLoginError("");
        } else {
          setLoginError(
            error instanceof Error
              ? error.message
              : "Login failed. Please try again."
          );
        }
      } else {
        setLoginError(
          error instanceof Error
            ? error.message
            : "Login failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); 
      handleCompanyLogin();
    }
  };

  const handleVerificationVerified = () => {
    clearHostEmailVerificationPending();
    setIsVerificationOpen(false);
    setLoginSuccess("Email verified! You can sign in now.");
  };

  return (
    <>
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
            Company Login
          </h2>
          <p className="text-gray-300 text-lg">
            Access your company dashboard
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCompanyLogin();
          }}
          className="space-y-4 mb-8"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email-company-input" className="block text-white text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email-company-input"
                placeholder="Enter your company email..."
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-[var(--color-primary)] focus:outline-none"
                onKeyDown={handleKeyDown}
              />
            </div>

            <div>
              <label htmlFor="password-company-input" className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password-company-input"
                placeholder="Enter your password..."
                autoComplete="current-password"
                className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg border focus:outline-none transition-colors ${
                  loginError 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-600 focus:border-[var(--color-primary)]'
                }`}
                onKeyDown={handleKeyDown}
              />
            </div>
            
            {loginSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/60 text-emerald-300 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">{loginSuccess}</p>
              </div>
            )}

            {loginError && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">{loginError}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="cursor-pointer w-full bg-white text-black py-4 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'LOGIN'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-gray-300 text-sm">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-[var(--color-primary)] hover:underline font-medium cursor-pointer"
            >
              Sign up here
            </button>
          </p>
          <p className="text-gray-300 text-sm">
            Need help? Contact us at{" "}
            <a
              href={BRAND_CONTACT_MAILTO}
              className="text-[var(--color-primary)] hover:underline"
            >
              {BRAND_CONTACT_EMAIL}
            </a>
          </p>

          <div />
        </div>
      </div>
    </div>

    <EmailVerificationModal
      isOpen={isVerificationOpen}
      onClose={() => setIsVerificationOpen(false)}
      email={verificationEmail}
      onVerified={handleVerificationVerified}
      stackClassName="z-[100]"
    />
    </>
  );
}
