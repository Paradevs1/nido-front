"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useChainId,
} from "wagmi";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { clusterApiUrl } from "@solana/web3.js";
import { wagmiConfig, chainNameToId } from "@/lib/wallet/config";
import {
  SuiClientProvider,
  WalletProvider as SuiWalletProvider,
  createNetworkConfig,
  useCurrentAccount,
  useCurrentWallet,
  useConnectWallet,
  useDisconnectWallet,
  useWallets,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { isAllowed as isFreighterAllowed, setAllowed as setFreighterAllowed, getAddress as getFreighterAddress } from "@stellar/freighter-api";
import "@mysten/dapp-kit/dist/index.css";

const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl("mainnet") },
});

interface WalletContextType {
  // EVM
  evmAddress: string | undefined;
  evmChainId: number | undefined;
  evmChainName: string | undefined;
  evmWalletName: string | undefined;
  isEvmConnected: boolean;
  connectEvm: (chain?: string) => Promise<void>;
  disconnectEvm: () => void;
  switchEvmChain: (chainName: string) => Promise<void>;

  // Solana
  solanaAddress: string | null;
  solanaWalletName: string | null;
  isSolanaConnected: boolean;
  connectSolana: () => Promise<void>;
  disconnectSolana: () => void;

  // SUI
  suiAddress: string | null;
  suiWalletName: string | null;
  isSuiConnected: boolean;
  connectSui: () => Promise<void>;
  disconnectSui: () => void;

  // Stellar
  stellarAddress: string | null;
  stellarWalletName: string | null;
  isStellarConnected: boolean;
  connectStellar: () => Promise<void>;
  disconnectStellar: () => void;

