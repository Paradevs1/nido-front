"use client";

export function PlansPageSkeleton() {
  return (
    <div className="min-h-screen w-full" style={{ background: "var(--color-background)" }}>
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,87,1,0.06), transparent 60%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-32 pb-28">
        <header className="mb-20 text-center">
          <div className="mx-auto h-10 w-72 animate-pulse rounded-lg bg-white/10" />
          <div className="mx-auto mt-4 h-4 max-w-md animate-pulse rounded bg-white/5" />
        </header>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
            <div className="h-5 w-16 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-10 w-20 animate-pulse rounded bg-white/10" />
            <div className="mt-8 h-px bg-white/10" />
            <div className="mt-6 space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-white/5" />
              ))}
            </div>
            <div className="mt-10 h-12 animate-pulse rounded-xl bg-white/5" />
          </div>
          <div className="rounded-2xl border-2 border-[var(--color-primary)]/20 bg-white/[0.02] p-8">
            <div className="h-5 w-14 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-10 w-16 animate-pulse rounded bg-white/10" />
            <div className="mt-8 h-px bg-white/10" />
            <div className="mt-6 space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-white/5" />
              ))}
            </div>
            <div className="mt-10 h-12 animate-pulse rounded-xl bg-white/5" />
          </div>
        </div>
        <div className="mt-16 flex justify-center">
          <div className="h-3 w-48 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}
