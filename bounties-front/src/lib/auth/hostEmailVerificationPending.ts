const STORAGE_KEY = "bounties_host_email_verification_pending";

type PendingPayload = {
  email: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function setHostEmailVerificationPending(email: string): void {
  if (typeof window === "undefined") return;
  const payload: PendingPayload = { email: normalizeEmail(email) };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function getHostEmailVerificationPending(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPayload;
    if (parsed?.email && typeof parsed.email === "string") {
      return normalizeEmail(parsed.email);
    }
    return null;
  } catch {
    return null;
  }
}

export function clearHostEmailVerificationPending(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
