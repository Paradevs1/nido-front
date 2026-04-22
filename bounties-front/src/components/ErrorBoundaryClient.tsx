'use client';

import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center"
    >
      <div className="text-4xl">⚠</div>
      <h2 className="text-xl font-semibold text-white">
        Something went wrong
      </h2>
      <p className="text-sm text-gray-400 max-w-md">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 px-6 py-2 rounded-lg bg-[#ff5800] text-white font-medium hover:bg-[#e04f00] transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

export default function ErrorBoundaryClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
  );
}
