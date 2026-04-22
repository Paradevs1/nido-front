/**
 * Resposta de POST /api/auth/login-creator (nível raiz: user, token, first_login).
 * Evita sobrescrever `first_login: false` do user com `undefined` vindo do topo.
 */
export function mergeCreatorLoginUser(api: {
  user?: Record<string, unknown> | null;
  first_login?: boolean | null;
}): Record<string, unknown> {
  const base: Record<string, unknown> = { ...(api.user ?? {}) };
  const top = api.first_login;
  if (typeof top === "boolean" || top === null) {
    base["first_login"] = top;
  }
  return base;
}
