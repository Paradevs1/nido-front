import { createConfig, http } from 'wagmi';
import { base, arbitrum, mainnet, bsc, polygon } from 'wagmi/chains';
import { defineChain } from 'viem';
import { injected, metaMask, walletConnect } from '@wagmi/connectors';

// Berachain Mainnet
export const berachain = defineChain({
  id: 80094,
  name: 'Berachain',
  network: 'berachain',
  nativeCurrency: {
    name: 'BERA',
    symbol: 'BERA',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.berachain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Berachain Explorer',
      url: 'https://beratrail.io',
    },
  },
});

// HyperEVM (Hyperliquid)
export const hyperevm = defineChain({
  id: 999,
  name: 'HyperEVM',
  network: 'hyperevm',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hyperliquid Explorer',
      url: 'https://explorer.hyperliquid.xyz',
    },
  },
});

// Configuração das chains EVM suportadas
export const supportedChains = [
  mainnet, // Ethereum
  base,
  arbitrum,
  bsc, // BSC
  polygon, // Polygon
  berachain, // Berachain Mainnet
  hyperevm, // HyperEVM
  // Sui - não é EVM, será tratado separadamente
] as const;

const DEFAULT_EVM_RPC_URLS: Record<string, string> = {
  ethereum: 'https://eth.llamarpc.com',
  base: 'https://mainnet.base.org',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  bsc: 'https://bsc-dataseed.binance.org',
  polygon: 'https://polygon-rpc.com',
  berachain: 'https://rpc.berachain.com',
  hyperevm: 'https://rpc.hyperliquid.xyz/evm',
};

const EVM_RPC_URLS: Record<string, string> = {
  ethereum: process.env.NEXT_PUBLIC_RPC_ETHEREUM ?? DEFAULT_EVM_RPC_URLS.ethereum,
  base: process.env.NEXT_PUBLIC_RPC_BASE ?? DEFAULT_EVM_RPC_URLS.base,
  arbitrum: process.env.NEXT_PUBLIC_RPC_ARBITRUM ?? DEFAULT_EVM_RPC_URLS.arbitrum,
  bsc: process.env.NEXT_PUBLIC_RPC_BSC ?? DEFAULT_EVM_RPC_URLS.bsc,
  polygon: process.env.NEXT_PUBLIC_RPC_POLYGON ?? DEFAULT_EVM_RPC_URLS.polygon,
  berachain: process.env.NEXT_PUBLIC_RPC_BERACHAIN ?? DEFAULT_EVM_RPC_URLS.berachain,
  hyperevm: process.env.NEXT_PUBLIC_RPC_HYPEREVM ?? DEFAULT_EVM_RPC_URLS.hyperevm,
};

// Função para criar os connectors de forma segura
function createConnectors() {
  const metamaskInjected = injected({
    shimDisconnect: true,
    target: {
      id: 'metamask',
      name: 'MetaMask',
      provider: () => {
        if (typeof window === 'undefined') return undefined;
        // EIP-6963 (providers anunciados): usar rdns oficial (evita provider "metamask compat" da Rabby)
        const announced = (window as any).__bountiesEip6963Providers;
        if (Array.isArray(announced)) {
          const byRdns = announced.find(
            (x: any) =>
              String(x?.info?.rdns || '').toLowerCase() === 'io.metamask' &&
              x?.provider
          );
          if (byRdns?.provider) return byRdns.provider;
        }

        // Fallback conservador: se window.ethereum for MetaMask E não for Rabby
        const eth = (window as any).ethereum;
        if (eth?.isMetaMask === true && !(eth?.isRabby === true || eth?._isRabby === true)) return eth;
        return undefined;
      },
    },
  });

  const rabbyInjected = injected({
    shimDisconnect: true,
    target: {
      id: 'rabby',
      name: 'Rabby Wallet',
      provider: () => {
        if (typeof window === 'undefined') return undefined;
        const eth = (window as any).ethereum;
        if (eth) {
          if (Array.isArray(eth)) {
            const p = eth.find((p: any) => p?.isRabby === true || p?._isRabby === true);
            if (p) return p;
          }
          if (Array.isArray(eth.providers)) {
            const p = eth.providers.find((p: any) => p?.isRabby === true || p?._isRabby === true);
            if (p) return p;
          }
          if (eth.isRabby === true || eth._isRabby === true) return eth;
        }

        // EIP-6963 (providers anunciados): preferir rdns e/ou flags reais
        const announced = (window as any).__bountiesEip6963Providers;
        if (Array.isArray(announced)) {
          const byRdns = announced.find(
            (x: any) =>
              String(x?.info?.rdns || '').toLowerCase().includes('rabby') &&
              x?.provider
          );
          if (byRdns?.provider) return byRdns.provider;

          const byFlag = announced.find((x: any) => x?.provider?.isRabby === true || x?.provider?._isRabby === true);
          if (byFlag?.provider) return byFlag.provider;
        }
        return undefined;
      },
    },
  });

  const connectors: any[] = [
    // MetaMask específico (evita cair no provider errado quando há múltiplas wallets)
    metamaskInjected,
    // Rabby específico (evita cair no provider errado quando há múltiplas wallets)
    rabbyInjected,
  ];

  // Adicionar WalletConnect apenas se tiver Project ID configurado
  // WalletConnect não é obrigatório - podemos usar apenas injected e MetaMask
  const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  if (walletConnectProjectId && walletConnectProjectId.trim() !== '' && walletConnectProjectId !== 'undefined') {
    try {
      connectors.push(
        walletConnect({
          projectId: walletConnectProjectId,
          showQrModal: false, // Desabilitar QR modal se não tiver project ID válido
        })
      );
    } catch (error) {
      // Ignorar erro se WalletConnect não puder ser inicializado
      console.warn('WalletConnect não disponível:', error);
    }
  }

  return connectors;
}

