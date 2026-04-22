"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaDiscord,
  FaInstagram,
  FaTelegram,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";
import {
  BRAND,
  BRAND_DISPLAY_NAME,
  BRAND_LOGO_ALT,
  BRAND_LOGO_MARK_SRC,
} from "@/lib/branding/links";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-accent)]">
      <div className="container mx-auto">
        <div className="flex flex-col items-center pt-8 pb-2 gap-3 md:gap-3.5">
          <Image
            src={BRAND_LOGO_MARK_SRC}
            alt={BRAND_LOGO_ALT}
            width={96}
            height={96}
            className="block object-contain h-14 w-14 sm:h-16 sm:w-16 md:h-[4.25rem] md:w-[4.25rem]"
          />

        <div className="social-links flex justify-center pt-0 pb-4 gap-8 max-md:grid max-md:grid-cols-2 max-md:gap-6 max-md:px-8">
          <Link
            href={BRAND.social.x}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 hover:text-gray-300 transition-colors max-md:justify-center"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-white/50 text-sm group-hover:text-white transition-colors duration-300">
              X (Twitter)
            </span>
          </Link>

          <Link
            href={BRAND.social.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 hover:text-gray-300 transition-colors max-md:justify-center"
          >
            <FaDiscord className="w-5 h-5 text-white" />
            <span className="text-white/50 text-sm group-hover:text-white transition-colors duration-300">
              Discord
            </span>
          </Link>

          <Link
            href={BRAND.social.telegramSupport}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 hover:text-gray-300 transition-colors max-md:justify-center"
          >
            <FaTelegram className="w-5 h-5 text-white" />
            <span className="text-white/50 text-sm group-hover:text-white transition-colors duration-300">
              Telegram
            </span>
          </Link>
        </div>
        </div>

        <div className="bottom-bar flex flex-col items-center gap-4 py-4 px-4">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-300 flex-wrap">
            <Link
              href="/docs"
              className="hover:text-[var(--color-primary)] transition-colors"
            >
              Docs
            </Link>
            <span>•</span>
            <Link
              href="/terms"
              className="hover:text-[var(--color-primary)] transition-colors"
            >
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link
              href="/privacy"
              className="hover:text-[var(--color-primary)] transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
          <div className="flex justify-between items-center w-full max-md:flex-col max-md:gap-4">
            <span className="copyright-span text-base text-gray-300 max-md:text-center">
              ©2025 {BRAND_DISPLAY_NAME}. All rights reserved
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
