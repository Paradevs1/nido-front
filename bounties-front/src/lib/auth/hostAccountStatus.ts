import { decodeJWT } from "@/lib/utils/jwt";

export const HOST_PENDING_ACTIVATION_PATH = "/host/pending-activation";

export type HostAccountStatus = "active" | "inactive";

export function jwtPayloadSaysHostInactive(
  payload: { role?: string; status?: string } | null
): boolean {
  if (!payload || String(payload.role).toUpperCase() !== "HOST") return false;
  const s = String(payload.status ?? "active").toLowerCase();
  return s === "inactive";
}

/** Prioriza `user.status` da API; fallback para claim `status` do JWT. */
export function resolveHostAccountStatusFromLogin(
  apiUser: { status?: string },
  token: string
): HostAccountStatus {
  const fromApi = apiUser?.status;
  if (fromApi != null) {
    return String(fromApi).toLowerCase() === "inactive" ? "inactive" : "active";
  }
  const dec = decodeJWT(token);
  const s = dec?.status;
  if (s != null && String(s).toLowerCase() === "inactive") return "inactive";
  return "active";
}

export function isHostUserInactive(
  user: { role?: string; accountStatus?: HostAccountStatus } | null
): boolean {
  if (!user) return false;
  const role = String(user.role ?? "").toLowerCase();
  if (role !== "host") return false;
  return user.accountStatus === "inactive";
}
