"use client";

import React from 'react';
import { useUser } from '@/lib/contexts/UserContext';
import NavbarGuest from './NavbarGuest';
import NavbarCreator from './NavbarCreator';
import NavbarHost from './NavbarHost';

const Navbar: React.FC = () => {
  const { userType, isLoading } = useUser();

  // Mostrar loading ou navbar guest durante carregamento
  if (isLoading) {
    return <NavbarGuest />;
  }

  // Renderizar navbar baseada no tipo de usuário
  switch (userType) {
    case 'host':
      return <NavbarHost />;
    case 'creator':
      return <NavbarCreator />;
    case 'guest':
    default:
      return <NavbarGuest />;
  }
};

export default Navbar;
