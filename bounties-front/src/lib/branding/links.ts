/** Domínio público do produto */
export const BRAND_SITE_URL = "https://nido.global";

/** Host público (texto em políticas / termos, sem protocolo). */
export const BRAND_SITE_HOST = new URL(BRAND_SITE_URL).host;

/** Nome exibido em SEO / metadados (não altera paths de assets). */
export const BRAND_DISPLAY_NAME = "Nido";

/**
 * Email de contato (termos, privacidade, LGPD).
 * Opcional: `NEXT_PUBLIC_CONTACT_EMAIL` no `.env`.
 */
export const BRAND_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "nidocontact@proton.me";

export const BRAND_CONTACT_MAILTO = `mailto:${BRAND_CONTACT_EMAIL}`;

/** Texto de acessibilidade padrão para o logo na navbar/footer. */
export const BRAND_LOGO_ALT = `${BRAND_DISPLAY_NAME} logo`;

/** Logotipo horizontal (símbolo + wordmark em um único SVG). */
export const BRAND_LOGO_HORIZONTAL_SRC = "/assets/nido/Logo/logoHorizontal.svg";

/** Ícone / marca só símbolo (sem wordmark na imagem). */
export const BRAND_LOGO_MARK_SRC = "/assets/nido/Logo/logo.svg";

/**
 * Handle do Twitter/X para a meta `twitter:creator` (com @).
 * Defina `NEXT_PUBLIC_TWITTER_CREATOR` no `.env` quando a conta oficial mudar.
 */
export const BRAND_TWITTER_CREATOR =
  process.env.NEXT_PUBLIC_TWITTER_CREATOR?.trim() || "@nidodotglobal";

export const BRAND = {
  site: {
    url: BRAND_SITE_URL,
  },
  social: {
    x: "https://x.com/nidodotglobal",
    instagram: "https://www.instagram.com/nidoinbrasil",
    discord: "https://discord.com/invite/parabuilders",
    telegramSupport: "http://t.me/nidodotglobal",
  },
} as const;

/** Textos usados em `src/app/layout.tsx` (SEO / Open Graph / Twitter). */
export const BRAND_SEO = {
  defaultTitle: BRAND_DISPLAY_NAME,
  titleTemplate: `%s | ${BRAND_DISPLAY_NAME}`,
  description:
    "Nido is a web3-native campaign hub where companies launch marketing challenges, reward top creators, and manage payments in one place.",
  keywords: [
    "nido",
    "web3",
    "growth campaigns",
    "creator economy",
    "on-chain rewards",
    "marketing activations",
    "nido",
    "blockchain",
    "crypto campaigns",
    "creator rewards",
    "bounties.work",
    "bounties",
  ] as const,
  openGraph: {
    siteName: BRAND_DISPLAY_NAME,
    title: `${BRAND_DISPLAY_NAME} - Web3 Campaign Hub`,
    description:
      "Launch and manage reward campaigns that connect brands with the best web3 creators. A web3-native platform for growth campaigns, creator economy, and on-chain rewards.",
    imageAlt: `${BRAND_DISPLAY_NAME} - Web3 Campaign Hub`,
  },
  twitter: {
    title: `${BRAND_DISPLAY_NAME} - Web3 Campaign Hub`,
    description:
      "Launch and manage reward campaigns that connect brands with the best web3 creators.",
  },
  /** Metadados `authors` / `creator` / `publisher` do Next. */
  authorsName: BRAND_DISPLAY_NAME,
  category: "Web3, Marketing, Creator Economy",
} as const;
