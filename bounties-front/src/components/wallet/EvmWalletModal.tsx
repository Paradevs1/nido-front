"use client";

import { useState, useEffect } from "react";
import { useConnect } from "wagmi";
import { injected } from "@wagmi/connectors";
import { FiX } from "react-icons/fi";
import Image from "next/image";

function MetaMaskIcon() {
  // SVG fornecido pelo projeto (variant: background)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      className="w-8 h-8"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#FF5C16"
        d="m19.821 19.918-3.877-1.131-2.924 1.712h-2.04l-2.926-1.712-3.875 1.13L3 16.02l1.179-4.327L3 8.034 4.179 3.5l6.056 3.544h3.53L19.821 3.5 21 8.034l-1.179 3.658L21 16.02z"
      />
      <path
        fill="#FF5C16"
        d="m4.18 3.5 6.055 3.547-.24 2.434zm3.875 12.52 2.665 1.99-2.665.777zm2.452-3.286-.512-3.251-3.278 2.21h-.002v.001l.01 2.275 1.33-1.235zM19.82 3.5l-6.056 3.547.24 2.434zm-3.875 12.52-2.665 1.99 2.665.777zm1.339-4.326v-.002zl-3.279-2.21-.512 3.25h2.451l1.33 1.236z"
      />
      <path
        fill="#E34807"
        d="m8.054 18.787-3.875 1.13L3 16.022h5.054zm2.452-6.054.74 4.7-1.026-2.614-3.497-.85 1.33-1.236zm5.44 6.054 3.875 1.13L21 16.022h-5.055zm-2.452-6.054-.74 4.7 1.026-2.614 3.497-.85-1.331-1.236z"
      />
      <path
        fill="#FF8D5D"
        d="m3 16.02 1.179-4.328h2.535l.01 2.276 3.496.85 1.026 2.613-.527.576-2.665-1.989H3zm18 0-1.179-4.328h-2.535l-.01 2.276-3.496.85-1.026 2.613.527.576 2.665-1.989H21zm-7.235-8.976h-3.53l-.24 2.435 1.251 7.95h1.508l1.252-7.95z"
      />
      <path
        fill="#661800"
        d="M4.179 3.5 3 8.034l1.179 3.658h2.535l3.28-2.211zm5.594 10.177H8.625l-.626.6 2.222.54zM19.821 3.5 21 8.034l-1.179 3.658h-2.535l-3.28-2.211zm-5.593 10.177h1.15l.626.6-2.224.541zm-1.209 5.271.262-.94-.527-.575h-1.509l-.527.575.262.94"
      />
      <path fill="#C0C4CD" d="M13.02 18.948V20.5h-2.04v-1.552z" />
      <path
        fill="#E7EBF6"
        d="m8.055 18.785 2.927 1.714v-1.552l-.262-.94zm7.89 0L13.02 20.5v-1.552l.262-.94z"
      />
    </svg>
  );
}

