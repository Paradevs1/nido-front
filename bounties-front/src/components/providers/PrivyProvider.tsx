"use client";

import {
  PrivyProvider as PrivyProviderBase,
} from "@privy-io/react-auth";
import { ReactNode } from "react";

interface PrivyProviderProps {
  children: ReactNode;
}

/**
 * PrivyProvider wrapper
 * 
 * Nota: Os warnings de DOM (text-rendering, image-rendering, etc.) são conhecidos
 * do Privy com React 19 e não afetam a funcionalidade. Eles ocorrem porque o Privy
 * usa propriedades SVG em formato HTML em vez de camelCase do React.
 * 
 * Para loginMethods, certifique-se de que:
 * 1. Os métodos estão habilitados no Dashboard do Privy
 * 2. As credenciais OAuth estão configuradas para cada provedor
 * 3. Os nomes dos métodos estão corretos: "twitter", "google", "tiktok", "instagram"
 */
export function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "temp-app-id";

  if (appId === "temp-app-id") {
    return <>{children}</>;
  }

  return (
    <PrivyProviderBase
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#ff5800",
          logo: "/assets/footer/logoParadevs.png",
        },
        loginMethods: ["twitter", "google"] as const, // ["twitter", "google", "instagram", "tiktok"]
        embeddedWallets: {
          ethereum: {
            createOnLogin: "off",
          },
        },
      }}
    >
      {children}
    </PrivyProviderBase>
  );
}

export default PrivyProvider;
