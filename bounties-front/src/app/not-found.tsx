"use client";

import Link from "next/link";
import { GuestLayout } from "@/components/layout";
import BaseButton from "@/components/ui/Button";

export default function NotFound() {
  return (
    <GuestLayout>
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="max-w-[1440px] mx-auto px-6 py-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-8">
            {/* Número 404 grande */}
            <div className="relative">
              <h1 className="text-[180px] md:text-[240px] font-bold text-white/10 leading-none">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-4xl md:text-6xl font-bold text-white">
                  Page not found
                </h2>
              </div>
            </div>

            {/* Mensagem */}
            <div className="space-y-4 max-w-2xl">
              <p className="text-xl md:text-2xl text-white/80">
                Ops! The page you are looking for does not exist or has been moved.
              </p>
              <p className="text-base md:text-lg text-white/60">
                But don&apos;t worry—you can head home and keep exploring campaigns on Nido.
              </p>
            </div>

            {/* Botão para voltar */}
            <div className="pt-4">
              <Link href="/">
                <BaseButton
                  className="px-8 py-4 text-lg font-semibold hover:opacity-90 cursor-pointer"
                  variant="default"
                >
                  Back to Home
                </BaseButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
