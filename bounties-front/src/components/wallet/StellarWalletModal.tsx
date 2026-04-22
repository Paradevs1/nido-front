"use client";

import { useState } from "react";
import { FiX, FiExternalLink } from "react-icons/fi";
import Image from "next/image";
import {
  isAllowed as isFreighterAllowed,
  setAllowed as setFreighterAllowed,
  getAddress as getFreighterAddress,
} from "@stellar/freighter-api";

// ─── Stellar Wallet Registry ────────────────────────────────────────
interface StellarWalletDef {
  id: string;
  name: string;
  icon: string;
  installUrl: string;
  connect: () => Promise<string>;
}

const STELLAR_WALLETS: StellarWalletDef[] = [
  {
    id: "freighter",
    name: "Freighter",
    icon: "/assets/walletIcons/freighterWalletIcon.png",
    installUrl: "https://freighter.app",
    connect: async () => {
      // Skip isConnected() check — it uses content script message passing
      // which fails on HTTP (localhost). Go straight to permission request.

      // 1. Request site permission — triggers Freighter popup directly
      const allowed = await isFreighterAllowed();
      if (!allowed.isAllowed) {
        const result = await setFreighterAllowed();
        if (!result.isAllowed) {
          const err = new Error("USER_REJECTED") as Error & {
            isUserRejection: boolean;
          };
          err.isUserRejection = true;
          throw err;
        }
      }

      // 2. Fetch address
      const { address, error } = await getFreighterAddress();
      if (error) {
        const msg =
          typeof error === "string"
            ? error
            : (error as any)?.message ?? "Unknown Freighter error";
        if (
          msg.toLowerCase().includes("user rejected") ||
          msg.toLowerCase().includes("rejected")
        ) {
          const err = new Error("USER_REJECTED") as Error & {
            isUserRejection: boolean;
          };
          err.isUserRejection = true;
          throw err;
        }
        throw new Error(msg);
      }
      if (!address) {
        throw new Error(
          "Could not retrieve address. Make sure Freighter is unlocked and try again."
        );
      }
      return address;
    },
  },
  // ── Add future wallets below (e.g. Albedo, LOBSTR, xBull) ──
];

// ────────────────────────────────────────────────────────────────────

interface StellarWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string) => void;
}

export default function StellarWalletModal({
  isOpen,
  onClose,
  onConnect,
}: StellarWalletModalProps) {
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (wallet: StellarWalletDef) => {
    try {
      setErrorMsg(null);
      setConnectingId(wallet.id);
      const address = await wallet.connect();
      onConnect(address);
      onClose();
    } catch (err: unknown) {
      const e = err as { isUserRejection?: boolean; message?: string };
      if (e.isUserRejection) return; // user cancelled silently
      setErrorMsg(e.message ?? "Connection failed. Please try again.");
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
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

        <h2 className="text-2xl font-bold text-center mb-2">
          Connect Stellar Wallet
        </h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          Select from the wallets you have installed
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-start gap-2">
            <p className="text-sm text-red-400 flex-1">{errorMsg}</p>
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 flex-shrink-0 mt-0.5"
            >
              <FiExternalLink size={14} />
            </a>
          </div>
        )}

        <div className="space-y-3">
          {STELLAR_WALLETS.map((wallet) => {
            const isConnecting = connectingId === wallet.id;

            return (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet)}
                disabled={isConnecting}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <Image
                    src={wallet.icon}
                    alt={wallet.name}
                    width={32}
                    height={32}
                    className="object-contain w-8 h-8"
                    unoptimized
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent && !parent.querySelector("span")) {
                        const span = document.createElement("span");
                        span.className = "text-lg";
                        span.textContent = "⭐";
                        parent.appendChild(span);
                      }
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 text-left">
                  <p className="font-semibold">{wallet.name}</p>
                  {isConnecting ? (
                    <p className="text-xs text-gray-400">Connecting…</p>
                  ) : (
                    <p className="text-xs text-gray-400">Click to connect</p>
                  )}
                </div>

                {isConnecting && (
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          More Stellar wallets coming soon.
        </p>
      </div>
    </div>
  );
}
