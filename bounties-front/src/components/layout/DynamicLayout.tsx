"use client";

import { useUser } from "@/lib/contexts/UserContext";
import NavbarGuest from './navbar/NavbarGuest';
import NavbarCreator from './navbar/NavbarCreator';
import NavbarHost from './navbar/NavbarHost';
import Footer from './Footer';

interface DynamicLayoutProps {
  children: React.ReactNode;
  hideNavbar?: boolean;
}

export default function DynamicLayout({ children, hideNavbar = false }: DynamicLayoutProps) {
  const { userType, isLoading } = useUser();

  const getNavbar = () => {
    if (isLoading) {
      return <NavbarGuest />;
    }

    switch (userType) {
      case 'host':
      case 'admin':
        return <NavbarHost />;
      case 'creator':
        return <NavbarCreator />;
      case 'guest':
      default:
        return <NavbarGuest />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && getNavbar()}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

