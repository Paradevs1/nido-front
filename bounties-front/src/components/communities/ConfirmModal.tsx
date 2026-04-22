"use client";

import BaseButton from "@/components/ui/Button";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive,
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-[var(--color-card)] rounded-xl p-5 sm:p-6 max-w-[90vw] sm:max-w-md w-full border border-white/10 shadow-2xl">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <p className="text-white/60 text-sm mt-2">{message}</p>
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="cursor-pointer px-4 py-2.5 sm:py-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            {cancelLabel}
          </button>
          {isDestructive ? (
            <button
              onClick={onConfirm}
              disabled={loading}
              className="cursor-pointer px-4 py-2.5 sm:py-2 text-sm rounded-full font-semibold transition-colors disabled:opacity-50 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "..." : confirmLabel}
            </button>
          ) : (
            <BaseButton
              onClick={onConfirm}
              disabled={loading}
              className="cursor-pointer px-5 py-2.5 sm:py-2 text-sm font-semibold rounded-full hover:opacity-95 disabled:opacity-50"
            >
              {loading ? "..." : confirmLabel}
            </BaseButton>
          )}
        </div>
      </div>
    </div>
  );
}
