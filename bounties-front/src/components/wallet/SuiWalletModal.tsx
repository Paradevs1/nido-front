"use client";

import { useState } from "react";
import { useConnectWallet, useWallets, useCurrentWallet } from "@mysten/dapp-kit";
import { FiX } from "react-icons/fi";
import Image from "next/image";

interface SuiWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export default function SuiWalletModal({
  isOpen,
  onClose,
  onConnect,
}: SuiWalletModalProps) {
  const { mutateAsync: connect } = useConnectWallet();
  const wallets = useWallets();
  const { isConnected } = useCurrentWallet();
  
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (walletName: string) => {
    try {
      setError(null);
      console.log("Connecting to SUI wallet:", walletName);
      setConnectingWallet(walletName);
      
      const wallet = wallets.find(w => w.name === walletName);
      if (!wallet) {
        throw new Error(`Wallet ${walletName} not found`);
      }

      await connect({ wallet });
      
      // Pequeno delay para garantir que o estado global atualize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onConnect();
      onClose();
    } catch (error: unknown) {
      console.error("Error connecting SUI wallet:", error);
      setError(error?.message || "Failed to connect wallet. Please try again.");
    } finally {
      setConnectingWallet(null);
    }
  };

  const getWalletIcon = (walletName: string) => {
    const nameLower = walletName.toLowerCase();
    if (nameLower.includes("phantom")) {
      // Phantom Wallet (suporta SUI)
      return "/assets/walletIcons/phantomWalletIcon.png";
    }
    if (nameLower.includes("slash") || nameLower.includes("slush")) {
      // Slash Wallet
      return "/assets/walletIcons/slashWalletIcon.png";
    }
    // Fallback para logo SUI genérico
    return "https://sui.io/favicon.ico";
  };

  // Filtrar apenas Slash Wallet para SUI (pedido do usuário)
  const detectedWallets = wallets.filter((wallet) => {
    const nameLower = wallet.name.toLowerCase();
    return nameLower.includes("slash") || nameLower.includes("slush");
  });

  // Se Slash não for detectada, adicionar item mock para mostrar como "Not installed"
  const displayWallets: any[] = detectedWallets.length > 0 ? detectedWallets : [
    {
      name: "Slash Wallet",
      icon: "/assets/walletIcons/slashWalletIcon.png",
      isInstalled: false
    }
  ];

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
          Select a Wallet to Connect
        </h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          Select from the wallets you have installed
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {displayWallets.map((wallet) => {
            const isInstalled = wallet.isInstalled !== false; // Default true para wallets reais
            
            return (
              <button
                key={wallet.name}
                onClick={() => isInstalled ? handleConnect(wallet.name) : window.open("https://www.slash.fi/", "_blank")}
                disabled={connectingWallet === wallet.name || isConnected || !isInstalled}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                  {getWalletIcon(wallet.name) ? (
                    <Image
                      src={getWalletIcon(wallet.name)}
                      alt={wallet.name}
                      width={32}
                      height={32}
                      className="object-cover w-10 h-10 rounded-full"
                      unoptimized
                      onError={(e) => {
                        // Fallback para emoji se a imagem não carregar
                        (e.target as HTMLImageElement).style.display = "none";
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent && !parent.querySelector("span")) {
                          const fallback = document.createElement("span");
                          fallback.className = "text-lg";
                          fallback.textContent = "🔷";
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-lg">🔷</span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{wallet.name}</p>
                  {connectingWallet === wallet.name && (
                    <div className="text-xs text-gray-400">
                      <p>Connecting...</p>
                      <p className="text-yellow-400 mt-1">Check the wallet extension window</p>
                    </div>
                  )}
                  {!isInstalled && (
                    <p className="text-xs text-red-400">Not installed</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

