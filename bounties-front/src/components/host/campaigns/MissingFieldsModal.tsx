'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

interface MissingField {
  label: string;
  fieldId?: string;
}

interface MissingFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingFields: MissingField[];
  onGoToField: (fieldId?: string) => void;
}

export default function MissingFieldsModal({
  isOpen,
  onClose,
  missingFields,
  onGoToField,
}: MissingFieldsModalProps) {
  // Fechar com tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Background Blur - Same pattern as other modals */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Card */}
        <div className="bg-[var(--color-card)] rounded-3xl p-8 md:p-10">
          {/* Close Button */}
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500/20 border-2 border-red-500/30">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 text-center">
            Required Fields Missing
          </h2>

          {/* Description */}
          <p className="text-gray-300 text-base text-center mb-6">
            Please fill in the following fields to continue:
          </p>

          {/* Missing Fields List */}
          <div className="bg-black/20 rounded-2xl p-6 mb-6 max-h-[300px] overflow-y-auto">
            <ul className="space-y-3">
              {missingFields.map((field, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-white/90 group cursor-pointer hover:text-[var(--color-primary)] transition-colors"
                  onClick={() => {
                    onGoToField(field.fieldId);
                    onClose();
                  }}
                >
                  {/* Bullet Point */}
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 mt-2 group-hover:bg-[var(--color-primary)]" />
                  
                  {/* Field Label */}
                  <span className="flex-1 text-sm md:text-base">
                    {field.label}
                  </span>

                  {/* Arrow Icon */}
                  <svg
                    className="w-5 h-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              aria-label="Close"
              onClick={onClose}
              className="flex-1 px-5 py-3 border border-white/20 text-white rounded-full font-medium hover:bg-white/5 transition-all text-sm"
            >
              Close
            </button>
            <Button
              onClick={() => {
                const firstField = missingFields[0];
                if (firstField) {
                  onGoToField(firstField.fieldId);
                  onClose();
                }
              }}
              className="flex-1 px-5 py-3 text-sm font-bold cursor-pointer"
            >
              Go to First Field
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

