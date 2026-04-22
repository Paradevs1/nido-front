"use client";

import { useState, useEffect, useMemo } from "react";
import { FiX, FiInfo, FiChevronDown } from "react-icons/fi";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import { CampaignDetails, isParabuilders } from "@/lib/api/host";
import { paymentHostCreate, paymentHostConfirm, getStellarBalance } from "@/lib/api/payments";
import { getMyPlan } from "@/lib/api/plan";
import type { GetMyPlanResponse } from "@/lib/api/plan";
import {
  sendEVMTransaction,
  sendSolanaTransaction,
  sendSuiTransaction,
  sendStellarTransaction,
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
const StellarWalletModal = dynamic(() => import("@/components/wallet/StellarWalletModal"), { ssr: false });

if (typeof window !== "undefined") {
  // @ts-ignore - CSS import handled at runtime
  import("@solana/wallet-adapter-react-ui/styles.css");
}

interface ActivateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate?: () => void;
  campaign?: CampaignDetails;
}

const chains = [
  { value: "ethereum", label: "Ethereum" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "solana", label: "Solana" },
  { value: "base", label: "Base" },
  { value: "berachain", label: "Berachain" },
  { value: "bsc", label: "BSC" },
  { value: "hyperevm", label: "Hyperevm" },
  { value: "polygon", label: "Polygon" },
  { value: "sui", label: "Sui" },
  { value: "stellar", label: "Stellar" },
];

const DESTINATION_FALLBACK: Record<
  "evm" | "solana" | "sui" | "stellar",
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
  stellar:
    process.env.NEXT_PUBLIC_DESTINATION_STELLAR ??
    "GAEC5IKE6SEZOOU73ZB6SMQ6GTI6WJQNOQIE6X5EBFW3JCDASL4RQNYC",
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

