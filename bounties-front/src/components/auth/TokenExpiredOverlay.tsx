'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

/**
 * Overlay that appears when JWT token expires
 * Follows the same visual pattern as LoginModal
 */
export default function TokenExpiredOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();

  useEffect(() => {
    const handleTokenExpired = () => {
      setIsVisible(true);

      // 3 seconds countdown
      let count = 3;
      const interval = setInterval(() => {
        count--;
        setCountdown(count);
        
        if (count <= 0) {
          clearInterval(interval);
        }
      }, 1000);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/');
        // Fallback: force redirect if router doesn't work
        setTimeout(() => {
          window.location.replace('/');
        }, 500);
      }, 3000);
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, [router]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Background Blur - Same style as LoginModal */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card - Same style as LoginModal cards */}
        <div className="bg-[var(--color-card)] rounded-3xl p-8 md:p-10 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[var(--color-primary)]/20 border-2 border-[var(--color-primary)]/30">
              <svg 
                className="w-10 h-10 text-[var(--color-primary)]"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Session Expired
          </h2>

          {/* Message */}
          <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
            Your session has expired for security reasons.
            <br />
            You will be redirected to log in again.
          </p>

          {/* Spinner and Countdown */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Spinner */}
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full animate-spin border-3 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]" />
            </div>

            {/* Countdown */}
            <span className="text-lg font-semibold text-[var(--color-primary)]">
              Redirecting in {countdown}s
            </span>
          </div>

          {/* Button - Same pattern as NavbarGuest */}
          <Button
            onClick={() => window.location.replace('/')}
            className="w-full px-5 py-2 text-sm font-bold cursor-pointer"
          >
            Go to Home Now
          </Button>
        </div>
      </div>
    </div>
  );
}

