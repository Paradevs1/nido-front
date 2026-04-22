import { isTokenExpired, decodeJWT } from "@/lib/utils/jwt";

type StoredUser = {
  role?: string;
  registerCompleted?: boolean;
  accountStatus?: string;
};

/**
 * Se existir sessão válida no storage (mesmo critério do restante do app),
 * retorna para onde a home / Sign in devem mandar o usuário.
 * Alinhado ao fluxo pós-login em `HostLoginModal` (host/admin).
 */
export function getAuthedHomeRedirectPath(): string | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("bounties_token");
  if (!token || isTokenExpired(token)) return null;

  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;

  try {
    const u = JSON.parse(raw) as StoredUser;
    const role = String(u.role ?? "").toLowerCase();

    if (role === "admin") return "/admin";

    if (role === "host") {
      if (u.registerCompleted === false) return "/host/create";
      let inactive =
        String(u.accountStatus ?? "").toLowerCase() === "inactive";
      if (!inactive) {
        const dec = decodeJWT(token);
        if (dec && String(dec.status ?? "").toLowerCase() === "inactive") {
          inactive = true;
        }
      }
      if (inactive) return "/host/pending-activation";
      return "/host/campaign";
    }

    // Creator: role explícita ou qualquer outro (mesma regra antiga: tudo que não é host/admin)
    return "/creator";
  } catch {
    return null;
  }
}
