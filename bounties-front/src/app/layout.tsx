import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/contexts/UserContext";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { PrivyProvider } from "@/components/providers/PrivyProvider";
import PrivyAuthMonitor from "@/components/auth/PrivyAuthMonitor";
import CreatorOnboardingMonitor from "@/components/auth/CreatorOnboardingMonitor";
import { WalletProviders } from "@/components/providers/WalletProviders";
//import TokenExpiredOverlay from "@/components/auth/TokenExpiredOverlay";
import Script from "next/script";
import ErrorBoundaryClient from "@/components/ErrorBoundaryClient";
import {
  BRAND_SITE_URL,
  BRAND_SEO,
  BRAND_TWITTER_CREATOR,
  BRAND_LOGO_MARK_SRC,
} from "@/lib/branding/links";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND_SITE_URL),
  title: {
    default: BRAND_SEO.defaultTitle,
    template: BRAND_SEO.titleTemplate,
  },
  description: BRAND_SEO.description,
  keywords: [...BRAND_SEO.keywords],
  authors: [{ name: BRAND_SEO.authorsName }],
  creator: BRAND_SEO.authorsName,
  publisher: BRAND_SEO.authorsName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: BRAND_LOGO_MARK_SRC,
    shortcut: BRAND_LOGO_MARK_SRC,
    apple: BRAND_LOGO_MARK_SRC,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BRAND_SITE_URL,
    siteName: BRAND_SEO.openGraph.siteName,
    title: BRAND_SEO.openGraph.title,
    description: BRAND_SEO.openGraph.description,
    images: [
      {
        url: `${BRAND_SITE_URL}/assets/bounties-framer-illustration.png`,
        width: 1200,
        height: 630,
        alt: BRAND_SEO.openGraph.imageAlt,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_SEO.twitter.title,
    description: BRAND_SEO.twitter.description,
    images: [`${BRAND_SITE_URL}/assets/bounties-framer-illustration.png`],
    creator: BRAND_TWITTER_CREATOR,
  },
  alternates: {
    canonical: BRAND_SITE_URL,
  },
  category: BRAND_SEO.category,
  other: {
    "talentapp:project_verification":
      "2beb6e65c51422834527f2bfbc9bf39cc82fb15f0d8373f102fbfc34179340cd81fa1a5c07fd17fdcc62d140bd9ea9d8db472d0598dcb87ccbad752f96a5849b",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={inter.variable} lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta property="og:image" content={`${BRAND_SITE_URL}/assets/bounties-framer-illustration.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:image" content={`${BRAND_SITE_URL}/assets/bounties-framer-illustration.png`} />
      </head>
      <body className="font-sans antialiased text-white overflow-x-hidden min-h-screen">
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
            </Script>
          </>
        )}

        <div className="min-h-screen">
          <WalletProviders>
            <AuthProvider>
              <UserProvider>
                <PrivyProvider>
                  <PrivyAuthMonitor />
                  <CreatorOnboardingMonitor />
                  {/* <TokenExpiredOverlay /> */}
                  <ErrorBoundaryClient>
                    {children}
                  </ErrorBoundaryClient>
                </PrivyProvider>
              </UserProvider>
            </AuthProvider>
          </WalletProviders>
        </div>
      </body>
    </html>
  );
}