// Criar configuração do wagmi de forma segura
export const wagmiConfig = createConfig({
  chains: supportedChains as [
    typeof mainnet,
    typeof base,
    typeof arbitrum,
    typeof bsc,
    typeof polygon,
    typeof berachain,
    typeof hyperevm
  ],
  connectors: createConnectors(),
  transports: {
    [mainnet.id]: http(EVM_RPC_URLS.ethereum),
    [base.id]: http(EVM_RPC_URLS.base),
    [arbitrum.id]: http(EVM_RPC_URLS.arbitrum),
    [bsc.id]: http(EVM_RPC_URLS.bsc),
    [polygon.id]: http(EVM_RPC_URLS.polygon),
    [berachain.id]: http(EVM_RPC_URLS.berachain),
    [hyperevm.id]: http(EVM_RPC_URLS.hyperevm),
  },
});

// Helper para detectar qual wallet está disponível
export const detectWallet = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const ethereum = (window as any).ethereum;
  if (!ethereum) return null;
  
  // Detectar wallets específicas com verificação melhorada
  // Verificar propriedades diretas
  if (ethereum.isRabby || ethereum._isRabby) return 'Rabby';
  
  // Verificar se está no array de providers
  if (Array.isArray(ethereum.providers)) {
    const rabbyProvider = ethereum.providers.find((provider: any) => 
      provider?.isRabby || provider?._isRabby
    );
    if (rabbyProvider) return 'Rabby';
  }
  
  // Verificar pelo nome do provider
  const providerName = ethereum.providerName || ethereum.constructor?.name || "";
  if (providerName.toLowerCase().includes("rabby")) return 'Rabby';
  
  // Verificar propriedades específicas da Rabby
  if (ethereum.rabby || ethereum._rabby) return 'Rabby';
  
  // Wallet genérica injetada
  return 'Injected Wallet';
};

// Mapeamento de chain names para IDs
export const chainNameToId: Record<string, number> = {
  ethereum: mainnet.id,
  base: base.id,
  arbitrum: arbitrum.id,
  bsc: bsc.id,
  bnb: bsc.id, // Alias para BSC (Binance Smart Chain)
  polygon: polygon.id,
  berachain: berachain.id,
  hyperevm: hyperevm.id,
  // Sui não é EVM, não precisa de chain ID aqui
};

export const chainIdToName: Record<number, string> = {
  [mainnet.id]: 'ethereum',
  [base.id]: 'base',
  [arbitrum.id]: 'arbitrum',
  [bsc.id]: 'bsc',
  [polygon.id]: 'polygon',
  [berachain.id]: 'berachain',
  [hyperevm.id]: 'hyperevm',
};

// Tokens disponíveis por chain (para validação e UI)
export const TOKENS = {
  base: {
    USDC: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    USDT: "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
  },
  arbitrum: {
    USDC: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  },
  ethereum: {
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  },
  berachain: {
    USDC: "0x549943e04f40284185054145c6E4e9568C1D3241",
    HONEY: "0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce",
  },
  bsc: {
    USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    USDT: "0x55d398326f99059ff775485246999027b3197955",
  },
  hyperevm: {
    USDC: "0xb88339cb7199b77e23db6e890353e22632ba630f",
    USDE: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
  },
  polygon: {
    USDC: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
    USDT: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  },
  solana: {
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  },
  sui: {
    USDC: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
    USDT: "0x375f70cf2ae4c00bf37117d0c85a2c71545e6ee05c4a5c7d282cd66a4504b068::usdt::USDT",
  },
};
