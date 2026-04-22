"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import dynamic from "next/dynamic";
const CreatorOnboardingModal = dynamic(() => import("./CreatorOnboardingModal"), { ssr: false });
import { useEffect, useState } from "react";

export default function CreatorOnboardingMonitor() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const role = user?.role || (user as any)?.user_type;
    const isCreator = role === 'creator' || role === 'CREATOR';
    // Modal obrigatório quando first_login não é false: true, null, undefined ou "" = deve mostrar
    const firstLoginRaw: any = user?.first_login;
    // Alguns fluxos podem salvar "false" como string no localStorage; normalizamos aqui.
    const firstLoginNormalized = firstLoginRaw === 'false' ? false : firstLoginRaw;
    const isMissingOnboarding = firstLoginNormalized !== false;

    setDebugInfo(`Auth:${isAuthenticated} | Role:${role} | FL:${user?.first_login} | Open:${isAuthenticated && isCreator && isMissingOnboarding}`);

    if (isAuthenticated && isCreator && isMissingOnboarding) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isAuthenticated, user, user?.first_login]);

  return (
    <>
      <CreatorOnboardingModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onComplete={() => setIsOpen(false)}
      />
    </>
  );
}
