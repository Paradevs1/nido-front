"use client";

export default function HostPlansSection() {
  return (
    <div className="pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Choose your plan
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plan 1 - Do it yourself */}
          <a href="/host/create" className="bg-[var(--color-card)] rounded-3xl p-8 relative block">
            <div className="blur-sm">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                Do it yourself
                <span className="text-[var(--color-primary)]">&gt;</span>
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Define your goal, campaign time and value yourself without friction
              </p>
            </div>
            <div className="absolute inset-0 flex items-center justify-start pl-8">
              <span className="text-white text-xl font-bold">Soon</span>
            </div>
          </a>

          {/* Plan 2 - Get a quote */}
          <div className="bg-[var(--color-card)] rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              Get a quote
              <span className="text-[var(--color-primary)]">&gt;</span>
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              Talk to our specialists to have a better worked campaign with a much higher upside of results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
