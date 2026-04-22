"use client";

import Image from "next/image";

interface Step {
  icon: string;
  title: string;
  description: string;
}

const GUEST_STEPS: Step[] = [
  {
    icon: "/assets/home/howItWorks/forms.svg",
    title: "Become a Host",
    description: "Register and complete your Creator profile.",
  },
  {
    icon: "/assets/home/howItWorks/mouse.svg",
    title: "Choose a Campaign",
    description: "Find opportunities aligned with your style and niche.",
  },
  {
    icon: "/assets/home/howItWorks/certified.svg",
    title: "Create Quality Content",
    description: "Produce, publish and engage your community.",
  },
  {
    icon: "/assets/home/howItWorks/money.svg",
    title: "Receive your Reward",
    description: "Earn tokens, prizes or exclusive benefits.",
  },
];

/** Creator: perfil → campanha → entrega → pagamento (textos curtos, tom leve). */
const CREATOR_STEPS: Step[] = [
  {
    icon: "/assets/home/howItWorks/forms.svg",
    title: "Spruce up your profile",
    description:
      "Socials, languages, niche—helps hosts say yes and match you to the right brief.",
  },
  {
    icon: "/assets/home/howItWorks/mouse.svg",
    title: "Pick a campaign",
    description:
      "Skim the ask and the reward. Join a community only if that campaign says you need to.",
  },
  {
    icon: "/assets/home/howItWorks/certified.svg",
    title: "Hit the deadline",
    description:
      "Follow the brief, post where it asks, then upload proof on the campaign page.",
  },
  {
    icon: "/assets/home/howItWorks/money.svg",
    title: "Cash out",
    description:
      "Host reviews entries. If you win, you get paid per the rules—usually in USDC.",
  },
];

export type HowItWorksVariant = "guest" | "creator";

interface HowItWorksProps {
  /** `guest` = home pública; `creator` = dashboard / lista de campanhas do creator. */
  variant?: HowItWorksVariant;
}

export default function HowItWorks({ variant = "guest" }: HowItWorksProps) {
  const steps = variant === "creator" ? CREATOR_STEPS : GUEST_STEPS;

  return (
    <div className="bg-[var(--color-card)] rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white">HOW IT WORKS</h3>
        {variant === "creator" && (
          <p className="text-sm text-white/55 mt-1.5 leading-snug">
            Four quick beats: profile → pick → deliver → get paid.
          </p>
        )}
      </div>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8">
              <Image
                src={step.icon}
                alt={`${step.title} icon`}
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white text-sm mb-1">{step.title}</h4>
              <p className="text-gray-300 text-xs leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
