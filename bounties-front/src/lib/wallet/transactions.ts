import { writeContract, waitForTransaction, getAccount as getWagmiAccount, switchChain } from 'wagmi/actions';
import { parseUnits, Address } from 'viem';
import { wagmiConfig, chainNameToId } from './config';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction, 
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Transaction as SuiTransaction } from '@mysten/sui/transactions';
import { 
    Asset, 
    Networks, 
    Operation, 
    Horizon,
    TransactionBuilder as StellarTransactionBuilder 
} from 'stellar-sdk';
import { signTransaction as signFreighterTransaction } from "@stellar/freighter-api";

// Tipo helper para chain IDs suportados
type SupportedChainId = 1 | 56 | 80094 | 999 | 8453 | 42161 | 137;

// Helpers para Solana com Retry
const SOLANA_RPC_ENDPOINTS = [
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://solana-rpc.publicnode.com",
  "https://solana-rpc.publicnode.com",
  "https://api.mainnet-beta.solana.com",
  "https://solana-api.projectserum.com",
  "https://rpc.ankr.com/solana",
  "https://solana.public-rpc.com",
];

function dedupeEndpoints(endpoints: string[]): string[] {
  const seen = new Set<string>();
  return endpoints.filter((endpoint) => {
    const trimmed = endpoint?.trim();
    if (!trimmed || seen.has(trimmed)) {
      return false;
    }
    seen.add(trimmed);
    return true;
  });
}

function getConnectionEndpoint(connection?: Connection): string | undefined {
  try {
    return (connection as any)?._rpcEndpoint || (connection as any)?.rpcEndpoint;
  } catch {
    return undefined;
  }
}

function buildRpcRotationList(currentEndpoint?: string): string[] {
  const baseList = dedupeEndpoints([
    currentEndpoint || '',
    ...SOLANA_RPC_ENDPOINTS,
  ]);
  if (!currentEndpoint) return baseList;

  const currentIndex = baseList.indexOf(currentEndpoint);
  if (currentIndex <= 0) return baseList;

  // Reordenar para que o endpoint atual seja o primeiro e os demais sigam em ordem
  return [
    ...baseList.slice(currentIndex),
    ...baseList.slice(0, currentIndex),
  ];
}

function createSolanaConnection(endpoint: string): Connection {
  return new Connection(endpoint, 'confirmed');
}

function isRpcError(error: unknown): boolean {
  const err = error as any;
  const message = err?.message || '';
  const errorString = JSON.stringify(error) || '';
  
  return (
    message.includes('403') ||
    message.includes('Access forbidden') ||
    errorString.includes('"code":403') ||
    message.includes('429') ||
    message.includes('Too Many Requests') ||
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.includes('fetch failed') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ETIMEDOUT') ||
    message.includes('timeout') ||
    message.includes('RPC connection failed')
  );
}

// Função helper para validar e converter chainId
function assertSupportedChainId(chainId: number): SupportedChainId {
  const supportedIds: SupportedChainId[] = [1, 56, 80094, 999, 8453, 42161, 137];
  if (!supportedIds.includes(chainId as SupportedChainId)) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return chainId as SupportedChainId;
}

const TOKEN_ADDRESSES: Record<string, Record<string, Address>> = {
  ethereum: {
    usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    usdt: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  },
  base: {
    usdc: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    usdt: '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2',
  },
  arbitrum: {
    usdc: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  },
  berachain: {
    usdc: '0x549943e04f40284185054145c6E4e9568C1D3241',
    honey: '0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce',
  },
  bsc: {
    usdc: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    usdt: '0x55d398326f99059ff775485246999027b3197955',
  },
  bnb: {
    usdc: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    usdt: '0x55d398326f99059ff775485246999027b3197955',
  },
  hyperevm: {
    usdc: '0xb88339cb7199b77e23db6e890353e22632ba630f',
    usde: '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34',
  },
  polygon: {
    usdc: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
    usdt: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  },
};

const SPL_TOKEN_MINTS: Record<string, string> = {
  usdc: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  usdt: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
};

const SUI_TOKEN_ADDRESSES: Record<string, string> = {
  usdc: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
  usdt: '0x375f70cf2ae4c00bf37117d0c85a2c71545e6ee05c4a5c7d282cd66a4504b068::usdt::USDT',
};

const STELLAR_USDC_ISSUER = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';
const STELLAR_HORIZON_URL = process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon.stellar.org';
const stellarServer = new Horizon.Server(STELLAR_HORIZON_URL);

const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
] as const;

