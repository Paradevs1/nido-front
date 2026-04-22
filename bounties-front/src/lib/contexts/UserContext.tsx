"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { getCurrentUser } from "@/data";
import { useAuth } from "./AuthContext";

interface UserContextType {
  user: User | null;
  userType: "guest" | "creator" | "host" | "admin";
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<
    "guest" | "creator" | "host" | "admin"
  >("guest");
  const {
    login: authLogin,
    setUserData: setAuthUser,
    user: authUser,
  } = useAuth();

  const getUserTypeFromPath = (): "guest" | "creator" | "host" | "admin" => {
    if (typeof window === "undefined") return "guest";

    const path = window.location.pathname;

    if (path.startsWith("/creator")) {
      return "creator";
    } else if (path.startsWith("/host")) {
      return "host";
    } else if (path.startsWith("/admin")) {
      return "admin";
    }

    return "guest";
  };

  useEffect(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "";

    // Se está em uma rota específica (creator/host/admin), usar o path
    if (
      path.startsWith("/creator") ||
      path.startsWith("/host") ||
      path.startsWith("/admin")
    ) {
      const newUserType = getUserTypeFromPath();
      setUserType(newUserType);
    } else {
      // Se não está em rota específica, verificar o role do usuário se estiver logado
      if (user) {
        // Verificar o role real do objeto (pode ser 'creator', 'host', 'admin' ou 'user')
        const userRole = (user as any).role;
        if (userRole === "host" || userRole === "admin") {
          setUserType("host");
        } else if (userRole === "creator") {
          setUserType("creator");
        } else {
          // Se role é 'user', verificar se está em /creator ou /host para determinar
          // Por padrão, se tem user mas role é 'user', considerar como creator
          setUserType("creator");
        }
      } else {
        setUserType("guest");
      }
    }
  }, [user]);

  const getUserType = (
    user: User | null
  ): "guest" | "creator" | "host" | "admin" => {
    if (!user) return getUserTypeFromPath();

    switch (user.role) {
      case "admin":
        return "admin";
      case "user":
      default:
        return getUserTypeFromPath();
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    // Sincronizar com AuthContext
    setAuthUser(userData);
    // Aqui você salvaria no localStorage ou cookie
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setAuthUser(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("bounties_token");
      localStorage.removeItem("bounties_user");

      localStorage.removeItem("updatedTwitter");
      localStorage.removeItem("updatedTiktok");
      localStorage.removeItem("updatedInstagram");
      localStorage.removeItem("click_link_twitter");
      localStorage.removeItem("click_link_tiktok");
      localStorage.removeItem("click_link_instagram");

      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          // Remover chaves do privy
          if (key.startsWith("privy:")) {
            keysToRemove.push(key);
          }
          // Remover chaves do wagmi
          if (key.toLowerCase().startsWith("wagmi")) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      window.location.href = "/";
    }
  };

  // Carregar usuário do localStorage na inicialização
  useEffect(() => {
    // Verificar bounties_user (para creators)
    const storedUser = localStorage.getItem("bounties_user");
    const storedToken = localStorage.getItem("bounties_token");

    // Verificar auth_user (para hosts)
    const authStoredUser = localStorage.getItem("auth_user");

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setAuthUser(userData);
      } catch (error) {
        localStorage.removeItem("bounties_user");
        localStorage.removeItem("bounties_token");
        setUser(null);
        setAuthUser(null);
      }
    } else if (authStoredUser) {
      // Se não tem bounties_user mas tem auth_user, usar auth_user
      try {
        const userData = JSON.parse(authStoredUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem("auth_user");
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (authUser) {
      setUser((currentUser) => {
        if (!currentUser || currentUser.id !== authUser.id) {
          return authUser;
        }
        return currentUser;
      });
    } else {
      setUser((currentUser) => {
        if (currentUser) {
          const storedUser = localStorage.getItem("bounties_user");
          const authStoredUser = localStorage.getItem("auth_user");

          if (!storedUser && !authStoredUser) {
            return null;
          }
        }
        return currentUser;
      });
    }
  }, [authUser]);

  const value: UserContextType = {
    user,
    userType,
    isLoading,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
