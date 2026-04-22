"use client";

import { useState, useEffect } from "react";
import { FiX, FiExternalLink } from "react-icons/fi";
import { creatorApi, TransactionCreatorResponse } from "@/lib/api/creator";

interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getSignatureUrl = (
  transaction: TransactionCreatorResponse
): string | null => {
  if (!transaction.signature || !transaction.payment_chain) return null;

  const chainMap: Record<string, string> = {
    arbitrum: "https://arbiscan.io/tx/",
    base: "https://basescan.org/tx/",
    ethereum: "https://etherscan.io/tx/",
    berachain: "https://berascan.com/tx/",
    bsc: "https://bscscan.com/tx/",
    hyperevm: "https://hyperevmscan.io/tx/",
    polygon: "https://polygonscan.com/tx/",
    solana: "https://solscan.io/tx/",
    sui: "https://suiscan.xyz/mainnet/tx/",
  };

  const baseUrl = chainMap[transaction.payment_chain.toLowerCase()];
  return baseUrl ? `${baseUrl}${transaction.signature}` : null;
};

export default function TransactionsModal({
  isOpen,
  onClose,
}: TransactionsModalProps) {
  const [transactions, setTransactions] = useState<
    TransactionCreatorResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await creatorApi.viewTransactionsCreator();
      const transactionsArray = Array.isArray(data)
        ? data
        : data?.transactions && Array.isArray(data.transactions)
        ? data.transactions
        : [];
      setTransactions(transactionsArray);
    } catch (err: unknown) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Failed to load transactions");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative z-10 bg-[var(--color-card)] rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto mx-4 my-8">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--color-card)] border-b border-white/10 p-6 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Transactions</h2>
            <p className="text-gray-300 text-sm">
              View all your payment transactions
            </p>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="text-gray-400 hover:text-white cursor-pointer transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left py-5 px-6 text-gray-400 font-medium whitespace-nowrap uppercase">
                    Campaign
                  </th>
                  <th className="text-left py-5 px-6 text-gray-400 font-medium whitespace-nowrap uppercase">
                    Chain
                  </th>
                  <th className="text-left py-5 px-6 text-gray-400 font-medium whitespace-nowrap uppercase">
                    Amount
                  </th>
                  <th className="text-left py-5 px-6 text-gray-400 font-medium whitespace-nowrap uppercase">
                    Signature
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr key="loading">
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      Loading transactions...
                    </td>
                  </tr>
                ) : error ? (
                  <tr key="error">
                    <td colSpan={4} className="text-center py-8 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : !Array.isArray(transactions) ||
                  transactions.length === 0 ? (
                  <tr key="empty">
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction, index) => {
                    const signatureUrl = getSignatureUrl(transaction);
                    return (
                      <tr
                        key={index}
                        className={`${
                          index % 2 === 0 ? "bg-white/5" : "bg-transparent"
                        } border-b border-white/5 hover:bg-white/10 transition-colors`}
                      >
                        <td className="py-4 px-6 text-white font-medium">
                          {transaction.name_campaign}
                        </td>
                        <td className="py-4 px-6 text-gray-300 capitalize">
                          {transaction.payment_chain}
                        </td>
                        <td className="py-4 px-6 text-green-400 font-medium">
                          {transaction.amount !== undefined &&
                          transaction.amount !== null
                            ? `$${transaction.amount}`
                            : "N/A"}
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {signatureUrl ? (
                            <a
                              href={signatureUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-300 hover:text-white hover:underline flex items-center gap-2 transition-colors"
                            >
                              <FiExternalLink />
                              View in Explorer
                            </a>
                          ) : (
                            <span className="text-gray-500 font-mono">
                              {transaction.signature?.slice(0, 20)}...
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
