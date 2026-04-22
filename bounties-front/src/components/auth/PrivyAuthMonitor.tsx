"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useUser } from "@/lib/contexts/UserContext";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import { detectTwitterBot } from "@/lib/utils/botDetection";
import { mergeCreatorLoginUser } from "@/lib/auth/mergeCreatorLoginUser";

export default function PrivyAuthMonitor() {
  const { login: authLogin, logout: authLogout } = useAuth();
  const { login: userLogin } = useUser();
  const privy = usePrivy();
  const { authenticated, user } = privy;
  const isProcessingLoginRef = useRef(false);
  const processedUserIdRef = useRef<string | null>(null);
  const botDetectedUsersRef = useRef<Set<string>>(new Set());
  const { showToast, hideToast, toast } = useToast();
  const RETURN_TO_KEY = "bounties:returnTo";

  const consumeReturnTo = (): string | null => {
    if (typeof window === "undefined") return null;
    try {
      const v = sessionStorage.getItem(RETURN_TO_KEY);
      if (!v) return null;
      sessionStorage.removeItem(RETURN_TO_KEY);
      // Só permitir path relativo (segurança)
      if (!v.startsWith("/")) return null;
      return v;
    } catch {
      return null;
    }
  };

  const isCreatorPath = (pathname: string): boolean => {
    return pathname === "/creator" || pathname.startsWith("/creator/");
  };

  /**
   * O callback OAuth do Privy costuma cair na raiz (`/?privy_oauth_state=...`), não em `/creator`.
   * Se só processássemos em `/creator`, o `login-creator` nunca rodava após "Creator" no LoginModal.
   * Host/admin usam email/senha — não misturar com este fluxo Privy.
   */
  const shouldSkipProcessing = (pathname: string): boolean => {
    if (pathname.startsWith("/host")) return true;
    if (pathname.startsWith("/admin")) return true;
    return false;
  };

  const processLogin = useCallback(
    async (privyUser: any) => {
      if (isProcessingLoginRef.current) return;
      if (processedUserIdRef.current === privyUser?.id) return;

      if (
        typeof window !== "undefined" &&
        shouldSkipProcessing(window.location.pathname)
      ) {
        return;
      }

      isProcessingLoginRef.current = true;
      processedUserIdRef.current = privyUser?.id;

      try {
        const finalLoginMethod =
          privyUser?.twitter === undefined
            ? privyUser?.google === undefined
              ? privyUser?.instagram === undefined
                ? "tiktok"
                : "instagram"
              : "google"
            : "twitter";

        if (finalLoginMethod === "twitter" && privyUser?.twitter) {
          if (privyUser?.id && botDetectedUsersRef.current.has(privyUser.id)) {
            processedUserIdRef.current = null;
            isProcessingLoginRef.current = false;
            return;
          }

          const botDetection = await detectTwitterBot({
            twitter: privyUser.twitter,
          });
          if (botDetection.isBot) {
            if (privyUser?.id) {
              botDetectedUsersRef.current.add(privyUser.id);
              try {
                await fetch("/api/privy/delete-user", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId: privyUser.id }),
                });
              } catch (error) {
                console.error("Error calling API to delete user:", error);
              }
            }

            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key) {
                if (key.startsWith("privy:") || key.startsWith("privy.")) keysToRemove.push(key);
                if (key.toLowerCase().startsWith("wagmi")) keysToRemove.push(key);
              }
            }
            keysToRemove.forEach((key) => localStorage.removeItem(key));

            localStorage.removeItem("bounties_token");
            localStorage.removeItem("bounties_user");
            localStorage.removeItem("auth_user");
            localStorage.removeItem("user");

            if (typeof document !== "undefined") {
              document.cookie = "bounties_token=; path=/; max-age=0";
              document.cookie = "auth_user=; path=/; max-age=0";
            }

            authLogout();
            showToast("Your account does not meet the requirements to register.", "error");

            processedUserIdRef.current = null;
            isProcessingLoginRef.current = false;

            setTimeout(() => {
              if (typeof window !== "undefined") window.location.href = "/";
            }, 1000);
            return;
          }
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login-creator`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: privyUser, loginMethod: finalLoginMethod }),
        });

        const result = await response.json().catch(() => ({} as any));
        if (response.ok && result.token && result.user) {
          const hadBountiesToken =
            typeof window !== "undefined" &&
            !!localStorage.getItem("bounties_token");

          const userWithFirstLogin = mergeCreatorLoginUser({
            user: result.user,
            first_login: result.first_login,
          });

          localStorage.setItem("bounties_token", result.token);
          localStorage.setItem("bounties_user", JSON.stringify(userWithFirstLogin));
          await authLogin(userWithFirstLogin as any, result.token);
          userLogin(userWithFirstLogin as any);

          const returnTo = consumeReturnTo();
          if (returnTo) {
            window.location.assign(returnTo);
            return;
          }

          // Pós-OAuth na home: enviar para área do creator (sem redirecionar quem já tinha token e está na landing).
          if (
            typeof window !== "undefined" &&
            !hadBountiesToken &&
            !isCreatorPath(window.location.pathname)
          ) {
            window.location.assign("/creator");
          }
        } else {
          authLogout();
          localStorage.removeItem("bounties_token");
          localStorage.removeItem("bounties_user");
          localStorage.removeItem("auth_user");
          if (privy.authenticated) await privy.logout();
          showToast(result?.message || "Falha ao autenticar. Tente novamente.", "error");
          processedUserIdRef.current = null;
        }
      } catch (error) {
        console.error("Error processing login:", error);
      } finally {
        isProcessingLoginRef.current = false;
      }
    },
    [authLogin, userLogin, authLogout, privy, showToast]
  );

  useEffect(() => {
    if (authenticated && user && user.id) {
      if (typeof window !== "undefined" && shouldSkipProcessing(window.location.pathname)) return;
      if (processedUserIdRef.current === user.id) return;
      processLogin(user);
    }
  }, [authenticated, user, processLogin]);

  useEffect(() => {
    const handlePrivyAuthCheck = () => {
      if (privy.authenticated && privy.user && privy.user.id) {
        if (typeof window !== "undefined" && shouldSkipProcessing(window.location.pathname)) return;
        if (processedUserIdRef.current === privy.user.id) return;
        processLogin(privy.user);
      }
    };

    window.addEventListener("privy-auth-check", handlePrivyAuthCheck);
    return () => {
      window.removeEventListener("privy-auth-check", handlePrivyAuthCheck);
    };
  }, [privy.authenticated, privy.user, processLogin]);

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
    </>
  );
}