interface EvmWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export default function EvmWalletModal({
  isOpen,
  onClose,
  onConnect,
}: EvmWalletModalProps) {
  const { connect, isPending } = useConnect();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [rabbyDetected, setRabbyDetected] = useState(false);
  const [metamaskDetected, setMetamaskDetected] = useState(false);

  // Re-verificar detecção da Rabby quando o modal abrir
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      // Verificação inicial
      const checkRabby = () => {
        const ethereum = (window as any).ethereum;
        if (!ethereum) return false;
        
        // Verificar se é array
        if (Array.isArray(ethereum)) {
          return ethereum.some((p: any) => p?.isRabby || p?._isRabby);
        }
        
        // Verificar propriedades diretas
        if (ethereum.isRabby || ethereum._isRabby) return true;
        
        // Verificar providers
        if (Array.isArray(ethereum.providers)) {
          return ethereum.providers.some((p: any) => p?.isRabby || p?._isRabby);
        }
        
        return false;
      };

      const checkMetamask = () => {
        const ethereum = (window as any).ethereum;
        if (!ethereum) return false;

        // Alguns ambientes expõem múltiplos providers
        if (Array.isArray(ethereum)) {
          return ethereum.some((p: any) => p?.isMetaMask);
        }

        if (ethereum.isMetaMask) return true;

        if (Array.isArray(ethereum.providers)) {
          return ethereum.providers.some((p: any) => p?.isMetaMask);
        }

        // Alguns providers expõem um map/obj de providers (EIP-6963 / implementações diferentes)
        const providerMap = (ethereum as any).providerMap;
        if (providerMap) {
          try {
            if (typeof providerMap.get === "function") {
              const maybe = providerMap.get("MetaMask");
              if (maybe?.isMetaMask) return true;
            }
            if (typeof providerMap.values === "function") {
              for (const p of providerMap.values()) {
                if (p?.isMetaMask) return true;
              }
            }
          } catch {
            // ignore
          }
        }

        return false;
      };
      
      setRabbyDetected(checkRabby());
      setMetamaskDetected(checkMetamask());
      
      // Listener para quando a extensão for carregada
      const handleEthereum = () => {
        setRabbyDetected(checkRabby());
        setMetamaskDetected(checkMetamask());
      };
      
      window.addEventListener('ethereum#initialized', handleEthereum);
      if ((window as any).ethereum) {
        (window as any).ethereum.on?.('connect', handleEthereum);
      }
      
      return () => {
        window.removeEventListener('ethereum#initialized', handleEthereum);
        if ((window as any).ethereum?.removeListener) {
          (window as any).ethereum.removeListener('connect', handleEthereum);
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getAnnouncedProviders = (): Array<{ info?: any; provider?: any }> => {
    if (typeof window === "undefined") return [];
    const arr = (window as any).__bountiesEip6963Providers;
    return Array.isArray(arr) ? arr : [];
  };

  const getMetaMaskProvider = () => {
    if (typeof window === "undefined") return null;
    // NUNCA confiar só em isMetaMask: Rabby/Brave/etc podem setar isso por compatibilidade.
    const announced = getAnnouncedProviders();
    const byRdns = announced.find((x: any) => String(x?.info?.rdns || "").toLowerCase() === "io.metamask");
    if (byRdns?.provider) return byRdns.provider;
    // Fallback ultra conservador: somente se existir um provider único e não for Rabby
    const eth = (window as any).ethereum;
    if (eth && eth.isMetaMask === true && !(eth.isRabby === true || eth._isRabby === true)) return eth;
    return null;
  };

  const getRabbyProvider = () => {
    if (typeof window === "undefined") return null;
    const eth = (window as any).ethereum;
    if (eth) {
      if (eth.isRabby === true || eth._isRabby === true) return eth;
      if (Array.isArray(eth)) {
        const p = eth.find((p: any) => p?.isRabby === true || p?._isRabby === true);
        if (p) return p;
      }
      if (Array.isArray(eth.providers)) {
        const p = eth.providers.find((p: any) => p?.isRabby === true || p?._isRabby === true);
        if (p) return p;
      }
    }
    const announced = getAnnouncedProviders();
    const byFlag = announced.find((x: any) => x?.provider?.isRabby === true || x?.provider?._isRabby === true);
    if (byFlag?.provider) return byFlag.provider;
    const byRdns = announced.find((x: any) => String(x?.info?.rdns || "").toLowerCase().includes("rabby"));
    if (byRdns?.provider) return byRdns.provider;
    return null;
  };

  const handleConnect = async (walletId: "metamask" | "rabby") => {
    try {
      setConnectingWallet(walletId);

      const provider = walletId === "metamask" ? getMetaMaskProvider() : getRabbyProvider();
      if (!provider) {
        window.open(
          walletId === "metamask" ? "https://metamask.io/download/" : "https://rabby.io/",
          "_blank"
        );
        return;
      }

      // Connector criado com provider específico => sem "seletor" da Rabby no meio.
      const connector = injected({
        shimDisconnect: true,
        target: {
          id: walletId,
          name: walletId === "metamask" ? "MetaMask" : "Rabby Wallet",
          provider: () => provider,
        },
      });

      await connect({ connector });
      onConnect();
      onClose();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setConnectingWallet(null);
    }
  };

  // Função melhorada para detectar Rabby Wallet
  const detectRabbyWallet = (): boolean => {
    if (typeof window === "undefined") return false;
    
    let ethereum = (window as any).ethereum;
    if (!ethereum) return false;
    
    // Se window.ethereum for um array (múltiplas extensões), procurar pela Rabby
    if (Array.isArray(ethereum)) {
      return ethereum.some((provider: any) => {
        if (provider?.isRabby || provider?._isRabby) return true;
        const name = provider?.providerName || provider?.constructor?.name || "";
        if (name.toLowerCase().includes("rabby")) return true;
        return false;
      });
    }
    
    // Verificar propriedades diretas
    if (ethereum.isRabby || ethereum._isRabby) return true;
    
    // Verificar se está no array de providers (algumas extensões injetam múltiplos providers)
    if (Array.isArray(ethereum.providers)) {
      return ethereum.providers.some((provider: any) => {
        if (provider?.isRabby || provider?._isRabby) return true;
        const name = provider?.providerName || provider?.constructor?.name || "";
        if (name.toLowerCase().includes("rabby")) return true;
        return false;
      });
    }
    
    // Verificar pelo nome do provider
    const providerName = ethereum.providerName || ethereum.constructor?.name || "";
    if (providerName.toLowerCase().includes("rabby")) return true;
    
    // Verificar propriedades específicas da Rabby
    if (ethereum.rabby || ethereum._rabby) return true;
    
    // Verificar se há métodos ou propriedades que indiquem Rabby
    try {
      const keys = Object.keys(ethereum);
      if (keys.some(key => key.toLowerCase().includes('rabby'))) {
        return true;
      }
      
      // Verificar se há propriedades internas que indiquem Rabby
      const proto = Object.getPrototypeOf(ethereum);
      if (proto) {
        const protoKeys = Object.keys(proto);
        if (protoKeys.some(key => key.toLowerCase().includes('rabby'))) {
          return true;
        }
      }
    } catch (e) {
      // Ignorar erros na detecção
    }
    
    return false;
  };

  const getWalletIcon = (connectorId: string, connectorName?: string) => {
    // Verificar primeiro se é uma wallet específica injetada
    if (connectorId === "injected" && typeof window !== "undefined") {
      if (detectRabbyWallet()) {
        // Rabby logo local
        return "/assets/walletIcons/rabbyWalletIcon.png";
      }
      const ethereum = (window as any).ethereum;
      if (ethereum?.isCoinbaseWallet) {
        return "https://www.coinbase.com/favicon.ico";
      }
      if (ethereum?.isBraveWallet) {
        return "https://brave.com/static-assets/images/brave-logo-sans-text.svg";
      }
    }

    switch (connectorId) {
      case "metaMask":
        // MetaMask logo do repositório oficial
        return "https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg";
      case "injected":
        // Se for Rabby mas não detectou isRabby, tentar detectar pelo nome
        if (detectRabbyWallet()) {
          return "/assets/walletIcons/rabbyWalletIcon.png";
        }
        // Fallback para wallet genérica injetada - usar ícone Ethereum
        return "https://upload.wikimedia.org/wikipedia/commons/3/36/Ethereum_logo_2014.svg";
      case "walletConnect":
        // WalletConnect logo
        return "https://avatars.githubusercontent.com/u/37784886?s=200&v=4";
      default:
        // Tentar usar o nome do connector para encontrar ícone
        if (connectorName?.toLowerCase().includes("metamask")) {
          return "https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg";
        }
        return null;
    }
  };

  const getWalletName = (connector: any) => {
    if (connector.id === "metamask") return "MetaMask";
    if (connector.id === "rabby") return "Rabby";
    if (connector.id === "injected") {
      if (detectRabbyWallet()) {
        return "Rabby";
      }
      if (typeof window !== "undefined" && (window as any).ethereum?.isCoinbaseWallet) {
        return "Coinbase Wallet";
      }
      return "Injected Wallet";
    }
    if (connector.id === "walletConnect") return "WalletConnect";
    return connector.name || "Unknown Wallet";
  };

  const isRabbyInstalled = detectRabbyWallet() || rabbyDetected;
  const isMetamaskInstalled = (() => {
    if (typeof window === "undefined") return false;
    const announced = (window as any).__bountiesEip6963Providers;
    if (Array.isArray(announced)) {
      // Preferir rdns oficial para evitar "metamask compat" de outras wallets
      return announced.some((x: any) => String(x?.info?.rdns || "").toLowerCase() === "io.metamask");
    }
    return metamaskDetected;
  })();

  const displayItems: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    isInstalled: boolean;
    installUrl: string;
  }> = [
    {
      id: "metamask",
      label: "MetaMask",
      icon: <MetaMaskIcon />,
      // Agora baseado no provider real encontrado, não no conector do wagmiConfig
      isInstalled: isMetamaskInstalled && !!getMetaMaskProvider(),
      installUrl: "https://metamask.io/download/",
    },
    {
      id: "rabby",
      label: "Rabby Wallet",
      icon: (
        <Image
          src="/assets/walletIcons/rabbyWalletIcon.png"
          alt="Rabby Wallet"
          width={32}
          height={32}
          className="object-contain w-8 h-8 rounded-full"
          unoptimized
        />
      ),
      isInstalled: isRabbyInstalled && !!getRabbyProvider(),
      installUrl: "https://rabby.io/",
    },
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

        <div className="space-y-3">
          {displayItems.map((item) => {
            const isInstalled = item.isInstalled;
            
            return (
              <button
                key={item.id}
                onClick={() =>
                  isInstalled
                    ? handleConnect(item.id as "metamask" | "rabby")
                    : window.open(item.installUrl, "_blank")
                }
                disabled={isPending || connectingWallet === item.id || !isInstalled}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                  {item.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{item.label}</p>
                  {connectingWallet === item.id && (
                    <p className="text-xs text-gray-400">Connecting...</p>
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

