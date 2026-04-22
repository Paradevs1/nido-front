"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName } from "@solana/wallet-adapter-base";
import { FiX } from "react-icons/fi";
import Image from "next/image";

interface SolanaWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export default function SolanaWalletModal({
  isOpen,
  onClose,
  onConnect,
}: SolanaWalletModalProps) {
  const { select, wallets, connect, connecting, wallet } = useWallet();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (walletName: WalletName) => {
    try {
      setConnectingWallet(walletName);
      
      const selectedWallet = wallets.find((w) => w.adapter.name === walletName);
      
      if (!selectedWallet) {
        throw new Error(`Wallet ${walletName} not found`);
      }

      if (selectedWallet.adapter.readyState !== "Installed") {
        throw new Error(`${walletName} is not installed. Please install it first.`);
      }

      // Selecionar a carteira no hook primeiro para manter o estado sincronizado
      select(walletName);
      
      // Usar o adapter diretamente para conectar (mais confiável)
      // Isso evita o problema de WalletNotSelectedError
      await selectedWallet.adapter.connect();
      
      onConnect();
      onClose();
    } catch (error: unknown) {
      console.error("Error connecting Solana wallet:", error);
      
      // Se for WalletNotSelectedError ou erro de conexão, não mostrar erro ao usuário
      // pois isso pode acontecer se o usuário cancelar a conexão
      if (error?.name !== "WalletNotSelectedError" && error?.name !== "WalletConnectionError") {
        console.warn("Failed to connect wallet:", error.message);
      }
    } finally {
      setConnectingWallet(null);
    }
  };

  const getWalletIcon = (walletName: WalletName) => {
    const nameLower = walletName.toLowerCase();
    if (nameLower.includes("phantom")) {
      return "/assets/walletIcons/phantomWalletIcon.png";
    }
    // Fallback para outras wallets Solana
    return null;
  };

  // Filtrar apenas Phantom Wallet (pedido do usuário)
  const availableWallets = (wallets || []).filter((wallet) => {
    const nameLower = wallet.adapter.name.toLowerCase();
    return nameLower.includes("phantom");
  });

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

        <div className="space-y-3">
          {availableWallets.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No supported Solana wallets found.</p>
              <p className="text-sm mt-2">
                Please install Phantom Wallet.
              </p>
            </div>
          ) : (
            availableWallets.map((wallet) => (
              <button
                key={wallet.adapter.name}
                onClick={() => handleConnect(wallet.adapter.name)}
                disabled={connecting || connectingWallet === wallet.adapter.name || !wallet.adapter.readyState}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                  {getWalletIcon(wallet.adapter.name) ? (
                    <Image
                      src={getWalletIcon(wallet.adapter.name)!}
                      alt={wallet.adapter.name}
                      width={32}
                      height={32}
                      className="object-contain w-8 h-8"
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
                  <p className="font-semibold">{wallet.adapter.name}</p>
                  {connectingWallet === wallet.adapter.name && (
                    <p className="text-xs text-gray-400">Connecting...</p>
                  )}
                  {wallet.adapter.readyState === "Installed" && (
                    <p className="text-xs text-gray-500">Installed</p>
                  )}
                  {wallet.adapter.readyState === "NotDetected" && (
                    <p className="text-xs text-red-400">Not installed</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
