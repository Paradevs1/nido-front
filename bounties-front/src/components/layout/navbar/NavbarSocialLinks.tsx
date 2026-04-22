"use client";

import Link from "next/link";
import { FaDiscord, FaTelegram } from "react-icons/fa";
import { BRAND } from "@/lib/branding/links";

const SOCIAL_LINKS = [
  {
    href: BRAND.social.x,
    label: "X (Twitter)",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: BRAND.social.discord,
    label: "Discord",
    icon: <FaDiscord className="w-5 h-5" />,
  },
  {
    href: BRAND.social.telegramSupport,
    label: "Telegram",
    icon: <FaTelegram className="w-5 h-5" />,
  },
] as const;

interface NavbarSocialLinksProps {
  className?: string;
  iconClassName?: string;
}

export default function NavbarSocialLinks({
  className = "",
  iconClassName = "text-white hover:text-[var(--color-primary)] transition-colors duration-300",
}: NavbarSocialLinksProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {SOCIAL_LINKS.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={iconClassName}
          aria-label={label}
        >
          {icon}
        </Link>
      ))}
    </div>
  );
}
