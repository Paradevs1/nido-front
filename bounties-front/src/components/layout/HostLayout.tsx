"use client";

import { NavbarHost } from "./navbar";
import Footer from "./Footer";
import { useAuth } from "@/lib/contexts/AuthContext";

interface HostLayoutProps {
  children: React.ReactNode;
}

export default function HostLayout({ children }: HostLayoutProps) {
  const { user } = useAuth();
  // Navbar: host + registro completo. (active_account_host só é exigido quando o fluxo de pagamento está ativo no HostPaymentGuard.)
  const shouldShowNavbar =
    user?.role === "host" && user?.registerCompleted === true;

  return (
    <div className="relative overflow-x-hidden w-full min-h-screen">
      {shouldShowNavbar && <NavbarHost />}
      {children}
      <Footer />
    </div>
  );
}