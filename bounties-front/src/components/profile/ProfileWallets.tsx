"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { creatorApi, CreatorProfile } from "@/lib/api/creator";

interface ProfileWalletsProps {
  user?: CreatorProfile | null;
  onWalletConnected?: (address: string, blockchain: string) => void;
}

export default function ProfileWallets({ user, onWalletConnected }: ProfileWalletsProps) {
  const [evmWallet, setEvmWallet] = useState(user?.wallet_evm || '');
  const [solanaWallet, setSolanaWallet] = useState(user?.wallet_sol || '');
  const [suiWallet, setSuiWallet] = useState(user?.wallet_sui || '');
  const [stellarWallet, setStellarWallet] = useState(user?.wallet_stellar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateWalletAddress = (address: string, type: string) => {
    if (!address.trim()) return true;
    
    switch (type) {
      case 'evm':
        return address.match(/^0x[a-fA-F0-9]{40}$/);
      case 'solana':
        return address.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
      case 'sui':
        return address.match(/^0x[a-fA-F0-9]{64}$/);
      case 'stellar':
        return address.match(/^G[A-Z2-7]{55}$/);
      default:
        return true;
    }
  };

  const handleSaveWallets = async () => {
    if (!validateWalletAddress(evmWallet, 'evm')) {
      setError('Formato de endereço EVM inválido. Use um endereço Ethereum válido (0x...)');
      return;
    }
    
    if (!validateWalletAddress(solanaWallet, 'solana')) {
      setError('Formato de endereço Solana inválido. Use um endereço Solana válido (base58)');
      return;
    }
    
    if (!validateWalletAddress(suiWallet, 'sui')) {
      setError('Formato de endereço SUI inválido. Use um endereço SUI válido (0x...)');
      return;
    }

    if (!validateWalletAddress(stellarWallet, 'stellar')) {
      setError('Formato de endereço Stellar inválido. Use um endereço Stellar válido (inicia com G...)');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await creatorApi.insertWallets({
        wallet_evm: evmWallet.trim(),
        wallet_sol: solanaWallet.trim(),
        wallet_sui: suiWallet.trim(),
        wallet_stellar: stellarWallet.trim()
      });
      
      setSuccess(response.message);
      if (onWalletConnected) {
        onWalletConnected(evmWallet, 'EVM');
      }
    } catch (err: unknown) {
      console.error('Error saving wallets:', err);
      setError('Erro ao salvar wallets');
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="bg-[var(--color-card)] rounded-3xl p-6 h-fit w-full mx-auto">
      <h2 className="text-white text-xl font-bold mb-4">WALLETS</h2>
      
      {error && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/50 rounded-2xl">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-3 p-3 bg-green-500/10 border border-green-500/50 rounded-2xl">
          <p className="text-green-400 text-xs">{success}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            EVM Wallet Address
          </label>
          <input
            type="text"
            value={evmWallet}
            onChange={(e) => setEvmWallet(e.target.value)}
            placeholder="0x..."
            maxLength={42}
            className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
          />

        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Solana Wallet Address
          </label>
          <input
            type="text"
            value={solanaWallet}
            onChange={(e) => setSolanaWallet(e.target.value)}
            placeholder="HT..."
            maxLength={44}
            className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
          />

        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            SUI Wallet Address
          </label>
          <input
            type="text"
            value={suiWallet}
            onChange={(e) => setSuiWallet(e.target.value)}
            placeholder="0x..."
            maxLength={66}
            className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Stellar Wallet Address
          </label>
          <input
            type="text"
            value={stellarWallet}
            onChange={(e) => setStellarWallet(e.target.value)}
            placeholder="G..."
            maxLength={56}
            className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none focus:border-white transition-all"
          />
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSaveWallets}
            className="w-full px-4 py-2 text-sm font-medium cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save Wallets'}
          </Button>
        </div>
      </div>
    </div>
  );
}
