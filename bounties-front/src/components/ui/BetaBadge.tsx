"use client";

import React from 'react';

interface BetaBadgeProps {
  className?: string;
}

const BetaBadge: React.FC<BetaBadgeProps> = ({ className = "" }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full font-semibold text-white overflow-hidden
        px-2 py-1 text-[10px] 
        sm:px-3 sm:py-1.5 sm:text-xs
        md:px-4 md:py-1.5 md:text-xs
        lg:px-5 lg:py-2 lg:text-sm
        ${className}`}
      style={{
        background: '#2A4A5F',
        border: '0.1px solid #FFFFFF',
        cursor: 'default',
        boxShadow: `
          0 0 8px rgba(255, 255, 255, 0.3),
          0 0 16px rgba(255, 255, 255, 0.2),
          0 0 24px rgba(255, 255, 255, 0.1),
          0 0 4px rgba(255, 88, 0, 0.2)
        `,
      }}
    >
      {/* Texto */}
      <span className="relative z-10">BETA</span>
    </div>
  );
};

export default BetaBadge;