export async function sendEVMTransaction(
  chain: string,
  token: string,
  to: string,
  amount: number,
  walletAddress: string,
  tokenContractAddress?: string
): Promise<string> {
  const originalChain = chain;
  try {
    let chainLower = chain.toLowerCase();
    const tokenLower = token.toLowerCase();
    
    if (chainLower === 'bnb') {
      chainLower = 'bsc';
    }
    
    const tokenAddress =
      (tokenContractAddress as Address | undefined) ||
      (TOKEN_ADDRESSES[chainLower]?.[tokenLower] as Address | undefined);
    
    if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error(`Token ${token} is not supported on chain ${chain}. Supported tokens: ${Object.keys(TOKEN_ADDRESSES[chainLower] || {}).join(', ')}`);
    }
    
    // Definir decimais baseado no token e na chain
    let decimals = 18;
    if (['usdc', 'usdt', 'usde'].includes(tokenLower)) {
      // Na BSC, tokens pegados (Binance-Peg) usam 18 decimais, diferente do padrão ERC20 de USDC/USDT que é 6
      if (chainLower === 'bsc') {
        decimals = 18;
      } else {
        decimals = 6;
      }
    }
    
    let amountString: string;
    let amountNumber: number;
    
    if (typeof amount === 'string') {
      amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error(`Invalid amount string: ${amount}. Must be a positive number.`);
      }
      amountString = amount;
    } else if (typeof amount === 'number') {
      if (isNaN(amount) || amount <= 0 || !isFinite(amount)) {
        throw new Error(`Invalid amount number: ${amount}. Must be a positive finite number.`);
      }
      amountNumber = amount;
      
      amountString = amount.toFixed(decimals);
    } else {
      throw new Error(`Invalid amount type: ${typeof amount}. Expected number or string. Received: ${JSON.stringify(amount)}`);
    }
    
    const validatedAmount = parseFloat(amountString);
    if (isNaN(validatedAmount) || validatedAmount <= 0 || !isFinite(validatedAmount)) {
      throw new Error(`Invalid amount after conversion: ${amountString}. Original: ${amount} (${typeof amount})`);
    }
    
    const amountInWei = parseUnits(amountString, decimals);

    const chainId = chainNameToId[chainLower];
    if (!chainId) {
      throw new Error(`Chain ${chain} is not supported. Supported chains: ${Object.keys(chainNameToId).join(', ')}`);
    }

    try {
      const account = getWagmiAccount(wagmiConfig);
      if (!account.address) {
        throw new Error('Wallet is not connected');
      }

      if (account.chainId !== undefined && account.chainId !== chainId) {
        try {
          // Tentar fazer switch automático para a chain correta
          await switchChain(wagmiConfig, { chainId: assertSupportedChainId(chainId) });
          // Aguardar um pouco para a wallet processar a mudança
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const accountAfterSwitch = getWagmiAccount(wagmiConfig);
          if (accountAfterSwitch.chainId !== undefined && accountAfterSwitch.chainId !== chainId) {
            throw new Error(`Could not switch to chain ${chain} (${chainId}). Please switch manually in your wallet.`);
          }
        } catch (switchError: any) {
          // Se o switch falhar, verificar se é rejeição do usuário
          const switchErrorMessage = switchError?.message || '';
          const switchErrorCode = switchError?.code;
          
          if (
            switchErrorCode === 4001 ||
            switchErrorCode === 4902 ||
            switchErrorMessage.includes('User rejected') ||
            switchErrorMessage.includes('user rejected') ||
            switchErrorMessage.includes('rejected by user') ||
            (switchError as any)?.isUserRejection === true ||
            switchErrorMessage === 'USER_REJECTED'
          ) {
            // Criar erro especial que pode ser identificado como rejeição do usuário
            const rejectionError = new Error('USER_REJECTED') as Error & { isUserRejection: boolean };
            rejectionError.isUserRejection = true;
            throw rejectionError;
          }
          // Para outros erros de switch, lançar erro genérico
          throw new Error(`Could not switch to chain ${chain} (${chainId}). Please switch manually in your wallet.`);
        }
      }
    } catch (accountError: any) {
      if (accountError?.message?.includes('chain') || accountError?.message?.includes('Chain')) {
        throw accountError;
      }
    }

    const hash = await writeContract(wagmiConfig, {
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [to as Address, amountInWei],
      chainId: assertSupportedChainId(chainId),
    });
    
    const receipt = await waitForTransaction(wagmiConfig, { 
      hash, 
      confirmations: 1,
      timeout: 120_000,
    });
    
    if (!receipt.transactionHash) {
      throw new Error('Transaction failed - no hash returned');
    }

    return receipt.transactionHash;
  } catch (error: any) {
    const errorName = error?.name || '';
    const errorMessage = error?.message || '';
    const errorShortMessage = error?.shortMessage || '';
    const errorCode = error?.code || '';
    const errorString = `${errorName} ${errorMessage} ${errorShortMessage} ${errorCode}`.toLowerCase();
    
/*     if (process.env.NODE_ENV === 'development') {
      console.error('EVM Transaction Error:', {
        name: errorName,
        message: errorMessage,
        shortMessage: errorShortMessage,
        code: errorCode,
        error: error,
        chain: originalChain,
      });
    } */
    
    // Tentar obter a chain atual da wallet para diagnóstico
    let currentChainId: number | undefined;
    try {
      const account = getWagmiAccount(wagmiConfig);
      currentChainId = account.chainId;
    } catch {
      // Ignorar erro ao obter chain atual
    }
    
    if (
      errorName === 'UserRejectedRequestError' ||
      errorString.includes('user rejected') ||
      (errorString.includes('rejected') && (errorString.includes('request') || errorString.includes('user')))
    ) {
      // Criar erro especial que pode ser identificado como rejeição do usuário
      const rejectionError = new Error('USER_REJECTED') as Error & { isUserRejection: boolean };
      rejectionError.isUserRejection = true;
      throw rejectionError;
    } else if (
      errorMessage?.includes('insufficient funds') ||
      errorString.includes('insufficient funds') ||
      errorString.includes('insufficient balance') ||
      errorMessage?.includes('transfer amount exceeds balance') ||
      errorString.includes('transfer amount exceeds balance') ||
      errorMessage?.includes('exceeds balance') ||
      errorString.includes('exceeds balance') ||
      errorMessage?.includes('ERC20: transfer amount exceeds balance') ||
      errorString.includes('erc20: transfer amount exceeds balance')
    ) {
      throw new Error('Insufficient balance to complete the transaction');
    } else if (
      errorMessage?.includes('chain') ||
      errorString.includes('chain') ||
      errorString.includes('unsupported chain') ||
      errorString.includes('chain mismatch') ||
      errorString.includes('wrong chain') ||
      errorString.includes('invalid chain')
    ) {
      throw new Error('Incorrect chain. Please switch to the correct chain in your wallet and try again.');
    } else if (
      isRpcError(error) ||
      errorMessage?.includes('RPC') ||
      errorString.includes('rpc') ||
      errorMessage?.includes('fetch failed') ||
      errorMessage?.includes('Failed to fetch') ||
      errorMessage?.includes('ECONNREFUSED') ||
      errorMessage?.includes('ETIMEDOUT') ||
      errorMessage?.includes('timeout')
    ) {
      throw new Error('RPC connection error. Please check your network connection and try again. If the problem persists, the RPC endpoint may be temporarily unavailable.');
    } else if (
      errorMessage?.includes('wallet') && (
        errorMessage?.includes('not connected') ||
        errorMessage?.includes('disconnected') ||
        errorString.includes('wallet not connected') ||
        errorString.includes('no wallet')
      )
    ) {
      throw new Error('Wallet is not connected. Please connect your wallet and try again.');
    } else if (
      errorMessage?.includes('execution reverted') ||
      errorString.includes('execution reverted') ||
      errorMessage?.includes('revert') ||
      errorString.includes('revert')
    ) {
      // Erro de execução revertida - pode ser saldo insuficiente, permissão negada, etc.
      if (errorString.includes('insufficient') || errorString.includes('balance')) {
        throw new Error('Insufficient balance to complete the transaction');
      }
      throw new Error('Transaction was reverted. Please check that you have sufficient balance and the correct permissions.');
    } else if (
      errorMessage?.includes('action rejected') ||
      errorString.includes('action rejected') ||
      errorMessage?.includes('user denied') ||
      errorString.includes('user denied')
    ) {
      const rejectionError = new Error('USER_REJECTED') as Error & { isUserRejection: boolean };
      rejectionError.isUserRejection = true;
      throw rejectionError;
    } else if (
      errorMessage?.includes('contract') && (
        errorMessage?.includes('not deployed') ||
        errorString.includes('contract not deployed') ||
        errorMessage?.includes('invalid address') ||
        errorString.includes('invalid address')
      )
    ) {
      throw new Error('Invalid contract address. Please verify the token contract address is correct for this chain.');
    } else if (
      errorMessage?.includes('gas') ||
      errorString.includes('gas') ||
      errorMessage?.includes('out of gas') ||
      errorString.includes('out of gas')
    ) {
      throw new Error('Transaction failed due to gas issues. Please try again or increase gas limit in your wallet settings.');
    } else if (
      errorMessage?.includes('network') ||
      errorString.includes('network') ||
      errorCode === 'NETWORK_ERROR'
    ) {
      throw new Error('Network error. Check your connection and the selected chain. Make sure your wallet is on the correct chain.');
    } else if (errorCode === 500 || errorMessage?.includes('500')) {
      // Erro 500 genérico - pode ser RPC ou outro problema
      // Verificar se há mismatch de chain
      const expectedChainId = chainNameToId[originalChain.toLowerCase() === 'bnb' ? 'bsc' : originalChain.toLowerCase()];
      if (currentChainId !== undefined && expectedChainId && currentChainId !== expectedChainId) {
        const chainDisplayName = originalChain.toUpperCase() === 'BSC' || originalChain.toUpperCase() === 'BNB' 
          ? 'BSC/Binance Smart Chain' 
          : originalChain.charAt(0).toUpperCase() + originalChain.slice(1).toLowerCase();
        throw new Error(`Incorrect chain. Your wallet is on chain ID ${currentChainId}, but the transaction requires ${chainDisplayName} (chain ID ${expectedChainId}). Please switch to the correct chain in your wallet.`);
      }
      
      // Verificar se wallet está conectada
      if (currentChainId === undefined) {
        throw new Error('Wallet is not connected. Please connect your wallet and try again.');
      }
      
      // Usar chain original para personalizar mensagem
      const chainDisplayName = originalChain.toUpperCase() === 'BSC' || originalChain.toUpperCase() === 'BNB' 
        ? 'BSC/Binance Smart Chain' 
        : originalChain.charAt(0).toUpperCase() + originalChain.slice(1).toLowerCase();
      
      // Mensagem mais específica baseada no contexto
      throw new Error(`Transaction failed on ${chainDisplayName}. Please verify that: 1) Your wallet is connected, 2) You are on the correct chain (${chainDisplayName}), 3) You have sufficient balance. If the problem persists, try again in a few moments.`);
    }
    
    throw new Error(errorMessage || 'Error sending EVM transaction');
  }
}

