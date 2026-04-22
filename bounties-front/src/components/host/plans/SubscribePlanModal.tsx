"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { FiX, FiInfo } from "react-icons/fi";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import { planCreate, planConfirm } from "@/lib/api/plan";
import {
  sendEVMTransaction,
  sendSolanaTransaction,
  sendSuiTransaction,
} from "@/lib/wallet/transactions";
import { useWalletContext } from "@/lib/contexts/WalletContext";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import Button from "@/components/ui/Button";
import Image from "next/image";
import CustomSelect from "@/components/ui/CustomSelect";
import { TOKENS, chainNameToId } from "@/lib/wallet/config";
import dynamic from "next/dynamic";
const EvmWalletModal = dynamic(() => import("@/components/wallet/EvmWalletModal"), { ssr: false });
const SuiWalletModal = dynamic(() => import("@/components/wallet/SuiWalletModal"), { ssr: false });
const SolanaWalletModal = dynamic(() => import("@/components/wallet/SolanaWalletModal"), { ssr: false });

if (typeof window !== "undefined") {
  // @ts-ignore - CSS import handled at runtime
  import("@solana/wallet-adapter-react-ui/styles.css");
}

interface SubscribePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PLAN_CORE_AMOUNT = 300;

const chains = [
  { value: "base", label: "Base" },
  { value: "sui", label: "Sui" },
];

const DESTINATION_FALLBACK: Record<"evm" | "solana" | "sui", string | undefined> = {
  evm: process.env.NEXT_PUBLIC_DESTINATION_EVM ?? "0x8ce17196ED839FC0Fd62F725780BbcA087774eC3",
  solana: process.env.NEXT_PUBLIC_DESTINATION_SOLANA ?? "EXmzSxNEdrzk4sCY9TjrL1G9ygbk6iG3wrAnYaMpJZ4c",
  sui: process.env.NEXT_PUBLIC_DESTINATION_SUI ?? "0x19f1b5022527af499f5a62acbd06ee0d8acbae2fc4a0d19ee6cc6d8884cb414c",
};

const CurrencyIcon = () => (
  <Image
    src="https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
    alt="USDC"
    width={16}
    height={16}
    className="rounded-full"
    unoptimized
  />
);

