'use client';

import React, { useState } from 'react';
import { usePrivy, useOAuthTokens, useLoginWithOAuth } from '@privy-io/react-auth';
import { useAuth } from '@/lib/contexts/AuthContext';
import { detectTwitterBot } from '@/lib/utils/botDetection';
import { mergeCreatorLoginUser } from '@/lib/auth/mergeCreatorLoginUser';
import Image from 'next/image';

interface OAuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: (user: any) => void;
  title?: string;
  subtitle?: string;
  variant?: 'modal' | 'inline' | 'card';
  showBuiltInLogin?: boolean;
}

const OAuthModal: React.FC<OAuthModalProps> = ({
  isOpen = true,
  onClose,
  onSuccess,
  title = "Sign in to continue",
  subtitle = "Choose your preferred login method",
  variant = 'modal',
  showBuiltInLogin = false
}) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const { authenticated, user, logout, login, ready } = usePrivy();
  const { login: authLogin } = useAuth();

  // OAuth login hook
  const { initOAuth } = useLoginWithOAuth({
    onComplete: async ({ user, isNewUser, wasAlreadyAuthenticated, loginMethod }) => {
      setLoadingProvider(null);
      
      // Detecção de bots para login via Twitter
      if (loginMethod === 'twitter' && user?.twitter) {
        const botDetection = await detectTwitterBot({ twitter: user.twitter });
        
        if (botDetection.isBot) {
          console.warn("Bot detectado:", botDetection.reasons);
          
          if (user?.id) {
            try {
              const deleteResponse = await fetch('/api/privy/delete-user', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id }),
              });

              if (deleteResponse.ok) {
                console.log('Usuário deletado do Privy com sucesso');
              } else {
                const errorData = await deleteResponse.json().catch(() => ({}));
                console.warn('Erro ao deletar usuário do Privy:', errorData);
              }
            } catch (error) {
              console.error('Erro ao chamar API de deletar usuário:', error);
            }
          }
          
          // IMPORTANTE: Fazer logout do Privy PRIMEIRO (antes de limpar localStorage)
          // O Privy precisa dos dados no localStorage para fazer logout corretamente
          if (authenticated) {
            try {
              await logout();
            } catch (error) {
              console.error("Erro ao fazer logout do Privy:", error);
              // Continua mesmo se falhar - vamos limpar manualmente
            }
          }
          
          // Aguardar um pouco para o Privy processar o logout
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Agora limpar dados do localStorage
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              if (key.startsWith('privy:') || key.startsWith('privy.')) {
                keysToRemove.push(key);
              }
              if (key.toLowerCase().startsWith('wagmi')) {
                keysToRemove.push(key);
              }
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          // Remover dados específicos do app
          localStorage.removeItem('bounties_token');
          localStorage.removeItem('bounties_user');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('user');
          
          // Limpar cookies
          if (typeof document !== "undefined") {
            document.cookie = "bounties_token=; path=/; max-age=0";
            document.cookie = "auth_user=; path=/; max-age=0";
          }
          
          // Redirecionar para home para evitar loop
          setTimeout(() => {
            if (typeof window !== "undefined") {
              window.location.href = "/";
            }
          }, 500);
          
          // Não continuar com o login
          return;
        }
      }
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login-creator`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user,
            loginMethod,
          }),
        });

        const result = await response.json().catch(() => ({} as any));
        if (response.ok && result.success && result.user && result.token) {
          const userWithFirstLogin = mergeCreatorLoginUser({
            user: result.user,
            first_login: result.first_login,
          });

          localStorage.setItem('bounties_token', result.token);
          localStorage.setItem('bounties_user', JSON.stringify(userWithFirstLogin));
          
          await authLogin(userWithFirstLogin as any, result.token);
          onSuccess?.(userWithFirstLogin);
          return;
        }

        console.error('Authentication failed:', result?.message || response.statusText);
        localStorage.removeItem('bounties_token');
        localStorage.removeItem('bounties_user');
        localStorage.removeItem('auth_user');
        if (authenticated) {
          await logout();
        }
      } catch (error) {
        console.error('Error during authentication:', error);
        localStorage.removeItem('bounties_token');
        localStorage.removeItem('bounties_user');
        localStorage.removeItem('auth_user');
        if (authenticated) {
          await logout();
        }
      }
    },
    onError: (error) => {
      setLoadingProvider(null);
    },
  });

  // Handle OAuth token grants
  useOAuthTokens({
    onOAuthTokenGrant: (args) => {
      console.log('OAuth tokens granted', args);
    }
  });

  const handleProviderLogin = (provider: 'twitter' | 'google') => {
    setLoadingProvider(provider);
    initOAuth({ provider });
  };

  const handleLogout = () => {
    logout();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('bounties_token');
      localStorage.removeItem('bounties_user');
      
      localStorage.removeItem('updatedTwitter');
      localStorage.removeItem('updatedTiktok');
      localStorage.removeItem('updatedInstagram');
      localStorage.removeItem('click_link_twitter');
      localStorage.removeItem('click_link_tiktok');
      localStorage.removeItem('click_link_instagram');
      
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          // Remover chaves do privy
          if (key.startsWith('privy:')) {
            keysToRemove.push(key);
          }
          // Remover chaves do wagmi
          if (key.toLowerCase().startsWith('wagmi')) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  };

  if (!isOpen) return null;

  if (!ready) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <span className="text-[var(--color-text)]">Loading...</span>
          <p className="text-sm text-gray-400 mt-2">
            Inicializando Privy...
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Se demorar muito, verifique a configuração do Twitter OAuth no dashboard do Privy
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show profile
  if (authenticated && user) {
    const userDisplay = user.twitter?.username || user.google?.name || user.email?.address || user.id;
    
    const profileContent = (
      <div className="text-center space-y-4 p-6 bg-[var(--color-card)] rounded-3xl border border-[var(--color-border)]">
        <div className="flex flex-col items-center gap-3">
          <div>
            <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">
              Welcome back!
            </h3>
            <p className="text-sm text-gray-400">
              Logged in as: {userDisplay}
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Logout
        </button>
      </div>
    );

    if (variant === 'modal' && !isOpen) return null;
    
    return variant === 'modal' ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />
        <div className="relative z-10 max-w-md mx-4">
          {profileContent}
        </div>
      </div>
    ) : (
      profileContent
    );
  }

  // Use Privy's built-in login modal
  const loginContent = (
    <div className="text-center space-y-3">
      <button 
        onClick={login}
        className="w-full bg-[#1DA1F2] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#0d8bd9] transition-colors flex items-center justify-center gap-2"
      >
        <span>🐦</span>
        <span>Continue with Twitter</span>
      </button>
      <button 
        onClick={() => handleProviderLogin('google')}
        disabled={loadingProvider === 'google'}
        className="w-full bg-white text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingProvider === 'google' ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        <span>Continue with Google</span>
      </button>
    </div>
  );

  // Render based on variant
  switch (variant) {
    case 'modal':
      if (!isOpen) return null;
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />
          <div className="relative z-10 max-w-md mx-4 bg-[var(--color-card)] rounded-3xl p-8 border border-[var(--color-border)]">
            {loginContent}
          </div>
        </div>
      );

    case 'card':
      return (
        <div className="max-w-md mx-auto bg-[var(--color-card)] rounded-3xl p-8 border border-[var(--color-border)]">
          {loginContent}
        </div>
      );

    case 'inline':
    default:
      return (
        <div className="max-w-md mx-auto">
          {loginContent}
        </div>
      );
  }
};

export default OAuthModal;
