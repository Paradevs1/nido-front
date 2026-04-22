"use client";

import NavbarGuest from './navbar/NavbarGuest';
import Footer from './Footer';

interface GuestLayoutProps {
  children: React.ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavbarGuest />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