export async function sendSolanaTransaction(
  token: string,
  to: string,
  amount: number,
  connection: Connection,
  publicKey: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  tokenMintAddress?: string
): Promise<string> {
  try {
    const tokenUpper = token.toUpperCase();
    const transaction = new Transaction();
    let activeConnection = connection;
    let activeEndpoint = getConnectionEndpoint(connection);
    let rpcRotation = buildRpcRotationList(activeEndpoint);

    if (tokenUpper === 'SOL' || token.toLowerCase() === 'sol') {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(to),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
    } else {
      const mintAddress = tokenMintAddress || SPL_TOKEN_MINTS[token.toLowerCase()];
      
      if (!mintAddress) {
        throw new Error(`Token ${token} is not supported. Supported tokens: SOL, USDC, USDT`);
      }

      const mintPublicKey = new PublicKey(mintAddress);
      const destinationPublicKey = new PublicKey(to);

      const sourceTokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const destinationTokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        destinationPublicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const decimals = 6;
      const amountInSmallestUnit = BigInt(Math.floor(amount * Math.pow(10, decimals)));
      
      let sourceAccountInfo;
      try {
        sourceAccountInfo = await Promise.race([
          getAccount(activeConnection, sourceTokenAccount, 'confirmed', TOKEN_PROGRAM_ID),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout verificando saldo')), 3000)
          )
        ]) as any;
      } catch (error: any) {
        const message = error?.message || '';
        
        if (isRpcError(error) || message.includes('Timeout')) {
          try {
            const fallbackEndpoint = rpcRotation.find(ep => ep !== activeEndpoint) || 'https://solana-rpc.publicnode.com';
            const fallbackConn = createSolanaConnection(fallbackEndpoint);
            sourceAccountInfo = await Promise.race([
              getAccount(fallbackConn, sourceTokenAccount, 'confirmed', TOKEN_PROGRAM_ID),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
              )
            ]) as any;
            activeConnection = fallbackConn;
            activeEndpoint = fallbackEndpoint;
            rpcRotation = buildRpcRotationList(activeEndpoint);
          } catch (fallbackError: unknown) {
            sourceAccountInfo = null;
          }
        } else if (message.includes('could not find account') || message.includes('Token account not found')) {
          throw new Error(`You don't have a ${tokenUpper} token account yet. Please receive ${tokenUpper} first to create the account.`);
        } else {
          sourceAccountInfo = null;
        }
      }
      
      if (sourceAccountInfo) {
        if (!sourceAccountInfo.mint.equals(mintPublicKey)) {
          throw new Error(`Token account does not match token ${tokenUpper}`);
        }
        
        if (sourceAccountInfo.amount < amountInSmallestUnit) {
          throw new Error('Insufficient balance in token account');
        }
      }

      let destinationAccountExists = false;
      try {
        await Promise.race([
          getAccount(activeConnection, destinationTokenAccount, 'confirmed', TOKEN_PROGRAM_ID),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 2000)
          )
        ]);
        destinationAccountExists = true;
      } catch (error: unknown) {
        if (isRpcError(error)) {
          try {
            const fallbackEndpoint = rpcRotation.find(ep => ep !== activeEndpoint) || 'https://solana-rpc.publicnode.com';
            const fallbackConn = createSolanaConnection(fallbackEndpoint);
            await Promise.race([
              getAccount(fallbackConn, destinationTokenAccount, 'confirmed', TOKEN_PROGRAM_ID),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 2000)
              )
            ]);
            destinationAccountExists = true;
            activeConnection = fallbackConn;
            activeEndpoint = fallbackEndpoint;
            rpcRotation = buildRpcRotationList(activeEndpoint);
          } catch {
            destinationAccountExists = false;
          }
        } else {
          destinationAccountExists = false;
        }
      }

      const TRANSFER_FEE_LAMPORTS = 5000;
      const CREATE_ACCOUNT_FEE_LAMPORTS = 2_000_000;
      const MIN_SOL_FOR_FEES = destinationAccountExists 
        ? TRANSFER_FEE_LAMPORTS 
        : TRANSFER_FEE_LAMPORTS + CREATE_ACCOUNT_FEE_LAMPORTS;
      
      try {
        let solBalance: number;
        try {
          solBalance = await Promise.race([
            activeConnection.getBalance(publicKey, 'confirmed'),
            new Promise<number>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 2000)
            )
          ]);
        } catch (error: unknown) {
          if (isRpcError(error)) {
            try {
              const fallbackEndpoint = rpcRotation.find(ep => ep !== activeEndpoint) || 'https://solana-rpc.publicnode.com';
              const fallbackConn = createSolanaConnection(fallbackEndpoint);
              solBalance = await Promise.race([
                fallbackConn.getBalance(publicKey, 'confirmed'),
                new Promise<number>((_, reject) => 
                  setTimeout(() => reject(new Error('Timeout')), 2000)
                )
              ]);
              activeConnection = fallbackConn;
              activeEndpoint = fallbackEndpoint;
              rpcRotation = buildRpcRotationList(activeEndpoint);
            } catch {
              solBalance = 0;
            }
          } else {
            throw error;
          }
        }
        
        const minLamports = MIN_SOL_FOR_FEES + 100_000;
        
        if (solBalance < minLamports) {
          const requiredSol = minLamports / LAMPORTS_PER_SOL;
          const currentSol = solBalance / LAMPORTS_PER_SOL;
          throw new Error(
            `Insufficient SOL balance. You need at least ${requiredSol.toFixed(6)} SOL for this transaction${!destinationAccountExists ? ' (including creation of recipient token account)' : ''}. Current balance: ${currentSol.toFixed(6)} SOL`
          );
        }
      } catch (error: any) {
        const message = error?.message || '';
        
        if (message.includes('Insufficient SOL balance')) {
          throw error;
        }
      }

      if (!destinationAccountExists) {
        const createAccountInstruction = createAssociatedTokenAccountInstruction(
          publicKey,
          destinationTokenAccount,
          destinationPublicKey,
          mintPublicKey,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        transaction.add(createAccountInstruction);
      }

      const transferInstruction = createTransferInstruction(
        sourceTokenAccount,
        destinationTokenAccount,
        publicKey,
        amountInSmallestUnit,
        [],
        TOKEN_PROGRAM_ID
      );

      transaction.add(transferInstruction);
    }

    let blockhash: string;
    let lastValidBlockHeight: number;
    let blockhashResult: { blockhash: string; lastValidBlockHeight: number } | null = null;

    for (const endpoint of rpcRotation) {
      const candidateConnection = endpoint === activeEndpoint 
        ? activeConnection 
        : createSolanaConnection(endpoint);

      try {
        const candidateResult = await Promise.race([
          candidateConnection.getLatestBlockhash('confirmed'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          )
        ]) as any;

        blockhashResult = candidateResult;
        activeConnection = candidateConnection;
        activeEndpoint = endpoint;
        rpcRotation = buildRpcRotationList(activeEndpoint);
        break;
      } catch (error: unknown) {
        if (!isRpcError(error)) {
          throw error;
        }
        // Tentar próximo endpoint
        continue;
      }
    }

    if (!blockhashResult) {
      throw new Error('Não foi possível obter blockhash. Por favor, tente novamente.');
    }

    blockhash = blockhashResult.blockhash;
    lastValidBlockHeight = blockhashResult.lastValidBlockHeight;
    
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;
    
    let signedTransaction: Transaction;
    try {
      signedTransaction = await signTransaction(transaction);
    } catch (error: any) {
      const errorMessage = error?.message || '';
      const errorString = errorMessage.toLowerCase();
      
      if (
        errorString.includes('user rejected') ||
        errorString.includes('user cancelled') ||
        errorString.includes('user denied') ||
        errorString.includes('declined') ||
        (errorString.includes('rejected') && errorString.includes('user')) ||
        error?.code === 4001 ||
        error?.code === 'ACTION_REJECTED'
      ) {
        const rejectionError = new Error('USER_REJECTED') as Error & { isUserRejection: boolean };
        rejectionError.isUserRejection = true;
        throw rejectionError;
      }
      
      if (
        errorString.includes('wallet not found') ||
        errorString.includes('wallet not connected') ||
        errorString.includes('no provider') ||
        errorString.includes('phantom')
      ) {
        throw new Error('Phantom wallet não encontrada. Por favor, instale a extensão Phantom e conecte sua wallet.');
      }
      
      throw error;
    }
    
    let signature: string | null = null;
    let lastSendError: unknown;

    for (const endpoint of rpcRotation) {
      const candidateConnection = endpoint === activeEndpoint 
        ? activeConnection 
        : createSolanaConnection(endpoint);

      // Se trocar de endpoint, atualizar blockhash para evitar invalidação
      if (endpoint !== activeEndpoint) {
        try {
          const refreshedBlockhash = await Promise.race([
            candidateConnection.getLatestBlockhash('confirmed'),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 3000)
            )
          ]) as any;

          transaction.recentBlockhash = refreshedBlockhash.blockhash;
          lastValidBlockHeight = refreshedBlockhash.lastValidBlockHeight;
        } catch (error: unknown) {
          if (!isRpcError(error)) {
            throw error;
          }
          lastSendError = error;
          continue;
        }
      }

      try {
        signature = await candidateConnection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: false,
          maxRetries: 3,
        });
        activeConnection = candidateConnection;
        activeEndpoint = endpoint;
        rpcRotation = buildRpcRotationList(activeEndpoint);
        break;
      } catch (error: unknown) {
        if (!isRpcError(error)) {
          throw error;
        }
        lastSendError = error;
        continue;
      }
    }

    if (!signature) {
      throw new Error('Erro ao enviar transação. Por favor, tente novamente.');
    }
    
    (async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        let status;
        try {
          status = await activeConnection.getSignatureStatus(signature);
        } catch {
          try {
            const fallbackEndpoint = rpcRotation.find(ep => ep !== activeEndpoint) || 'https://solana-rpc.publicnode.com';
            const fallbackConn = createSolanaConnection(fallbackEndpoint);
            status = await fallbackConn.getSignatureStatus(signature);
            activeConnection = fallbackConn;
            activeEndpoint = fallbackEndpoint;
            rpcRotation = buildRpcRotationList(activeEndpoint);
          } catch {
            return;
          }
        }
      } catch (err: any) {
        const errorMessage = err.message || '';
        if (errorMessage.includes('signatureSubscribe') || 
            errorMessage.includes('JSON-RPC error')) {
          return;
        }
      }
    })();

    return signature;
  } catch (err: any) {
    const errorMessage = err.message || '';
    const errorString = errorMessage.toLowerCase();
    
    if (
      errorString.includes('user rejected') ||
      errorString.includes('user cancelled') ||
      (errorString.includes('rejected') && errorString.includes('user'))
    ) {
      // Criar erro especial que pode ser identificado como rejeição do usuário
      const rejectionError = new Error('USER_REJECTED') as Error & { isUserRejection: boolean };
      rejectionError.isUserRejection = true;
      throw rejectionError;
    } else if (
      errorMessage?.includes('insufficient funds') || 
      errorMessage?.includes('Saldo insuficiente') ||
      errorMessage?.includes('insufficient balance') ||
      errorString.includes('insufficient') ||
      errorString.includes('revertida durante a simulação') ||
      errorString.includes('reverted during simulation')
    ) {
      if (errorMessage?.includes('Insufficient SOL balance')) {
        throw err;
      }
      throw new Error('Insufficient balance to complete the transaction. Make sure you have enough SOL to pay transaction fees (minimum 0.001 SOL recommended).');
    } else if (
      errorMessage?.includes('403') ||
      errorMessage?.includes('Access forbidden') ||
      errorMessage?.includes('429') ||
      errorMessage?.includes('Too Many Requests') ||
      errorMessage?.includes('RPC connection failed') ||
      errorMessage?.includes('network') ||
      errorMessage?.includes('timeout') ||
      errorMessage?.includes('ECONNREFUSED') ||
      errorMessage?.includes('ETIMEDOUT') ||
      errorMessage?.includes('Failed to fetch') ||
      errorMessage?.includes('NetworkError') ||
      errorMessage?.includes('fetch failed')
    ) {
      if (errorMessage?.includes('RPC connection failed')) {
        throw err;
      }
      throw new Error('Network error. Check your connection');
    }
    
    throw new Error(errorMessage || 'Error sending Solana transaction');
  }
}

