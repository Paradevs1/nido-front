/** Mesmas opções do CreatorOnboardingModal — fonte única para onboarding (filtros admin = só dados da API). */

export const CREATOR_AVERAGE_VIEWS_OPTIONS = [
  { value: "< 1k", label: "< 1k views" },
  { value: "1k – 5k", label: "1K - 5K views" },
  { value: "5k – 20k", label: "5K - 20K views" },
  { value: "20k – 100k", label: "20K - 100K views" },
  { value: "100k+", label: "100K+ views" },
] as const;

export const CREATOR_CATEGORY_OPTIONS = [
  { value: "technology", label: "Technology" },
  { value: "gaming", label: "Gaming" },
  { value: "travel", label: "Travel" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "business", label: "Business" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "crypto_blockchain", label: "Crypto & Blockchain" },
  { value: "defi", label: "DeFi" },
  { value: "nfts", label: "NFTs" },
  { value: "web3", label: "Web3" },
  { value: "trading", label: "Trading" },
] as const;

export const CREATOR_CONTENT_FORMAT_OPTIONS = [
  { value: "viral_posts", label: "Viral posts" },
  { value: "threads", label: "Threads" },
  { value: "videos", label: "Videos" },
  { value: "memes", label: "Memes" },
  { value: "long_form", label: "Long form" },
  { value: "tutorials", label: "Tutorials" },
  { value: "spaces_podcasts", label: "Spaces / Podcasts" },
  { value: "articles", label: "Articles" },
  { value: "in_person_activities", label: "In-person activities" },
] as const;

export const CREATOR_AUDIENCE_REGIONS = [
  "Global",
  "United States",
  "Europe",
  "Asia",
  "Latin America",
  "Africa",
  "Brasil",
  "Argentina",
  "Vietnam",
] as const;

export const CREATOR_MAIN_CHAINS = [
  "Base",
  "Arbitrum",
  "Ethereum",
  "Berachain",
  "Bsc",
  "Hyperevm",
  "Polygon",
  "Solana",
  "Sui",
  "Avalanche",
  "Other",
] as const;

export const CREATOR_CRYPTO_EXPERIENCE_OPTIONS = [
  { value: "No Experience", label: "No Experience" },
  { value: "< 1 year", label: "< 1 year" },
  { value: "1-3 years", label: "1-3 years" },
  { value: "3-5 years", label: "3-5 years" },
  { value: "5+ years", label: "5+ years" },
] as const;

export const CREATOR_TRADING_EXPERIENCE_OPTIONS = [
  { value: "No Experience", label: "No Experience" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Professional", label: "Professional" },
] as const;
