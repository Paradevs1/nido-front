"use client";

import NavbarCreator from './navbar/NavbarCreator';
import Footer from './Footer';

interface CreatorLayoutProps {
  children: React.ReactNode;
}

export default function CreatorLayout({ children }: CreatorLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavbarCreator />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
