import type { Metadata } from "next";
import { BRAND_SITE_URL } from "@/lib/branding/links";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: BRAND_SITE_URL,
  },
};

export default function RedirectToNidoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