export default function ActivateCampaignModal({
  isOpen,
  onClose,
  onActivate,
  campaign,
}: ActivateCampaignModalProps) {
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
  const [showStellarWalletModal, setShowStellarWalletModal] = useState(false);
  const [checkAnimation, setCheckAnimation] = useState<any>(null);
  const [paymentAnimation, setPaymentAnimation] = useState<any>(null);
  const [isParabuildersHost, setIsParabuildersHost] = useState<boolean | null>(null);
  const [isCheckingParabuilders, setIsCheckingParabuilders] = useState(false);
  const [planInfo, setPlanInfo] = useState<GetMyPlanResponse | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const walletContext = useWalletContext();
  const solanaConnection = useConnection();
  const solanaWallet = useWallet();
  const { setVisible: setSolanaModalVisible } = useWalletModal();
  const { mutateAsync: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransaction();

  // Verificar se wallet está conectada baseado na chain selecionada
  // Para EVM chains, verificar se está conectada (chain ID pode ser ajustado depois)
  const isWalletConnected = useMemo(() => {
    if (!selectedChain) return false;

    const chainLower = selectedChain.toLowerCase();

    if (chainLower === "solana") {
      // Usar o estado direto do hook do adapter para Solana, pois é mais reativo
      return solanaWallet.connected;
    }

    if (chainLower === "sui") {
      return walletContext.isWalletConnected(selectedChain);
    }

    if (chainLower === "stellar") {
      return walletContext.isStellarConnected;
    }

    // Para EVM chains, verificar se está conectada e tem endereço
    // Não exigir que esteja na chain correta, pois pode fazer switch depois
    if (!walletContext.isEvmConnected || !walletContext.evmAddress) {
      return false;
    }

    // Verificar se o usuário está conectado explicitamente
    if (!walletContext.evmAddress) return false;

    // Se está conectada e tem endereço, considerar conectada
    // O switch de chain pode ser feito durante a transação se necessário
    return true;
  }, [
    selectedChain,
    walletContext.isEvmConnected,
    walletContext.evmAddress,
    walletContext.isSuiConnected,
    walletContext.suiAddress,
    walletContext.solanaAddress,
    walletContext.isSolanaConnected,
    walletContext.isStellarConnected,
    walletContext.stellarAddress,
    walletContext,
    solanaWallet.connected, // Adicionar dependência direta do estado da Solana
    solanaWallet.connected,
  ]);

  // Tokens disponíveis baseados na chain selecionada
  const availableTokens = useMemo(() => {
    // Se a campanha já definiu o token, limitar a ele
    if (campaign?.payment_token) {
      const tokenLower = campaign.payment_token.toLowerCase();
      const tokenLabel = campaign.payment_token.toUpperCase();
      return [
        {
          value: tokenLower,
          label: tokenLabel,
        },
      ];
    }

    if (!selectedChain) return [];

    const chainLower = selectedChain.toLowerCase();
    const chainTokens = TOKENS[chainLower as keyof typeof TOKENS];

    if (!chainTokens) return [];

    // Converter para formato do CustomSelect
    return Object.keys(chainTokens).map((token) => ({
      value: token.toLowerCase(),
      label: token,
    }));
  }, [selectedChain, campaign?.payment_token]);

  useEffect(() => {
    // Carregar animações
    const loadAnimations = async () => {
      try {
        const [checkRes, paymentRes] = await Promise.all([
          fetch("/assets/motion/check-motion.json"),
          fetch("/assets/motion/motion-payment.json"),
        ]);

        const checkData = await checkRes.json();
        const paymentData = await paymentRes.json();

        if (checkData && paymentData) {
          setCheckAnimation(checkData);
          setPaymentAnimation(paymentData);
          console.log("Animations loaded successfully");
        }
      } catch (error) {
        console.error("Error loading animations:", error);
      }
    };
    loadAnimations();
  }, []);

  useEffect(() => {
    if (!isOpen || !campaign) return;

    setError(null);

    const defaultChain = campaign?.payment_chain?.toLowerCase() ?? "";
    const defaultToken = campaign?.payment_token?.toLowerCase() ?? "";

    setSelectedChain(defaultChain);
    setSelectedToken(defaultToken);

    setLoadingPlan(true);
    getMyPlan()
      .then(setPlanInfo)
      .catch(() => setPlanInfo(null))
      .finally(() => setLoadingPlan(false));

    // Verificar se é Parabuilders quando o modal abrir
    const checkParabuilders = async () => {
      try {
        setIsCheckingParabuilders(true);
        const response = await isParabuilders();
        setIsParabuildersHost(response.isParabuilders);
      } catch (error) {
        console.error("Error checking Nido status:", error);
        setIsParabuildersHost(false);
      } finally {
        setIsCheckingParabuilders(false);
      }
    };

    checkParabuilders();
  }, [isOpen, campaign?.payment_chain, campaign?.payment_token]);

  // Resetar token somente quando a campanha não definiu previamente
  useEffect(() => {
    if (campaign?.payment_chain) return;
    setSelectedToken("");
  }, [selectedChain, campaign?.payment_chain]);

  useEffect(() => {
    if (!isSolanaConnectRequested) return;
    if (!selectedChain) {
      setIsSolanaConnectRequested(false);
      return;
    }
    if (selectedChain.toLowerCase() !== "solana") {
      setIsSolanaConnectRequested(false);
      return;
    }

    if (solanaWallet.connected) {
      setIsSolanaConnectRequested(false);
      setError(null);
      return;
    }

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
          // Ignorar erro de wallet não selecionada (comum ao trocar ou cancelar)
          if (walletError instanceof Error && walletError.name === "WalletNotSelectedError") {
            return;
          }

          console.error("Error connecting Solana wallet:", walletError);
          setError(
            walletError instanceof Error
              ? walletError.message
              : "Error connecting to Solana. Make sure Phantom is installed and try again."
          );
        } finally {
          setIsSolanaConnectRequested(false);
        }
      } else {
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

  // Base amount: CAC = list_kols.length * limit_amount_convertion, else total_prize_pool (igual ao backend)
  const baseAmount = campaign
    ? campaign.is_cac && campaign.list_kols?.length && campaign.limit_amount_convertion
      ? campaign.list_kols.length * campaign.limit_amount_convertion
      : (campaign.total_prize_pool || 0)
    : 0;
  // Taxa da plataforma (Nido): Enterprise = 0%, Core ativo = 6% até $2k, 5% até $5k, 3% acima; Basic = 12%
  const isEnterprise = planInfo?.plan?.name === "ENTERPRISE" && planInfo?.is_active;
  const isCore = planInfo?.plan?.name === "CORE" && planInfo?.is_active;
  const feePercent = isEnterprise
    ? 0
    : isCore
      ? baseAmount <= 2000
        ? 0.06
        : baseAmount <= 5000
          ? 0.05
          : 0.03
      : 0.12;
  const FEE_AMOUNT = baseAmount * feePercent;
  const expectedAmount = baseAmount + FEE_AMOUNT;

  const selectedTokenLabel =
    (selectedToken
      ? selectedToken.toUpperCase()
      : campaign?.payment_token?.toUpperCase()) ?? "";

  const lowerSelectedChain = selectedChain?.toLowerCase();
  const connectedWalletAddress = useMemo(() => {
    if (!selectedChain) return null;
    return walletContext.getCurrentWalletAddress(selectedChain);
  }, [
    selectedChain,
    walletContext.evmAddress,
    walletContext.solanaAddress,
    walletContext.suiAddress,
  ]);

  // Early return DEPOIS de todos os hooks
  if (!isOpen || !campaign) return null;

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
        // Para Solana - mostrar modal customizado de seleção de wallet
        setShowSolanaWalletModal(true);
        return;
      } else if (chainLower === "sui") {
        // Para SUI - mostrar modal de seleção de wallet
        setShowSuiWalletModal(true);
        return;
      } else if (chainLower === "stellar") {
        // Para Stellar — mostrar modal de seleção de wallet
        setShowStellarWalletModal(true);
        return;
      } else if (!supportedEvmChains.includes(chainLower)) {
        setError(
          `Connection for ${selectedChain} is not yet available. Coming soon!`
        );
        return;
      } else {
        // Para EVM chains suportadas - mostrar modal de seleção de wallet
        setShowEvmWalletModal(true);
        return;
      }
    } catch (err: unknown) {
      console.error("Error connecting wallet:", err);
      const errObj = err instanceof Error ? err : null;
      const errAny = err as Record<string, unknown>;

      const isUserRejection =
        errAny?.isUserRejection === true ||
        errObj?.message === "USER_REJECTED" ||
        errObj?.message?.includes("USER_REJECTED") ||
        errObj?.message?.includes("rejected") ||
        errObj?.message?.includes("User rejected") ||
        errObj?.message?.includes("Connection rejected by user") ||
        errObj?.name === "UserRejectedRequestError" ||
        errAny?.code === 4001;

      if (isUserRejection) {
        setIsConnecting(false);
        return;
      }

      setError(errObj?.message || "Error connecting wallet");
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    if (!selectedChain) return;
    const chainLower = selectedChain.toLowerCase();

    if (chainLower === "solana") {
      walletContext.disconnectSolana();
      setIsSolanaConnectRequested(false);
    } else if (chainLower === "stellar") {
      walletContext.disconnectStellar();
    } else {
      walletContext.disconnectEvm();
    }
  };

  const handleEvmWalletConnected = async () => {
    // Após conectar a wallet EVM, fazer switch para a chain correta se necessário
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
    // Wallet SUI conectada com sucesso
    setError(null);
  };

  const handleSolanaWalletConnected = () => {
    // Wallet Solana selecionada - ativar flag para conectar
    // Adicionar pequeno delay para garantir propagação do estado
    setTimeout(() => {
      setIsSolanaConnectRequested(true);
      setError(null);
    }, 200);
  };

  const handleStellarWalletConnected = (_address: string) => {
    // StellarWalletModal already ran setAllowed + getAddress.
    // Call connectStellar() so WalletContext syncs its own state
    // (isAllowed is already cached by Freighter, so it resolves instantly).
    walletContext.connectStellar().catch((err: unknown) => {
      const e = err as { isUserRejection?: boolean };
      if (!e.isUserRejection) {
        console.error("Stellar context sync error:", err);
      }
    });
    setError(null);
  };

  const handleActivateCampaign = async () => {
    try {
      setIsActivating(true);
      setError(null);

      if (!selectedChain || !selectedToken) {
        throw new Error("Please select chain and token");
      }

      const walletAddress =
        walletContext.getCurrentWalletAddress(selectedChain);
      if (!walletAddress) {
        throw new Error(
          "Wallet not connected. Please connect your wallet first."
        );
      }

      // 1. Criar entrada de pagamento no backend
      const paymentData = await paymentHostCreate({
        walletAddress,
        campaignId: campaign.id,
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
      const chainGroup: "evm" | "solana" | "sui" | "stellar" =
        chainLower === "solana"
          ? "solana"
          : chainLower === "sui"
            ? "sui"
            : chainLower === "stellar"
              ? "stellar"
              : "evm";
      // Backend pode retornar string vazia; tratar como "não configurado" e usar fallback.
      const destinationFromBackend =
        typeof destinationAddress === "string" && destinationAddress.trim()
          ? destinationAddress.trim()
          : undefined;
      const resolvedDestinationAddress =
        destinationFromBackend ?? DESTINATION_FALLBACK[chainGroup];

      if (!resolvedDestinationAddress) {
        throw new Error(
          "Destination address not configured. Please contact support."
        );
      }

      // 2. Enviar transação na blockchain
      let transactionHash: string;

      if (chainLower === "solana") {
        if (!solanaWallet.publicKey || !solanaWallet.signTransaction) {
          throw new Error("Solana wallet is not connected correctly");
        }

        // Para Solana, tokenContractAddress seria o mint address se fornecido
        transactionHash = await sendSolanaTransaction(
          selectedToken,
          resolvedDestinationAddress,
          amount,
          solanaConnection.connection,
          solanaWallet.publicKey,
          solanaWallet.signTransaction,
          resolvedTokenContractAddress // Passar mint address se fornecido pelo backend
        );
      } else if (chainLower === "sui") {
        // SUI transaction
        if (!walletContext.suiAddress || !signAndExecuteTransactionBlock) {
          throw new Error("SUI wallet is not connected correctly");
        }

        // Criar client SUI para obter moedas
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
          resolvedTokenContractAddress, // Passar token contract address se fornecido pelo backend
          suiClient.getCoins.bind(suiClient), // Função para obter moedas
          walletContext.suiAddress, // Endereço do remetente
          suiClient.getBalance.bind(suiClient) // Função para obter saldo de SUI nativo
        );
      } else if (chainLower === "stellar") {
        if (!walletContext.stellarAddress) {
          throw new Error("Stellar wallet is not connected");
        }

        transactionHash = await sendStellarTransaction(
          selectedToken,
          resolvedDestinationAddress,
          amount,
          walletContext.stellarAddress
        );
      } else {
        // EVM transaction (Ethereum, Arbitrum, Base, BSC, Polygon, Berachain, Hyperevm)
        if (!walletContext.evmAddress) {
          throw new Error("EVM wallet is not connected");
        }

        // Verificar se a wallet está na chain correta e fazer switch se necessário
        const expectedChainId = chainNameToId[chainLower];
        if (expectedChainId && walletContext.evmChainId !== expectedChainId) {
          try {
            await walletContext.switchEvmChain(selectedChain);
            // Aguardar um pouco para a wallet processar a mudança
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (switchError: unknown) {
            // Se o switch falhar, a função sendEVMTransaction ainda tentará fazer o switch
            console.warn(
              "Error switching chain before transaction:",
              switchError
            );
          }
        }

        // Usar tokenContractAddress do backend se disponível, senão usar fallback hardcoded
        transactionHash = await sendEVMTransaction(
          selectedChain,
          selectedToken,
          resolvedDestinationAddress,
          amount,
          walletContext.evmAddress,
          resolvedTokenContractAddress // Endereço do contrato fornecido pelo backend
        );
      }

      // 3. Confirmar pagamento no backend
      const campaignConfirmation = await paymentHostConfirm({
        paymentId,
        taxId: transactionHash,
        campaignId: campaign.id,
        chain: selectedChain.toLowerCase(),
        symbol: selectedToken.toUpperCase(),
      });

      const confirmErrorMessage = campaignConfirmation.data.message || "";
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
        if (onActivate) onActivate();
      }
    } catch (err: unknown) {
      console.error("Error activating campaign:", err);
      const errObj = err instanceof Error ? err : null;
      const errAny = err as Record<string, unknown>;

      const isUserRejection =
        errAny?.isUserRejection === true ||
        errObj?.message === "USER_REJECTED" ||
        errObj?.message?.includes("USER_REJECTED") ||
        errObj?.message?.includes("rejected") ||
        errObj?.message?.includes("User rejected") ||
        errObj?.message?.includes("Transaction rejected by user") ||
        errObj?.name === "UserRejectedRequestError" ||
        errAny?.code === 4001;

      if (isUserRejection) {
        setIsActivating(false);
        onClose();
        return;
      }

      const errorMessage = errObj?.message || "";
      const errorString = errorMessage.toLowerCase();

      let friendlyMessage = "Error activating campaign";

      if (
        errorString.includes("insufficient balance") ||
        errorString.includes("transfer amount exceeds balance") ||
        errorString.includes("exceeds balance") ||
        errorMessage?.includes("ERC20: transfer amount exceeds balance")
      ) {
        friendlyMessage = `Insufficient ${selectedTokenLabel || "token"
          } balance. Please ensure your wallet has enough funds to complete this transaction.`;
      } else if (
        errorString.includes("insufficient funds") ||
        errorString.includes("insufficient")
      ) {
        friendlyMessage = `Insufficient funds. Please add more ${selectedTokenLabel || "tokens"
          } to your wallet.`;
      } else if (
        errorString.includes("network") ||
        errorString.includes("connection")
      ) {
        friendlyMessage =
          "Network error. Please check your internet connection and try again.";
      } else if (
        errorString.includes("wallet not connected") ||
        errorString.includes("wallet disconnected")
      ) {
        friendlyMessage =
          "Wallet not connected. Please connect your wallet to continue.";
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
        // Se chegou aqui e não foi capturado acima, apenas fechar sem mostrar erro
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

      // Para outros erros, mostrar mensagem de erro amigável
      setError(friendlyMessage);
      setIsActivating(false);
    }
  };

  const handleBackToProfile = () => {
    setShowSuccessModal(false);
    onClose();
    // Redirecionar para o perfil
    if (typeof window !== "undefined") {
      window.location.href = "/host/profile";
    }
  };

  const handleGoToDashboard = () => {
    setShowSuccessModal(false);
    onClose();
    // Recarregar a página para atualizar o status da campanha
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  // Modal de Sucesso
  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        <div className="relative z-10 bg-[var(--color-card)] rounded-2xl p-8 max-w-lg w-full mx-4 text-white">
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white"
          >
            <FiX size={20} />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Finished Payment</h2>
            <p className="text-gray-300 mb-6">
              Payments have been automatically made to Creators.
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

            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleBackToProfile}
                className="cursor-pointer flex-1 px-6 py-2 text-white bg-transparent border border-white/50 rounded-full font-medium whitespace-nowrap"
              >
                BACK TO PROFILE
              </button>
              <Button
                variant="default"
                className="flex-1 px-6 py-2 border-[var(--color-primary)] whitespace-nowrap text-base font-bold cursor-pointer"
                onClick={handleGoToDashboard}
              >
                GO TO DASHBOARD
              </Button>
            </div>

            <div />
          </div>
        </div>
      </div>
    );
  }

  // Se for Parabuilders com campanha CAC, mostrar mensagem de que já está ativa
  const isParabuildersWithCac = isParabuildersHost === true && campaign?.is_cac === true;

  // Se estiver verificando Parabuilders, mostrar loading
  if (isCheckingParabuilders) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />
        <div className="relative z-10 bg-[var(--color-card)] rounded-2xl p-8 max-w-md w-full mx-4 text-white text-center">
          <p className="text-lg">Verifying account status...</p>
        </div>
      </div>
    );
  }

  // Se for Parabuilders com CAC, mostrar mensagem de que campanha já está ativa
  if (isParabuildersWithCac) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
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

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Campaign Already Active</h2>
            <p className="text-gray-300 mb-6">
              As a Nido host with a CAC campaign, your campaign has been automatically activated. No payment is required.
            </p>

            <div className="flex justify-center mb-8">
              <div className="w-32 h-32">
                {checkAnimation ? (
                  <Lottie
                    animationData={checkAnimation}
                    loop={false}
                    autoplay={true}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                      <svg
                        className="w-10 h-10 text-white"
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
              variant="white"
              className="w-full px-8 py-2 cursor-pointer"
              onClick={onClose}
            >
              CLOSE
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
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

        <h2 className="text-2xl font-bold text-center mb-8">
          Campaign Activation
        </h2>

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
            <p className="text-xs text-gray-400 mb-2">Payment</p>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Selected chain to make the payment{" "}
              <span className="text-[var(--color-primary)]">*</span>
            </label>
            <div className="w-full bg-transparent text-white px-4 py-3 rounded-full border border-white/50 flex items-center justify-between">
              <span className="uppercase">{selectedChain || "-"}</span>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-2 mt-2">
              <FiInfo /> Can't find your chain?{" "}
              <span className="text-[var(--color-primary)] cursor-pointer">
                Contact support
              </span>
            </p>
          </div>

          {/* Token Selector */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Selected token{" "}
              <span className="text-[var(--color-primary)]">*</span>
            </label>
            <div className="w-full bg-transparent text-white px-4 py-3 rounded-full border border-white/50 flex items-center justify-between">
              <span className="uppercase">{selectedTokenLabel || "-"}</span>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="space-y-3 text-sm pt-4">
            <div className="flex justify-between items-center">
              <span>Prize Pool</span>
              <span className="flex items-center gap-2">
                <CurrencyIcon />$
                {baseAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                <span>{selectedTokenLabel}</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Fee {loadingPlan ? "" : isEnterprise ? "(0%)" : isCore ? `(${feePercent * 100}%)` : "(12%)"}</span>
              <span className="flex items-center gap-2">
                <CurrencyIcon />$
                {FEE_AMOUNT.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                <span>{selectedTokenLabel}</span>
              </span>
            </div>
            <div className="flex justify-between items-center font-bold text-base">
              <span>TOTAL</span>
              <span className="flex items-center gap-2">
                <CurrencyIcon />$
                {expectedAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                <span>{selectedTokenLabel}</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-white/10 text-center">
              {loadingPlan
                ? "Loading plan..."
                : isEnterprise
                  ? "Enterprise plan: 0% service fee."
                  : isCore
                    ? "Core plan: 6% up to $2k, 5% up to $5k, 3% above $5k (progressive by amount)."
                    : "Basic plan: 12% service fee — no minimum cap."}
            </p>
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
              <button
                aria-label="Close"
                onClick={onClose}
                className="cursor-pointer px-6 py-2 text-white bg-transparent border border-white/50 rounded-full font-medium whitespace-nowrap"
                disabled={isConnecting}
              >
                BACK
              </button>
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
                onClick={handleActivateCampaign}
                disabled={isActivating || !selectedChain || !selectedToken}
              >
                {isActivating ? "ACTIVATING..." : "ACTIVE CAMPAIGN"}
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

      {/* Modal de seleção de wallet Stellar */}
      <StellarWalletModal
        isOpen={showStellarWalletModal}
        onClose={() => setShowStellarWalletModal(false)}
        onConnect={handleStellarWalletConnected}
      />
    </div>
  );
}
