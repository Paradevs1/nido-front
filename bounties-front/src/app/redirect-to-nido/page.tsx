import { Suspense } from "react";
import RedirectClient, { RedirectFallback } from "./redirect-client";

export default function RedirectToNidoPage() {
  return (
    <Suspense fallback={<RedirectFallback />}>
      <RedirectClient />
    </Suspense>
  );
}

