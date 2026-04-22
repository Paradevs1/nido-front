/**
 * Cookie legível (não httpOnly) usado pelo middleware para `registerCompleted`
 * e redirects. Mantido mínimo para caber no limite do cookie.
 */
export function syncHostAuthUserCookie(
  user: {
    registerCompleted?: boolean;
    accountStatus?: string;
    id?: string;
    role?: string;
  } | null
): void {
  if (typeof document === "undefined") return;
  const role = String(user?.role ?? "").toLowerCase();
  if (!user || (role !== "host" && role !== "admin")) {
    document.cookie = "auth_user=; path=/; max-age=0";
    return;
  }
  const payload = JSON.stringify({
    registerCompleted: user.registerCompleted,
    accountStatus: user.accountStatus,
    id: user.id,
    role: user.role,
  });
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `auth_user=${encodeURIComponent(payload)}; path=/; max-age=604800; SameSite=Strict${secure}`;
}