const truncateAddress = (address: string) => {
  if (!address) return "";
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function SubscribePlanModal({
  isOpen,
  onClose,
  onSuccess,
}: SubscribePlanModalProps) {
  const [selectedChain, setSelectedChain] = useState("");
  const [selectedToken, setSelectedToken] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSolanaConnectRequested, setIsSolanaConnectRequested] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showEvmWalletModal, setShowEvmWalletModal] = useState(false);
  const [showSuiWalletModal, setShowSuiWalletModal] = useState(false);
  const [showSolanaWalletModal, setShowSolanaWalletModal] = useState(false);
  const [paymentAnimation, setPaymentAnimation] = useState<any>(null);

  const walletContext = useWalletContext();
  const solanaConnection = useConnection();
  const solanaWallet = useWallet();
  const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransaction();
  const previousChainTypeRef = useRef<"evm" | "solana" | "sui" | null>(null);

  const isWalletConnected = useMemo(() => {
    if (!selectedChain) return false;
    const chainLower = selectedChain.toLowerCase();
    if (chainLower === "solana") return walletContext.isWalletConnected(selectedChain);
    if (chainLower === "sui") return walletContext.isWalletConnected(selectedChain);
    return walletContext.isEvmConnected && !!walletContext.evmAddress;
  }, [selectedChain, walletContext]);

  const availableTokens = useMemo(() => {
    if (!selectedChain) return [];
    const chainLower = selectedChain.toLowerCase();
    const chainTokens = TOKENS[chainLower as keyof typeof TOKENS];
    if (!chainTokens) return [];
    return Object.keys(chainTokens).map((token) => ({
      value: token.toLowerCase(),
      label: token,
    }));
  }, [selectedChain]);

  useEffect(() => {
    const loadAnimations = async () => {
      try {
        const paymentRes = await fetch("/assets/motion/motion-payment.json");
        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          if (paymentData) setPaymentAnimation(paymentData);
        }
      } catch {
        // ignore
      }
    };
    loadAnimations();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSelectedChain("");
    setSelectedToken("");
    walletContext.disconnectEvm();
    walletContext.disconnectSolana();
    walletContext.disconnectSui();
  }, [isOpen]);

  useEffect(() => {
    setSelectedToken("");
    if (!selectedChain) {
      previousChainTypeRef.current = null;
      return;
    }
    const chainLower = selectedChain.toLowerCase();
    const currentChainType: "evm" | "solana" | "sui" =
      chainLower === "solana" ? "solana" : chainLower === "sui" ? "sui" : "evm";
    if (previousChainTypeRef.current !== currentChainType) {
      walletContext.disconnectEvm();
      walletContext.disconnectSolana();
      walletContext.disconnectSui();
      setIsSolanaConnectRequested(false);
    }
    previousChainTypeRef.current = currentChainType;
  }, [selectedChain]);

  useEffect(() => {
    if (!isSolanaConnectRequested || selectedChain?.toLowerCase() !== "solana") return;
    if (solanaWallet.connected) {
      setIsSolanaConnectRequested(false);
      setError(null);
      return;
    }
    if (solanaWallet.wallet && solanaWallet.connect) {
      solanaWallet.connect().then(() => setError(null)).catch((walletError: any) => {
        if (walletError?.name !== "WalletNotSelectedError") {
          setError(walletError.message || "Error connecting to Solana.");
        }
      }).finally(() => setIsSolanaConnectRequested(false));
    } else {
      setIsSolanaConnectRequested(false);
    }
  }, [isSolanaConnectRequested, selectedChain, solanaWallet.wallet, solanaWallet.connected, solanaWallet.connect]);

  const connectedWalletAddress = useMemo(() => {
    if (!selectedChain) return null;
    return walletContext.getCurrentWalletAddress(selectedChain);
  }, [selectedChain, walletContext.evmAddress, walletContext.solanaAddress, walletContext.suiAddress]);

  const handleSolanaWalletConnected = () => {
    setIsSolanaConnectRequested(true);
    setError(null);
  };

  if (!isOpen) return null;

  const handleConnectWallet = async () => {
    setError(null);
    if (!selectedChain) {
      setError("Please select a chain first");
      return;
    }
    const chainLower = selectedChain.toLowerCase();
    const supportedEvmChains = ["ethereum", "arbitrum", "base", "bsc", "polygon", "berachain", "hyperevm"];
    if (chainLower === "solana") {
      setShowSolanaWalletModal(true);
      return;
    }
    if (chainLower === "sui") {
      setShowSuiWalletModal(true);
      return;
    }
    if (!supportedEvmChains.includes(chainLower)) {
      setError(`Connection for ${selectedChain} is not yet available. Coming soon!`);
      return;
    }
    setShowEvmWalletModal(true);
  };

  const handleDisconnectWallet = () => {
    if (!selectedChain) return;
    const chainLower = selectedChain.toLowerCase();
    if (chainLower === "solana") {
      walletContext.disconnectSolana();
      setIsSolanaConnectRequested(false);
    } else if (chainLower === "sui") {
      walletContext.disconnectSui();
    } else {
      walletContext.disconnectEvm();
    }
  };

  const handleSubscribe = async () => {
    try {
      setIsActivating(true);
      setError(null);

      if (!selectedChain || !selectedToken) {
        throw new Error("Please select chain and token");
      }

      const walletAddress = walletContext.getCurrentWalletAddress(selectedChain);
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      const chainLower = selectedChain.toLowerCase();
      const symbolUpper = selectedToken.toUpperCase();

      const { data: paymentData } = await planCreate({
        chain: chainLower,
        symbol: symbolUpper,
      });

      const { destinationAddress, token: tokenAddress, amount } = paymentData;
      const resolvedDestinationAddress = destinationAddress ?? DESTINATION_FALLBACK[
        chainLower === "solana" ? "solana" : chainLower === "sui" ? "sui" : "evm"
      ];

      if (!resolvedDestinationAddress) {
        throw new Error("Destination address not configured. Please contact support.");
      }

      let transactionHash: string;

      if (chainLower === "solana") {
        if (typeof window !== "undefined" && !(window as any).solana) {
          throw new Error("Phantom wallet not found. Please install the Phantom extension.");
        }
        if (!solanaWallet.publicKey || !solanaWallet.signTransaction) {
          throw new Error("Solana wallet is not connected.");
        }
        transactionHash = await sendSolanaTransaction(
          selectedToken,
          resolvedDestinationAddress,
          amount,
          solanaConnection.connection,
          solanaWallet.publicKey,
          solanaWallet.signTransaction,
          tokenAddress
        );
      } else if (chainLower === "sui") {
        if (!walletContext.suiAddress || !signAndExecuteTransactionBlock) {
          throw new Error("SUI wallet is not connected correctly");
        }
        const suiRpcUrl = process.env.NEXT_PUBLIC_RPC_SUI ?? "https://fullnode.mainnet.sui.io:443";
        const suiClient = new SuiClient({ url: suiRpcUrl });
        transactionHash = await sendSuiTransaction(
          selectedToken,
          resolvedDestinationAddress,
          amount,
          async (tx) => signAndExecuteTransactionBlock({ transaction: tx as any }),
          tokenAddress,
          suiClient.getCoins.bind(suiClient),
          walletContext.suiAddress,
          suiClient.getBalance.bind(suiClient)
        );
      } else {
        if (!walletContext.evmAddress) throw new Error("EVM wallet is not connected");
        const expectedChainId = chainNameToId[chainLower];
        if (expectedChainId && walletContext.evmChainId !== expectedChainId) {
          try {
            await walletContext.switchEvmChain(selectedChain);
            await new Promise((r) => setTimeout(r, 1000));
          } catch {
            // ignore
          }
        }
        transactionHash = await sendEVMTransaction(
          selectedChain,
          selectedToken,
          resolvedDestinationAddress,
          amount,
          walletContext.evmAddress,
          tokenAddress
        );
      }

      const confirmResult = await planConfirm({
        taxId: transactionHash,
        chain: chainLower,
        symbol: symbolUpper,
      });

      const msg = (confirmResult.data?.message ?? "").toLowerCase();
      if (msg.includes("invalid transaction")) {
        setError(confirmResult.data?.message ?? "Invalid transaction. Please try again.");
        setIsActivating(false);
      } else {
        setIsActivating(false);
        setShowSuccessModal(true);
      }
    } catch (err: unknown) {
      console.error("Error subscribing to plan:", err);

      const e =
        err && typeof err === "object"
          ? (err as {
              message?: string;
              name?: string;
              code?: number;
              isUserRejection?: boolean;
            })
          : undefined;

      const isUserRejection =
        e?.isUserRejection === true ||
        e?.message === "USER_REJECTED" ||
        (typeof e?.message === "string" && e.message.includes("USER_REJECTED")) ||
        (typeof e?.message === "string" && e.message.includes("rejected")) ||
        (typeof e?.message === "string" && e.message.includes("User rejected")) ||
        e?.name === "UserRejectedRequestError" ||
        e?.code === 4001;

      if (isUserRejection) {
        setIsActivating(false);
        return;
      }

      const errorMessage = e?.message ?? "An error occurred. Please try again.";
      const lower = errorMessage.toLowerCase();
      let friendlyMessage = "Error subscribing to plan";

      if (lower.includes("insufficient balance") || lower.includes("exceeds balance")) {
        friendlyMessage = `Insufficient ${selectedToken?.toUpperCase() ?? "token"} balance. Please ensure your wallet has enough funds.`;
      } else if (lower.includes("insufficient funds") || lower.includes("insufficient")) {
        friendlyMessage = `Insufficient funds. Please add more ${selectedToken?.toUpperCase() ?? "tokens"} to your wallet.`;
      } else if (lower.includes("network") || lower.includes("connection")) {
        friendlyMessage = "Network error. Please check your connection and try again.";
      } else if (lower.includes("chain") || lower.includes("network mismatch")) {
        friendlyMessage = "Incorrect network. Please switch to the correct network in your wallet.";
      } else if (errorMessage.length < 200) {
        friendlyMessage = errorMessage;
      }

      setError(friendlyMessage);
      setIsActivating(false);
    }
  };

  const handleSuccess = () => {
    setShowSuccessModal(false);
    onSuccess();
    onClose();
  };

  const selectedTokenLabel = selectedToken ? selectedToken.toUpperCase() : "";

  if (showSuccessModal) {
    const content = (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
        <div className="relative z-10 bg-[var(--color-card)] rounded-2xl p-8 max-w-lg w-full mx-4 text-white">
          <button aria-label="Close" onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white">
            <FiX size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Core plan activated</h2>
            <p className="text-gray-300 mb-6">
              Your payment has been confirmed. Your Core plan is active for 3 months.
            </p>
            <div className="flex justify-center mb-8">
              <div className="w-48 h-48">
                {paymentAnimation ? (
                  <Lottie animationData={paymentAnimation} loop autoplay />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 animate-pulse">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Button variant="default" className="w-full px-6 py-2 border-[var(--color-primary)] whitespace-nowrap text-base font-bold cursor-pointer" onClick={handleSuccess}>
              CONTINUE
            </Button>
            <div />
          </div>
        </div>
      </div>
    );
    return typeof document !== "undefined" ? createPortal(content, document.body) : null;
  }

  const mainContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 bg-[var(--color-card)] rounded-2xl p-8 max-w-md w-full mx-4 text-white">
        <button aria-label="Close" onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white cursor-pointer">
          <FiX size={20} />
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">Subscribe to Core</h2>
        <p className="text-sm text-gray-400 text-center mb-8">
          Pay ${PLAN_CORE_AMOUNT} to subscribe to the Core plan (valid for 3 months)
        </p>

        {isWalletConnected && connectedWalletAddress && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-400 tracking-wide">Wallet Address</p>
              <p className="text-sm font-semibold text-white mt-1">{truncateAddress(connectedWalletAddress)}</p>
            </div>
            <button onClick={handleDisconnectWallet} className="text-xs font-semibold text-red-400 cursor-pointer">
              Disconnect
            </button>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Select chain to make the payment <span className="text-[var(--color-primary)]">*</span>
            </label>
            <CustomSelect
              options={chains}
              value={selectedChain}
              onChange={(value) => setSelectedChain(value as string)}
              placeholder="Select chain"
            />
            <p className="text-xs text-gray-400 flex items-center gap-2 mt-2">
              <FiInfo /> Can&apos;t find your chain? <span className="text-[var(--color-primary)] cursor-pointer">Contact support</span>
            </p>
          </div>

          {selectedChain && (
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Select token <span className="text-[var(--color-primary)]">*</span>
              </label>
              <CustomSelect
                options={availableTokens}
                value={selectedToken}
                onChange={(value) => setSelectedToken(value as string)}
                placeholder="Select token"
              />
            </div>
          )}

          <div className="space-y-3 text-sm pt-4 border-t border-white/10">
            <div className="flex justify-between items-center font-bold text-base">
              <span>TOTAL</span>
              <span className="flex items-center gap-2">
                <CurrencyIcon />$
                {PLAN_CORE_AMOUNT.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                <span>{selectedTokenLabel}</span>
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <button aria-label="Close" onClick={onClose} className="cursor-pointer px-6 py-2 text-white bg-transparent border border-white/50 rounded-full font-medium whitespace-nowrap" disabled={isConnecting}>
            BACK
          </button>
          {!isWalletConnected ? (
            <Button
              variant="white"
              className="flex-1 px-8 py-2 cursor-pointer"
              onClick={handleConnectWallet}
              disabled={!selectedChain || !selectedToken || isConnecting}
            >
              {isConnecting ? "CONNECTING..." : "CONNECT WALLET"}
            </Button>
          ) : (
            <Button
              variant="white"
              className="flex-1 px-8 py-2 border-[var(--color-primary)] cursor-pointer"
              onClick={handleSubscribe}
              disabled={isActivating || !selectedChain || !selectedToken}
            >
              {isActivating ? "PROCESSING..." : "PAY & SUBSCRIBE"}
            </Button>
          )}
        </div>

        <div />
      </div>

      <EvmWalletModal isOpen={showEvmWalletModal} onClose={() => setShowEvmWalletModal(false)} onConnect={() => setShowEvmWalletModal(false)} />
      <SuiWalletModal isOpen={showSuiWalletModal} onClose={() => setShowSuiWalletModal(false)} onConnect={() => setShowSuiWalletModal(false)} />
      <SolanaWalletModal isOpen={showSolanaWalletModal} onClose={() => setShowSolanaWalletModal(false)} onConnect={handleSolanaWalletConnected} />
    </div>
  );
  return typeof document !== "undefined" ? createPortal(mainContent, document.body) : null;
}
