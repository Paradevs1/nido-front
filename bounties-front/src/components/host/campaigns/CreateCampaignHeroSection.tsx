"use client";

const steps = [
  { id: "task", label: "Task", icon: "/assets/host/campaign/taskIcon.svg" },
  { id: "details", label: "Details", icon: "/assets/host/campaign/detailsIcon.svg" },
  { id: "rewards", label: "Rewards", icon: "/assets/host/campaign/rewardIcon.svg" }
];

interface CreateCampaignHeroSectionProps {
  currentStep: string;
  isEditing?: boolean;
}

export default function CreateCampaignHeroSection({ currentStep, isEditing = false }: CreateCampaignHeroSectionProps) {

  return (
    <div className="pt-32 pb-8">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="text-[var(--color-primary)] text-lg font-semibold mb-4">
          {isEditing ? "Edit Mode" : "Start here"}
        </div>

        <h1 className="text-2xl lg:text-4xl font-bold text-white mb-6 leading-tight">
          {isEditing ? "EDIT YOUR CAMPAIGN" : "CREATE YOUR CAMPAIGN"}
        </h1>

        <p className="text-white/50 text-lg mb-12 max-w-2xl mx-auto">
          {isEditing 
            ? "Update your campaign information below."
            : "Fill in the information correctly so you don't need to edit it later."
          }
        </p>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-6 max-[380px]:gap-1 mb-12">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

            return (
              <div key={step.id} className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full transition-all text-xs sm:text-sm lg:text-base ${
                    isActive
                      ? "bg-[#FF58001A] text-[var(--color-primary)]"
                      : isCompleted
                      ? "bg-transparent text-white"
                      : "bg-transparent text-white/70"
                  }`}
                >
                  <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full">
                    <span
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                      style={{
                        WebkitMaskImage: `url(${step.icon})`,
                        maskImage: `url(${step.icon})`,
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        maskPosition: "center",
                        WebkitMaskSize: "contain",
                        maskSize: "contain",
                        backgroundColor: isActive
                          ? "var(--color-primary)"
                          : isCompleted
                          ? "rgba(255,255,255,0.85)"
                          : "rgba(255,255,255,0.55)",
                      }}
                    />
                  </span>
                  <span className="font-medium whitespace-nowrap">{step.label}</span>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block text-gray-400">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
