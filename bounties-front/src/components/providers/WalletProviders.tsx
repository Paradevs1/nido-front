"use client";

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from '@/lib/contexts/WalletContext';
import { wagmiConfig } from '@/lib/wallet/config';
import { ReactNode, useState, useEffect } from 'react';

export function WalletProviders({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Criar QueryClient dentro do componente para evitar problemas de SSR
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  useEffect(() => {
    setMounted(true);
  }, []);

  // Coletor EIP-6963 (MetaMask/Rabby em versões novas podem anunciar providers em vez de dominar window.ethereum)
  useEffect(() => {
    if (!mounted) return;
    if (typeof window === 'undefined') return;

    const w = window as any;
    if (!Array.isArray(w.__bountiesEip6963Providers)) {
      w.__bountiesEip6963Providers = [];
    }

    const onAnnounce = (event: any) => {
      const detail = event?.detail;
      const provider = detail?.provider;
      if (!provider) return;

      // Evitar duplicados por referência
      const exists = w.__bountiesEip6963Providers.some((p: any) => p?.provider === provider);
      if (!exists) {
        w.__bountiesEip6963Providers.push({ info: detail?.info, provider });
      }
    };

    window.addEventListener('eip6963:announceProvider', onAnnounce as any);

    // Pedir providers (o spec recomenda disparar esse evento para receber announceProvider)
    try {
      window.dispatchEvent(new Event('eip6963:requestProvider'));
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('eip6963:announceProvider', onAnnounce as any);
    };
  }, [mounted]);

  // Durante SSR, renderizar apenas os children sem os providers de wallet
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