export async function sendStellarTransaction(
  token: string,
  to: string,
  amount: number,
  walletAddress: string
): Promise<string> {
  try {
    const tokenUpper = token.toUpperCase();
    if (tokenUpper !== 'USDC') {
      throw new Error(`Token ${token} is not supported on Stellar. Only USDC is supported.`);
    }

    // 1. Carregar conta do remetente para obter o sequence number
    const sourceAccount = await stellarServer.loadAccount(walletAddress);

    // 2. Criar objeto Asset para USDC
    const usdcAsset = new Asset('USDC', STELLAR_USDC_ISSUER);

    // 3. Construir a transação
    const transaction = new StellarTransactionBuilder(sourceAccount, {
      fee: (await stellarServer.fetchBaseFee()).toString(),
      networkPassphrase: Networks.PUBLIC,
    })
      .addOperation(
        Operation.payment({
          destination: to,
          asset: usdcAsset,
          amount: amount.toString(),
        })
      )
      .setTimeout(300)
      .build();

    // 4. Assinar com Freighter
    const xdr = transaction.toXDR();
    const signedResult = await signFreighterTransaction(xdr, {
        networkPassphrase: Networks.PUBLIC
    });

    if (!signedResult || !signedResult.signedTxXdr) {
      throw new Error('Failed to sign transaction with Freighter');
    }

    // 5. Enviar para a rede
    const result = await stellarServer.submitTransaction(
      StellarTransactionBuilder.fromXDR(signedResult.signedTxXdr, Networks.PUBLIC)
    );

    return result.hash;
  } catch (error: any) {
    console.error('Error sending Stellar transaction:', error);
    
    // Check if it's a specific Stellar SDK horizon error
    const data = error?.response?.data;
    if (data && data.extras && data.extras.result_codes) {
      const resultCodes = data.extras.result_codes;
      const opCodes = resultCodes.operations || [];
      
      if (opCodes.includes('op_no_trust')) {
        throw new Error('The recipient wallet has not established a trustline for USDC. They need to add USDC trustline first.');
      }
      if (opCodes.includes('op_underfunded')) {
        throw new Error('Insufficient USDC balance to complete the transaction.');
      }
      if (opCodes.includes('op_line_full')) {
        throw new Error('Recipient wallet USDC trustline is full.');
      }
      if (resultCodes.transaction === 'tx_insufficient_balance') {
        throw new Error('Insufficient XLM balance for transaction fee.');
      }
      if (resultCodes.transaction === 'tx_bad_seq') {
        throw new Error('Transaction sequence is out of sync. Try again.');
      }
      
      // Generic fallback for horizon errors
      if (opCodes.length > 0) {
        throw new Error(`Transaction failed: ${opCodes.join(', ')}`);
      }
    }

    const errorMessage = error?.message || '';
    const errorString = errorMessage.toLowerCase();

    if (errorString.includes('user rejected') || error?.code === 4001) {
      const rejectionError = new Error('USER_REJECTED') as Error & { isUserRejection: boolean };
      rejectionError.isUserRejection = true;
      throw rejectionError;
    }

    if (errorString.includes('op_no_trust') || errorString.includes('trustline')) {
      throw new Error('Recipient has not established a trustline for USDC on Stellar.');
    }

    if (errorString.includes('op_underfunded')) {
      throw new Error('Insufficient USDC balance to complete the transaction.');
    }

    throw new Error(errorMessage || 'Error sending Stellar transaction');
  }
}

