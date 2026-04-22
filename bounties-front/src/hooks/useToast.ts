"use client";

import { useState, useCallback } from "react";

export interface ToastState {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "warning" | "info" = "error",
      duration: number = 5000
    ) => {
      setToast({ message, type, duration });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { showToast, hideToast, toast };
}

