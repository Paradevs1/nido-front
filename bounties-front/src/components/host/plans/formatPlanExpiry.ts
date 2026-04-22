/**
 * Formata a data de expiração do plano para exibição (ex.: "Valid until May 17, 2026" ou "45 days left").
 */
export function formatPlanExpiry(expiresAt: string | null): { label: string; sublabel?: string } {
  if (!expiresAt) return { label: "—" };

  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return { label: "—" };

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (diffDays === 0) return { label: "Expires today", sublabel: formattedDate };
  if (diffDays === 1) return { label: "1 day left", sublabel: `Valid until ${formattedDate}` };
  if (diffDays <= 31) return { label: `${diffDays} days left`, sublabel: `Valid until ${formattedDate}` };
  return { label: `Valid until ${formattedDate}`, sublabel: `${diffDays} days left` };
}
