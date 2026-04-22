"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LoginModal, SignUpModal, CompanyLoginModal } from "@/components/auth";
import { getAuthedHomeRedirectPath } from "@/lib/auth/getAuthedHomeRedirectPath";
import { prefetchPostLoginDestination } from "@/lib/auth/prefetchPostLoginDestination";

const RETURN_TO_KEY = "bounties:returnTo";

export default function HeroSection() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isCompanyLoginModalOpen, setIsCompanyLoginModalOpen] = useState(false);

  useEffect(() => {
    // Se o usuário caiu na landing com `?returnTo=...`, abrir o modal automaticamente.
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const returnTo = url.searchParams.get("returnTo")?.trim();
    if (!returnTo) return;

    try {
      if (returnTo.startsWith("/")) {
        sessionStorage.setItem(RETURN_TO_KEY, returnTo);
      }
    } catch {
      /* noop */
    }

    url.searchParams.delete("returnTo");
    const qs = url.searchParams.toString();
    window.history.replaceState({}, "", url.pathname + (qs ? `?${qs}` : "") + url.hash);
    setIsLoginModalOpen(true);
  }, []);

  return (
    <div className="bg-[var(--color-card)] rounded-2xl p-8 lg:p-12">
      <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
        CREATE HIGH-LEVEL CONTENT AND GET REWARDED
      </h1>
      <p className="text-lg text-gray-300 mb-8 leading-relaxed">
        Participate in creative campaigns and missions, showcase your talent and
        receive crypto rewards. Our platform connects creators based on quality,
        ensuring the best are always recognized and rewarded.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={() => {
            const target = getAuthedHomeRedirectPath();
            if (target) {
              prefetchPostLoginDestination(router, target);
              router.replace(target);
              return;
            }
            setIsLoginModalOpen(true);
          }}
          className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          SIGN IN
        </button>
        <button
          onClick={() => setIsSignUpModalOpen(true)}
          className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors cursor-pointer"
        >
          BECOME A HOST
        </button>
      </div>

      <div className="flex items-center gap-3 text-gray-300">
        <div className="flex -space-x-2">
          {[
            "/assets/home/card_home/dollar.jpg",
            "/assets/home/card_home/bc.jpg",
            "/assets/home/card_home/deb.jpg",
          ].map((image, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-[var(--color-background)] overflow-hidden"
            >
              <Image
                src={image}
                alt={`Creator ${i + 1}`}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
        <span className="text-sm">
          Join over 300+ creators who already earn with Nido
        </span>
      </div>

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {isSignUpModalOpen && (
        <SignUpModal
          isOpen={isSignUpModalOpen}
          onClose={() => setIsSignUpModalOpen(false)}
          onSwitchToLogin={() => {
            setIsSignUpModalOpen(false);
            setIsCompanyLoginModalOpen(true);
          }}
        />
      )}

      {isCompanyLoginModalOpen && (
        <CompanyLoginModal
          isOpen={isCompanyLoginModalOpen}
          onClose={() => setIsCompanyLoginModalOpen(false)}
          onSwitchToRegister={() => {
            setIsCompanyLoginModalOpen(false);
            setIsSignUpModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
