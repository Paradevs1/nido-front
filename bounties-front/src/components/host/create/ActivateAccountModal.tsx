"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { FiX, FiInfo } from "react-icons/fi";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import {
  activateAccountCreate,
  activateAccountConfirm,
} from "@/lib/api/payments";
import {
  sendEVMTransaction,
  sendSolanaTransaction,
  sendSuiTransaction,
} from "@/lib/wallet/transactions";
import { useWalletContext } from "@/lib/contexts/WalletContext";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
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

interface ActivateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  canClose?: boolean; // Se false, não permite fechar o modal até pagar
}

const ACTIVATE_ACCOUNT_FEE = 200; // 300 (200 for December)

const chains = [
  { value: "base", label: "Base" },
  { value: "sui", label: "Sui" },
];

const DESTINATION_FALLBACK: Record<
  "evm" | "solana" | "sui",
  string | undefined
> = {
  evm:
    process.env.NEXT_PUBLIC_DESTINATION_EVM ??
    "0x8ce17196ED839FC0Fd62F725780BbcA087774eC3",
  solana:
    process.env.NEXT_PUBLIC_DESTINATION_SOLANA ??
    "EXmzSxNEdrzk4sCY9TjrL1G9ygbk6iG3wrAnYaMpJZ4c",
  sui:
    process.env.NEXT_PUBLIC_DESTINATION_SUI ??
    "0x19f1b5022527af499f5a62acbd06ee0d8acbae2fc4a0d19ee6cc6d8884cb414c",
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

export default function ActivateAccountModal({
  isOpen,
  onClose,
  onSuccess,
  canClose = true,
}: ActivateAccountModalProps) {
  const [selectedChain, setSelectedChain] = useState("");
  const [selectedToken, setSelectedToken] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSolanaConnectRequested, setIsSolanaConnectRequested] =
    useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showEvmWalletModal, setShowEvmWalletModal] = useState(false);
  const [showSuiWalletModal, setShowSuiWalletModal] = useState(false);
  const [showSolanaWalletModal, setShowSolanaWalletModal] = useState(false);
  const [paymentAnimation, setPaymentAnimation] = useState<any>(null);

  const walletContext = useWalletContext();
  const solanaConnection = useConnection();
  const solanaWallet = useWallet();
  const { setVisible: setSolanaModalVisible } = useWalletModal();
  const { mutateAsync: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransaction();
  const previousChainTypeRef = useRef<"evm" | "solana" | "sui" | null>(null);

  // Verificar se wallet está conectada baseado na chain selecionada
  const isWalletConnected = useMemo(() => {
    if (!selectedChain) return false;

    const chainLower = selectedChain.toLowerCase();

    if (chainLower === "solana") {
      const connected = walletContext.isWalletConnected(selectedChain);
      return connected;
    }

    if (chainLower === "sui") {
      return walletContext.isWalletConnected(selectedChain);
    }

    // Para EVM chains, verificar se está conectada e tem endereço
    const evmConnected =
      walletContext.isEvmConnected && !!walletContext.evmAddress;

    return evmConnected;
  }, [
    selectedChain,
    walletContext.isEvmConnected,
    walletContext.evmAddress,
    walletContext.isSuiConnected,
    walletContext.suiAddress,
    walletContext.solanaAddress,
    walletContext.isSolanaConnected,
    walletContext,
  ]);

  // Tokens disponíveis baseados na chain selecionada
  const availableTokens = useMemo(() => {
    if (!selectedChain) return [];

    const chainLower = selectedChain.toLowerCase();
    const chainTokens = TOKENS[chainLower as keyof typeof TOKENS];

    if (!chainTokens) return [];

    // Converter para formato do CustomSelect
    return Object.keys(chainTokens).map((token) => ({
      value: token.toLowerCase(),
      label: token,
    }));
  }, [selectedChain]);

  useEffect(() => {
    // Carregar animação de pagamento
    const loadAnimations = async () => {
      try {
        const paymentRes = await fetch("/assets/motion/motion-payment.json");
        if (!paymentRes.ok) {
          console.error("Failed to load payment animation:", paymentRes.status);
          return;
        }
        const paymentData = await paymentRes.json();
        if (paymentData) {
          setPaymentAnimation(paymentData);
          console.log("Payment animation loaded successfully");
        }
      } catch (error) {
        console.error("Error loading animations:", error);
      }
    };
    loadAnimations();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Limpar estado ao abrir o modal
    setError(null);
    setSelectedChain("");
    setSelectedToken("");

    // Desconectar todas as wallets ao abrir o modal para evitar conflitos de cache
    walletContext.disconnectEvm();
    walletContext.disconnectSolana();
    walletContext.disconnectSui();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Resetar token e desconectar TODAS as wallets ao trocar de chain
  useEffect(() => {
    setSelectedToken("");

    if (!selectedChain) {
      previousChainTypeRef.current = null;
      return;
    }

    const chainLower = selectedChain.toLowerCase();
    const currentChainType: "evm" | "solana" | "sui" =
      chainLower === "solana" ? "solana" : chainLower === "sui" ? "sui" : "evm";

    // Se trocou de chain (ou está selecionando pela primeira vez), desconectar TODAS
    if (previousChainTypeRef.current !== currentChainType) {
      // Desconectar todas as wallets para evitar conflito de cache
      walletContext.disconnectEvm();
      walletContext.disconnectSolana();
      walletContext.disconnectSui();
      setIsSolanaConnectRequested(false);
    }

    previousChainTypeRef.current = currentChainType;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChain]);

  // Auto-connect Solana wallet após usar o modal customizado
  useEffect(() => {
    if (!isSolanaConnectRequested) return;
    if (selectedChain?.toLowerCase() !== "solana") return;

    const connectSolanaWallet = async () => {
      // Se já está conectado, apenas resetar flag
      if (solanaWallet.connected) {
        setIsSolanaConnectRequested(false);
        setError(null);
        return;
      }

      // Se tem wallet selecionada, tentar conectar
      if (solanaWallet.wallet && solanaWallet.connect) {
        try {
          await solanaWallet.connect();
          setError(null);
        } catch (walletError: unknown) {
          console.error("Error connecting Solana wallet:", walletError);
          if (walletError?.name !== "WalletNotSelectedError") {
            setError(
              walletError.message ||
                "Error connecting to Solana. Make sure Phantom is installed and try again."
            );
          }
        } finally {
          setIsSolanaConnectRequested(false);
        }
      } else {
        // Se não tem wallet, resetar flag
        setIsSolanaConnectRequested(false);
      }
    };

    connectSolanaWallet();
  }, [
    isSolanaConnectRequested,
    selectedChain,
    solanaWallet.wallet,
    solanaWallet.connected,
    solanaWallet.connect,
  ]);

  const selectedTokenLabel = selectedToken ? selectedToken.toUpperCase() : "";

  const connectedWalletAddress = useMemo(() => {
    if (!selectedChain) return null;
    return walletContext.getCurrentWalletAddress(selectedChain);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedChain,
    walletContext.evmAddress,
    walletContext.solanaAddress,
    walletContext.suiAddress,
  ]);

  // Early return DEPOIS de todos os hooks
  if (!isOpen) return null;

  const handleConnectWallet = async () => {
    try {
      setError(null);

      if (!selectedChain) {
        setError("Please select a chain first");
        return;
      }

      const chainLower = selectedChain.toLowerCase();
      const supportedEvmChains = [
        "ethereum",
        "arbitrum",
        "base",
        "bsc",
        "polygon",
        "berachain",
        "hyperevm",
      ];

      if (chainLower === "solana") {
        setShowSolanaWalletModal(true);
        return;
      } else if (chainLower === "sui") {
        setShowSuiWalletModal(true);
        return;
      } else if (!supportedEvmChains.includes(chainLower)) {
        setError(
          `Connection for ${selectedChain} is not yet available. Coming soon!`
        );
        return;
      } else {
        setShowEvmWalletModal(true);
        return;
      }
    } catch (err: unknown) {
      console.error("Error connecting wallet:", err);

      const isUserRejection =
        (err as any)?.isUserRejection === true ||
        err?.message === "USER_REJECTED" ||
        err?.message?.includes("USER_REJECTED") ||
        err?.message?.includes("rejected") ||
        err?.message?.includes("User rejected") ||
        err?.message?.includes("Connection rejected by user") ||
        err?.name === "UserRejectedRequestError" ||
        err?.code === 4001;

      if (isUserRejection) {
        setIsConnecting(false);
        return;
      }

      setError(err.message || "Error connecting wallet");
      setIsConnecting(false);
    }
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

  const handleEvmWalletConnected = async () => {
    if (!selectedChain) return;

    const chainLower = selectedChain.toLowerCase();
    const expectedChainId = chainNameToId[chainLower];

    if (expectedChainId && walletContext.evmChainId !== expectedChainId) {
      setIsConnecting(true);
      try {
        await walletContext.switchEvmChain(selectedChain);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (switchError: unknown) {
        console.warn("Chain switch failed:", switchError);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const handleSuiWalletConnected = () => {
    setError(null);
  };

  const handleSolanaWalletConnected = () => {
    // Wallet Solana selecionada - ativar flag para conectar
    setIsSolanaConnectRequested(true);
    setError(null);
  };

  const handleActivateAccount = async () => {
    try {
      setIsActivating(true);
      setError(null);

      if (!selectedChain || !selectedToken) {
        throw new Error("Please select chain and token");
      }

      const walletAddress =
        walletContext.getCurrentWalletAddress(selectedChain);
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      // 1. Criar entrada de pagamento no backend
      const paymentData = await activateAccountCreate({
        walletAddress,
        chain: selectedChain.toLowerCase(),
        symbol: selectedToken.toUpperCase(),
      });

      const {
        destinationAddress,
        amount,
        paymentId,
        tokenContractAddress,
        token,
      } = paymentData.data;
      const resolvedTokenContractAddress = tokenContractAddress ?? token;

      const chainLower = selectedChain.toLowerCase();
      const chainGroup: "evm" | "solana" | "sui" =
        chainLower === "solana"
          ? "solana"
          : chainLower === "sui"
          ? "sui"
          : "evm";
      const resolvedDestinationAddress =
        destinationAddress ?? DESTINATION_FALLBACK[chainGroup];

      if (!resolvedDestinationAddress) {
        throw new Error(
          "Destination address not configured. Please contact support."
        );
      }

      // 2. Enviar transação na blockchain
      let transactionHash: string;

      if (chainLower === "solana") {
        if (typeof window !== "undefined" && !(window as any).solana) {
          throw new Error(
            "Phantom wallet não encontrada. Por favor, instale a extensão Phantom e recarregue a página."
          );
        }

        if (!solanaWallet.publicKey) {
          throw new Error(
            "Solana wallet não está conectada. Por favor, conecte sua Phantom wallet."
          );
        }

        if (!solanaWallet.signTransaction) {
          throw new Error(
            "Função de assinatura não disponível. Por favor, reconecte sua Phantom wallet."
          );
        }
        transactionHash = await sendSolanaTransaction(
          selectedToken,
          resolvedDestinationAddress,
          amount,
          solanaConnection.connection,
          solanaWallet.publicKey,
          solanaWallet.signTransaction,
          resolvedTokenContractAddress
        );
      } else if (chainLower === "sui") {
        if (!walletContext.suiAddress || !signAndExecuteTransactionBlock) {
          throw new Error("SUI wallet is not connected correctly");
        }

        const suiRpcUrl =
          process.env.NEXT_PUBLIC_RPC_SUI ||
          "https://fullnode.mainnet.sui.io:443";
        const suiClient = new SuiClient({ url: suiRpcUrl });

        transactionHash = await sendSuiTransaction(
          selectedToken,
          resolvedDestinationAddress,
          amount,
          async (tx) => {
            return await signAndExecuteTransactionBlock({
              transaction: tx as any,
            });
          },
          resolvedTokenContractAddress,
          suiClient.getCoins.bind(suiClient),
          walletContext.suiAddress,
          suiClient.getBalance.bind(suiClient)
        );
      } else {
        if (!walletContext.evmAddress) {
          throw new Error("EVM wallet is not connected");
        }

        const expectedChainId = chainNameToId[chainLower];
        if (expectedChainId && walletContext.evmChainId !== expectedChainId) {
          try {
            await walletContext.switchEvmChain(selectedChain);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (switchError: unknown) {
            console.warn(
              "Error switching chain before transaction:",
              switchError
            );
          }
        }

        transactionHash = await sendEVMTransaction(
          selectedChain,
          selectedToken,
          resolvedDestinationAddress,
          amount,
          walletContext.evmAddress,
          resolvedTokenContractAddress
        );
      }

      // 3. Confirmar pagamento no backend
      const activationConfirmation = await activateAccountConfirm({
        paymentId,
        taxId: transactionHash,
        chain: selectedChain.toLowerCase(),
        symbol: selectedToken.toUpperCase(),
      });

      const confirmErrorMessage = activationConfirmation.data.message || "";
      const confirmErrorString = confirmErrorMessage.toLowerCase();

      if (confirmErrorString.includes("invalid transaction")) {
        setError(
          confirmErrorMessage || "Invalid transaction. Please try again."
        );
        setIsActivating(false);
        setShowSuccessModal(false);
      } else {
        setIsActivating(false);
        setShowSuccessModal(true);
      }
    } catch (err: unknown) {
      console.error("Error activating account:", err);

      const isUserRejection =
        (err as any)?.isUserRejection === true ||
        err?.message === "USER_REJECTED" ||
        err?.message?.includes("USER_REJECTED") ||
        err?.message?.includes("rejected") ||
        err?.message?.includes("User rejected") ||
        err?.message?.includes("Transaction rejected by user") ||
        err?.name === "UserRejectedRequestError" ||
        err?.code === 4001;

      if (isUserRejection) {
        setIsActivating(false);
        // NÃO fechar o modal - usuário precisa pagar para ativar a conta
        // Se canClose=false (guard bloqueando), usuário deve tentar novamente
        if (canClose) {
          onClose(); // Só fechar se for permitido (CreateCompanyForm)
        }
        return;
      }

      const errorMessage = err?.message || "";
      const errorString = errorMessage.toLowerCase();

      let friendlyMessage = "Error activating account";

      if (
        errorString.includes("insufficient balance") ||
        errorString.includes("transfer amount exceeds balance") ||
        errorString.includes("exceeds balance") ||
        errorMessage?.includes("ERC20: transfer amount exceeds balance")
      ) {
        friendlyMessage = `Insufficient ${
          selectedToken?.toUpperCase() || "token"
        } balance. Please ensure your wallet has enough funds to complete this transaction.`;
      } else if (
        errorString.includes("insufficient funds") ||
        errorString.includes("insufficient")
      ) {
        friendlyMessage = `Insufficient funds. Please add more ${
          selectedToken?.toUpperCase() || "tokens"
        } to your wallet.`;
      } else if (
        errorString.includes("network") ||
        errorString.includes("connection")
      ) {
        friendlyMessage =
          "Network error. Please check your internet connection and try again.";
      } else if (
        errorString.includes("chain") ||
        errorString.includes("network mismatch")
      ) {
        friendlyMessage =
          "Incorrect network. Please switch to the correct network in your wallet.";
      } else if (
        errorString.includes("user rejected") ||
        errorString.includes("rejected by user")
      ) {
        // Se chegou aqui e não foi capturado acima, apenas não mostrar erro
        setIsActivating(false);
        return;
      } else {
        // Para outros erros, tentar extrair uma mensagem útil ou usar a padrão
        friendlyMessage =
          errorMessage || "An error occurred. Please try again.";

        // Se a mensagem for muito técnica, substituir por uma genérica
        if (
          errorMessage.includes("Raw Call Arguments") ||
          errorMessage.includes("execution reverted") ||
          errorMessage.includes("data:") ||
          errorMessage.includes("gas:") ||
          errorMessage.length > 200
        ) {
          friendlyMessage =
            "Transaction failed. Please verify your wallet balance and try again.";
        }
      }

      setError(friendlyMessage);
      setIsActivating(false);
      setShowSuccessModal(false);
    }
  };

  const handleSuccess = () => {
    setShowSuccessModal(false);
    onSuccess();
    onClose();
  };

  // Modal de Sucesso
  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={canClose ? onClose : undefined}
        />

        <div className="relative z-10 bg-[var(--color-card)] rounded-2xl p-8 max-w-lg w-full mx-4 text-white">
          {canClose && (
            <button
              aria-label="Close"
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-white"
            >
              <FiX size={20} />
            </button>
          )}

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Account Activated!</h2>
            <p className="text-gray-300 mb-6">
              Your payment has been confirmed and your account is now active.
            </p>

            <div className="flex justify-center mb-8">
              <div className="w-48 h-48">
                {paymentAnimation ? (
                  <Lottie
                    animationData={paymentAnimation}
                    loop={true}
                    autoplay={true}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 animate-pulse">
                      <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="default"
              className="w-full px-6 py-2 border-[var(--color-primary)] whitespace-nowrap text-base font-bold cursor-pointer"
              onClick={handleSuccess}
            >
              CONTINUE
            </Button>

            <div />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={canClose ? onClose : undefined}
      />

      <div className="relative z-10 bg-[var(--color-card)] rounded-2xl p-8 max-w-md w-full mx-4 text-white">
        {canClose && (
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white cursor-pointer"
          >
            <FiX size={20} />
          </button>
        )}

        <h2 className="text-2xl font-bold text-center mb-4">
          Activate Your Account
        </h2>
        <p className="text-sm text-gray-400 text-center mb-8">
          Pay ${ACTIVATE_ACCOUNT_FEE} to activate your host account and start
          creating campaigns
        </p>

        {isWalletConnected && connectedWalletAddress && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-400 tracking-wide">
                Wallet Address
              </p>
              <p className="text-sm font-semibold text-white mt-1">
                {truncateAddress(connectedWalletAddress)}
              </p>
            </div>
            <button
              onClick={handleDisconnectWallet}
              className="text-xs font-semibold text-red-400 cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Chain Selector */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Select chain to make the payment{" "}
              <span className="text-[var(--color-primary)]">*</span>
            </label>
            <CustomSelect
              options={chains}
              value={selectedChain}
              onChange={(value) => setSelectedChain(value as string)}
              placeholder="Select chain"
            />
            <p className="text-xs text-gray-400 flex items-center gap-2 mt-2">
              <FiInfo /> Can't find your chain?{" "}
              <span className="text-[var(--color-primary)] cursor-pointer">
                Contact support
              </span>
            </p>
          </div>

          {/* Token Selector */}
          {selectedChain && (
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Select token{" "}
                <span className="text-[var(--color-primary)]">*</span>
              </label>
              <CustomSelect
                options={availableTokens}
                value={selectedToken}
                onChange={(value) => setSelectedToken(value as string)}
                placeholder="Select token"
              />
            </div>
          )}

          {/* Payment Summary */}
          <div className="space-y-3 text-sm pt-4 border-t border-white/10">
            <div className="flex justify-between items-center font-bold text-base">
              <span>TOTAL</span>
              <span className="flex items-center gap-2">
                <CurrencyIcon />$
                {ACTIVATE_ACCOUNT_FEE.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                <span>{selectedTokenLabel}</span>
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-8">
          {!isWalletConnected ? (
            <>
              {canClose && (
                <button
                  aria-label="Close"
                  onClick={onClose}
                  className="cursor-pointer px-6 py-2 text-white bg-transparent border border-white/50 rounded-full font-medium whitespace-nowrap"
                  disabled={isConnecting}
                >
                  BACK
                </button>
              )}
              <Button
                variant="white"
                className="flex-1 px-8 py-2 cursor-pointer"
                onClick={handleConnectWallet}
                disabled={!selectedChain || !selectedToken || isConnecting}
              >
                {isConnecting ? "CONNECTING..." : "CONNECT WALLET"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="white"
                className="w-full px-8 py-2 border-[var(--color-primary)] cursor-pointer"
                onClick={handleActivateAccount}
                disabled={isActivating || !selectedChain || !selectedToken}
              >
                {isActivating ? "ACTIVATING..." : "PAY & ACTIVATE"}
              </Button>
            </>
          )}
        </div>

        <div />
      </div>

      {/* Modal de seleção de wallet EVM */}
      <EvmWalletModal
        isOpen={showEvmWalletModal}
        onClose={() => setShowEvmWalletModal(false)}
        onConnect={handleEvmWalletConnected}
      />

      {/* Modal de seleção de wallet SUI */}
      <SuiWalletModal
        isOpen={showSuiWalletModal}
        onClose={() => setShowSuiWalletModal(false)}
        onConnect={handleSuiWalletConnected}
      />

      {/* Modal de seleção de wallet Solana */}
      <SolanaWalletModal
        isOpen={showSolanaWalletModal}
        onClose={() => setShowSolanaWalletModal(false)}
        onConnect={handleSolanaWalletConnected}
      />
    </div>
  );
}