/**
 * Enviar transação SUI
 * Suporta: SUI (nativo) e tokens (USDC, USDT)
 * 
 * @param tokenContractAddress - Endereço do contrato do token (se fornecido, será usado em vez de buscar no SUI_TOKEN_ADDRESSES)
 * @param getCoins - Função para obter as moedas do remetente (necessária para tokens)
 * @param fromAddress - Endereço do remetente (necessário para obter moedas)
 * @param getBalance - Função para obter o saldo (aceita owner para SUI nativo ou owner + coinType para tokens)
 * @param getAllCoins - Função para obter todas as moedas com saldo (opcional, usada para validar saldo de tokens)
 */
export async function sendSuiTransaction(
  token: string,
  to: string,
  amount: number,
  signAndExecuteTransactionBlock: (transactionBlock: SuiTransaction) => Promise<{ digest: string }>,
  tokenContractAddress?: string,
  getCoins?: (params: { owner: string; coinType: string }) => Promise<{ data: Array<{ coinObjectId: string }> }>,
  fromAddress?: string,
  getBalance?: (params: { owner: string; coinType?: string }) => Promise<{ totalBalance: string }>,
  getAllCoins?: (params: { owner: string; coinType: string }) => Promise<{ data: Array<{ coinObjectId: string; balance: string }> }>
): Promise<string> {
  try {
    const tokenUpper = token.toUpperCase();
    const tx = new SuiTransaction();
    
    // Converter amount para a menor unidade (SUI usa 9 decimais, tokens geralmente 6)
    const decimals = tokenUpper === 'SUI' ? 9 : 6;
    const amountInSmallestUnit = Math.floor(amount * Math.pow(10, decimals));

    if (tokenUpper === 'SUI' || token.toLowerCase() === 'sui') {
      if (!fromAddress) {
        throw new Error('fromAddress is required for SUI native transfers');
      }

      if (getBalance) {
        try {
          const balanceResult = await getBalance({ owner: fromAddress });
          const totalBalance = BigInt(balanceResult.totalBalance);
          const gasBudget = BigInt(100_000_000); // Gas budget estimado
          const requiredAmount = BigInt(amountInSmallestUnit) + gasBudget;

          if (totalBalance < requiredAmount) {
            throw new Error(`Insufficient SUI balance. You need at least ${(Number(requiredAmount) / Math.pow(10, 9)).toFixed(9)} SUI (including gas fees), but you only have ${(Number(totalBalance) / Math.pow(10, 9)).toFixed(9)} SUI.`);
          }
        } catch (err: any) {
          if (err.message?.includes('Insufficient')) {
            throw err;
          }
          console.warn('Error checking SUI balance:', err);
        }
      }

      // Na nova API do Sui, valores podem ser passados diretamente para splitCoins
      const [coin] = tx.splitCoins(tx.gas, [amountInSmallestUnit]);
      if (coin) {
        // Endereços também são passados diretamente
        tx.transferObjects([coin], to);
      }
    } else {
      const tokenAddress = tokenContractAddress || SUI_TOKEN_ADDRESSES[token.toLowerCase()];
      
      if (!tokenAddress) {
        throw new Error(`Token ${token} is not supported. Supported tokens: SUI, USDC, USDT`);
      }

      // Para tokens, precisamos obter as moedas do remetente
      if (!getCoins || !fromAddress) {
        throw new Error('getCoins and fromAddress are required for token transfers');
      }

      const senderCoins = await getCoins({
        owner: fromAddress,
        coinType: tokenAddress,
      });

      if (senderCoins.data.length === 0) {
        throw new Error(`No ${tokenUpper} tokens found in sender wallet`);
      }

      let totalBalance = BigInt(0);
      
      if (getBalance) {
        try {
          const balanceResult = await getBalance({
            owner: fromAddress,
            coinType: tokenAddress,
          });
          totalBalance = BigInt(balanceResult.totalBalance);
        } catch (error) {
          if (getAllCoins) {
            try {
              const allCoins = await getAllCoins({
                owner: fromAddress,
                coinType: tokenAddress,
              });
              
              for (const coin of allCoins.data) {
                if (coin.balance) {
                  totalBalance += BigInt(coin.balance);
                }
              }
            } catch (allCoinsError) {
              console.warn('Error getting token balance:', allCoinsError);
            }
          } else {
            console.warn('Error getting token balance with getBalance:', error);
          }
        }
      } else if (getAllCoins) {
        try {
          const allCoins = await getAllCoins({
            owner: fromAddress,
            coinType: tokenAddress,
          });
          
          for (const coin of allCoins.data) {
            if (coin.balance) {
              totalBalance += BigInt(coin.balance);
            }
          }
        } catch (error) {
          console.warn('Error getting token balance with getAllCoins:', error);
        }
      }

      if (totalBalance > 0 && totalBalance < BigInt(amountInSmallestUnit)) {
        const availableAmount = Number(totalBalance) / Math.pow(10, decimals);
        const requiredAmount = amount;
        throw new Error(`Insufficient ${tokenUpper} balance. You need ${requiredAmount} ${tokenUpper}, but you only have ${availableAmount.toFixed(decimals === 6 ? 6 : 9)} ${tokenUpper}.`);
      }

      const coinToSplit = senderCoins.data[0];
      if (coinToSplit) {
        const [splitCoin] = tx.splitCoins(
          tx.object(coinToSplit.coinObjectId),
          [amountInSmallestUnit]
        );
        if (splitCoin) {
          // Endereços são passados diretamente
          tx.transferObjects([splitCoin], to);
        }
      }
    }

    // Definir gas budget
    tx.setGasBudget(100_000_000);

    // Assinar e executar a transação
    // Criar wrapper para garantir compatibilidade com diferentes wallets SUI
    // Algumas wallets (como Slush) podem esperar formatos diferentes
    let response: { digest: string };
    
    // Função wrapper que tenta diferentes formatos de chamada
    const executeTransaction = async (transactionBlock: SuiTransaction): Promise<{ digest: string }> => {
      // Verificar se a função existe
      if (!signAndExecuteTransactionBlock) {
        throw new Error('Wallet sign function is not available');
      }
      
      // Primeiro, tentar passar a transação diretamente
      try {
        return await signAndExecuteTransactionBlock(transactionBlock);
      } catch (err: any) {
        const errorMsg = err.message || '';
        const errorMsgLower = errorMsg.toLowerCase();
        
        // Se o erro é relacionado a serialize ou undefined, pode ser formato incompatível
        if (
          errorMsgLower.includes('serialize') ||
          errorMsgLower.includes('cannot read properties of undefined') ||
          errorMsgLower.includes('undefined') ||
          errorMsg.includes('serialize')
        ) {
          // Tentar passar como objeto { transactionBlock: ... }
          // Algumas wallets (como Slush) esperam este formato
          try {
            return await (signAndExecuteTransactionBlock as any)({ transactionBlock });
          } catch (nestedError: unknown) {
            // Se ainda falhar, verificar se há mais informações no erro
            const nestedMsg = err.message || '';
            if (nestedMsg.includes('serialize') || nestedMsg.includes('undefined')) {
              throw new Error(
                'Wallet connection error. Please ensure your wallet is properly connected and try again. If the problem persists, try disconnecting and reconnecting your wallet.'
              );
            }
            // Se ainda falhar, lançar erro mais descritivo
            throw new Error(
              err.message || errorMsg || 'Transaction failed. Please check your wallet connection and try again.'
            );
          }
        }
        
        // Para outros erros, relançar o erro original
        throw err;
      }
    };
    
    // Executar a transação usando o wrapper
    response = await executeTransaction(tx);

    if (!response.digest) {
      throw new Error('Transaction failed - no digest returned');
    }

    return response.digest;
  } catch (error: any) {
    console.error('Error sending SUI transaction:', error);
    
    const errorMessage = error?.message || '';
    const errorString = errorMessage.toLowerCase();
    
    // Verificar se o usuário rejeitou a transação
    if (
      errorString.includes('user rejected') ||
      errorString.includes('user cancelled') ||
      errorString.includes('rejected by user') ||
      (errorString.includes('rejected') && errorString.includes('user'))
    ) {
      // Criar erro especial que pode ser identificado como rejeição do usuário
      const rejectionError = new Error('USER_REJECTED') as Error & { isUserRejection: boolean };
      rejectionError.isUserRejection = true;
      throw rejectionError;
    } else if (
      errorMessage?.includes('insufficient funds') ||
      errorMessage?.includes('insufficient balance') ||
      errorString.includes('insufficient')
    ) {
      throw new Error('Insufficient balance to complete the transaction');
    } else if (
      errorMessage?.includes('network') ||
      errorString.includes('network') ||
      errorMessage?.includes('timeout')
    ) {
      throw new Error('Network error. Check your connection');
    } else if (
      errorMessage?.includes('serialize') ||
      errorString.includes('serialize') ||
      errorString.includes('cannot read properties of undefined')
    ) {
      throw new Error('Wallet connection error. Please ensure your wallet is properly connected and try again. If the problem persists, try disconnecting and reconnecting your wallet.');
    } else if (
      errorMessage?.includes('tx.pure must be called') ||
      errorString.includes('tx.pure') ||
      errorString.includes('bcs type name') ||
      errorString.includes('bcs value')
    ) {
      throw new Error('Transaction format error. Please try again. If the problem persists, refresh the page and reconnect your wallet.');
    }
    
    throw new Error(errorMessage || 'Error sending SUI transaction');
  }
}

// ─── Stellar Escrow — sign XDR with Freighter and return signed XDR ────────────

const STELLAR_ESCROW_NETWORK =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet'
    ? Networks.PUBLIC
    : Networks.TESTNET;

export async function signEscrowXDR(xdr: string): Promise<string> {
  try {
    const signedResult = await signFreighterTransaction(xdr, {
      networkPassphrase: STELLAR_ESCROW_NETWORK,
    });

    if (!signedResult?.signedTxXdr) {
      throw new Error('Freighter did not return a signed XDR');
    }

    return signedResult.signedTxXdr;
  } catch (err: any) {
    const msg: string = (err?.message ?? String(err)).toLowerCase();
    const isRejection =
      msg.includes('declined') ||
      msg.includes('rejected') ||
      msg.includes('cancelled') ||
      msg.includes('cancel') ||
      msg === 'user_rejected';
    if (isRejection) throw new Error('USER_REJECTED');
    throw err;
  }
}