  // Geral
  getCurrentWalletAddress: (chain: string) => string | null;
  isWalletConnected: (chain: string) => boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Componente interno para usar hooks do wagmi (precisa estar dentro do WagmiProvider)
function WalletContextProviderInner({ children }: { children: ReactNode }) {
  // EVM hooks
  const {
    address: evmAddress,
    chainId: evmChainId,
    isConnected: isEvmConnected,
    connector: evmConnector,
  } = useAccount();
  const { connect: connectEvmWallet, connectors } = useConnect();
  const { disconnect: disconnectEvmWallet } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  // Solana hooks
  const {
    publicKey,
    disconnect: disconnectSolanaWallet,
    connected: isSolanaConnected,
    wallet: activeSolanaWallet,
  } = useWallet();
  const { connection } = useConnection();

  // SUI hooks
  const currentAccount = useCurrentAccount();
  const { currentWallet } = useCurrentWallet();
  const { mutateAsync: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets();
  const isSuiConnected = !!currentAccount;

  const [evmChainName, setEvmChainName] = useState<string | undefined>();
  const [evmWalletName, setEvmWalletName] = useState<string | undefined>();

  // Stellar state
  const [stellarAddress, setStellarAddress] = useState<string | null>(null);
  const [isStellarConnected, setIsStellarConnected] = useState(false);

  useEffect(() => {
    if (chainId) {
      const chainName = wagmiConfig.chains
        .find((c) => c.id === chainId)
        ?.name.toLowerCase();
      setEvmChainName(chainName || "ethereum");
    }
  }, [chainId]);

  useEffect(() => {
    setEvmWalletName(evmConnector?.name);
  }, [evmConnector]);

  const connectEvm = async (chainName?: string) => {
    try {
      // Prioridade: MetaMask > Injected (Rabby, etc.) > WalletConnect
      let connector = connectors.find((c) => c.id === "metamask");

      // Se MetaMask não estiver disponível, usar Rabby (connector dedicado)
      if (!connector || !(window as any).ethereum?.isMetaMask) {
        connector = connectors.find((c) => c.id === "rabby");
      }

      // Fallback para primeiro connector disponível
      if (!connector) {
        connector = connectors[0];
      }

      if (!connector) {
        throw new Error(
          "No wallet found. Please install MetaMask, Rabby or another EVM wallet."
        );
      }

      // Conectar a wallet
      await connectEvmWallet({ connector });

      // Aguardar um pouco para a conexão ser estabelecida
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Se especificou uma chain, fazer switch automaticamente
      if (chainName) {
        console.log(`Conectando e trocando para chain ${chainName}...`);
        await switchEvmChain(chainName);
      }
    } catch (error: unknown) {
      console.error("Error connecting EVM wallet:", error);
      const e = error as { code?: number; message?: string };

      // Mensagens de erro mais amigáveis
      if (e.code === 4001) {
        throw new Error("Connection rejected by user");
      } else if (e.message?.includes("No Ethereum provider")) {
        throw new Error(
          "No wallet found. Please install MetaMask, Rabby or another EVM wallet."
        );
      } else if (e.message?.includes("Troca de chain")) {
        // Se o erro for sobre troca de chain, relançar com a mensagem original
        throw error;
      }

      throw error;
    }
  };

  const disconnectEvm = () => {
    disconnectEvmWallet();
  };

  const switchEvmChain = async (chainName: string) => {
    try {
      const chainId = chainNameToId[chainName.toLowerCase()];

      if (!chainId) {
        throw new Error(`Chain ${chainName} não suportada`);
      }

      // Se já estiver na chain correta, não precisa trocar
      if (evmChainId === chainId) {
        console.log(`Wallet já está na chain ${chainName} (${chainId})`);
        return;
      }

      if (switchChain) {
        console.log(`Trocando para chain ${chainName} (${chainId})...`);
        await switchChain({ chainId });

        // Aguardar um pouco para a wallet processar a mudança
        // Nota: Não podemos aguardar indefinidamente, então usamos um timeout curto
        await new Promise((resolve) => setTimeout(resolve, 1500));

        console.log(`Switch para chain ${chainName} concluído`);
      } else {
        throw new Error("Função switchChain não disponível");
      }
    } catch (error: unknown) {
      console.error("Error switching chain:", error);
      const e = error as { code?: number; message?: string };

      // Verificar se é rejeição do usuário
      if (
        e.code === 4001 ||
        e.message?.includes("User rejected") ||
        e.message?.includes("user rejected") ||
        e.message?.includes("rejected by user")
      ) {
        // Criar erro especial que pode ser identificado como rejeição do usuário
        const rejectionError = new Error("USER_REJECTED") as Error & { isUserRejection: boolean };
        rejectionError.isUserRejection = true;
        throw rejectionError;
      } else if (e.code === 4902) {
        // Chain não está adicionada - também pode ser tratado como rejeição silenciosa
        // pois o usuário precisa adicionar manualmente
        const rejectionError = new Error("USER_REJECTED") as Error & { isUserRejection: boolean };
        rejectionError.isUserRejection = true;
        throw rejectionError;
      }

      throw error;
    }
  };

  const connectSolana = async () => {
    try {
      // Para Solana, precisamos usar o componente WalletMultiButton do adapter
      // O connectSolana apenas indica que devemos abrir o modal
      // O usuário precisa clicar no botão do wallet adapter
      // Isso será gerenciado pelo componente de UI que usa useWalletModal
      if (!isSolanaConnected) {
        // Trigger do modal será feito via componente
        // Por enquanto, apenas retornar
        return;
      }
    } catch (error) {
      console.error("Error connecting Solana wallet:", error);
      throw error;
    }
  };

  const disconnectSolana = () => {
    disconnectSolanaWallet();
  };

  const connectSui = async () => {
    try {
      // Se já estiver conectado, não precisa fazer nada
      if (isSuiConnected && currentAccount) {
        return;
      }

      // Se não tiver wallets disponíveis, lançar erro
      if (!wallets || wallets.length === 0) {
        throw new Error("No SUI wallet found. Please install Sui Wallet or another SUI wallet.");
      }

      // Se já tiver uma wallet selecionada (mas não conectada?), tentar conectar
      // Nota: No dapp-kit, currentWallet pode ser nulo se não conectado
      // Vamos tentar conectar com a primeira wallet disponível se currentWallet for nulo

      // Precisamos passar o objeto wallet para o connect
      // Vamos tentar encontrar a Slash primeiro (pedido do usuário), ou usar a primeira
      let targetWallet = wallets.find(w =>
        w.name.toLowerCase().includes('slash') || w.name.toLowerCase().includes('slush')
      );
      if (!targetWallet) {
        targetWallet = wallets[0];
      }

      if (targetWallet) {
        await connect({ wallet: targetWallet });
      } else {
        throw new Error("No SUI wallet found. Please install Sui Wallet or another SUI wallet.");
      }
    } catch (error: unknown) {
      console.error("Error connecting SUI wallet:", error);
      const e = error as { message?: string };
      if (
        e.message?.includes("rejected") ||
        e.message?.includes("User rejected") ||
        e.message?.includes("user rejected")
      ) {
        const rejectionError = new Error("USER_REJECTED") as Error & { isUserRejection: boolean };
        rejectionError.isUserRejection = true;
        throw rejectionError;
      }
      throw error;
    }
  };

  const disconnectSui = () => {
    disconnect();
  };

  const connectStellar = async () => {
    try {
      // isConnected() check is skipped because it fails on HTTP (localhost) via content scripts.
      // We go directly to requesting permissions or fetching the address.

      // Freighter v6 requires explicit permission before getAddress() works.
      // Check if the site is already allowed, request if not.
      const allowedStatus = await isFreighterAllowed();
      if (!allowedStatus.isAllowed) {
        const allowResult = await setFreighterAllowed();
        if (!allowResult.isAllowed) {
          // User rejected the permission popup
          const rejectionError = new Error("USER_REJECTED") as Error & { isUserRejection: boolean };
          rejectionError.isUserRejection = true;
          throw rejectionError;
        }
      }

      const { address, error } = await getFreighterAddress();
      if (error) {
        const errMsg = typeof error === "string" ? error : (error as any)?.message ?? "Unknown error";
        if (errMsg.toLowerCase().includes("user rejected") || errMsg.toLowerCase().includes("rejected")) {
          const rejectionError = new Error("USER_REJECTED") as Error & { isUserRejection: boolean };
          rejectionError.isUserRejection = true;
          throw rejectionError;
        }
        throw new Error(errMsg);
      }

      if (address) {
        setStellarAddress(address);
        setIsStellarConnected(true);
      }
    } catch (error: any) {
      console.error("Error connecting Stellar wallet:", error);
      throw error;
    }
  };

  const disconnectStellar = () => {
    setStellarAddress(null);
    setIsStellarConnected(false);
  };

  const getCurrentWalletAddress = (chain: string): string | null => {
    const chainLower = chain.toLowerCase();
    if (chainLower === "solana") {
      return publicKey?.toBase58() || null;
    }
    if (chainLower === "sui") {
      return currentAccount?.address || null;
    }
    if (chainLower === "stellar") {
      return stellarAddress;
    }
    return evmAddress || null;
  };

  const isWalletConnected = (chain: string): boolean => {
    const chainLower = chain.toLowerCase();
    if (chainLower === "solana") {
      return isSolanaConnected;
    }
    if (chainLower === "sui") {
      return isSuiConnected;
    }
    if (chainLower === "stellar") {
      return isStellarConnected;
    }
    return isEvmConnected;
  };

  const value: WalletContextType = {
    evmAddress,
    evmChainId,
    evmChainName,
    evmWalletName,
    isEvmConnected,
    connectEvm,
    disconnectEvm,
    switchEvmChain,
    solanaAddress: publicKey?.toBase58() || null,
    solanaWalletName: activeSolanaWallet?.adapter.name || null,
    isSolanaConnected,
    connectSolana,
    disconnectSolana,
    suiAddress: currentAccount?.address || null,
    suiWalletName: currentWallet?.name || null,
    isSuiConnected,
    connectSui,
    disconnectSui,
    stellarAddress,
    stellarWalletName: "Freighter",
    isStellarConnected,
    connectStellar,
    disconnectStellar,
    getCurrentWalletAddress,
    isWalletConnected,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

// Provider principal que envolve tudo
export function WalletProvider({ children }: { children: ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet;

  // Lista de RPCs públicos confiáveis para Solana (em ordem de prioridade)
  const fallbackEndpoints = [
    "https://api.mainnet-beta.solana.com", // RPC oficial da Solana
    "https://solana-api.projectserum.com", // Serum RPC
    "https://rpc.ankr.com/solana", // Ankr RPC
    "https://solana-rpc.publicnode.com", // PublicNode RPC
  ];

  const defaultEndpoint = fallbackEndpoints[0];
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    (typeof window !== "undefined" ? defaultEndpoint : clusterApiUrl(network));

  const wallets = [
    new PhantomWalletAdapter(),
    // new BackpackWalletAdapter(), // Comentado - não usar por enquanto
  ];

  return (
    <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
      <SuiWalletProvider autoConnect>
        <SolanaWalletProvider wallets={wallets} autoConnect>
          <ConnectionProvider endpoint={endpoint}>
            <WalletModalProvider>
              <WalletContextProviderInner>{children}</WalletContextProviderInner>
            </WalletModalProvider>
          </ConnectionProvider>
        </SolanaWalletProvider>
      </SuiWalletProvider>
    </SuiClientProvider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
}
