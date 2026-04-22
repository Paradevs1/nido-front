import { ButtonHTMLAttributes } from "react";

interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: 'default' | 'white' | 'outline';
}

export default function BaseButton({ children, className = "", variant = 'default', ...props }: BaseButtonProps) {
  const baseStyles = variant === 'white' 
    ? 'text-black bg-white border-white shadow-white/50'
    : variant === 'outline'
    ? 'text-gray-300 bg-transparent border-2 border-gray-600 hover:border-gray-400 hover:text-white hover:bg-white/5'
    : 'text-[var(--color-button-text)] bg-[var(--color-button-bg)] border border-[var(--color-button-border)] shadow-[0_4px_0_0_var(--color-button-shadow)]';

  return (
    <button
      {...props}
      className={`${baseStyles} 
        rounded-full transition-all 
        disabled:cursor-not-allowed disabled:opacity-50 
        active:translate-y-[2px]
        ${className}`}
    >
      {children}
    </button>
  );
}
