"use client";

import { useEffect, useState } from "react";

type ProofImageLightboxProps = {
  src: string;
  alt: string;
  /** Classes no botão que envolve a miniatura */
  className?: string;
  children?: React.ReactNode;
};

/**
 * Miniatura clicável que abre a imagem em overlay (data URLs longas falham em target=_blank).
 */
export default function ProofImageLightbox({
  src,
  alt,
  className = "",
  children,
}: ProofImageLightboxProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`p-0 border-0 bg-transparent cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-lg overflow-hidden ${className}`}
        aria-label={alt || "Ver imagem em tamanho maior"}
      >
        {children ?? (
          <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização da imagem"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-[401] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl leading-none flex items-center justify-center cursor-pointer border border-white/20"
            aria-label="Fechar"
          >
            ×
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain select-none"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
          <p className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-xs pointer-events-none">
            Clique fora da imagem ou Esc para fechar · nada é baixado automaticamente
          </p>
        </div>
      )}
    </>
  );
}
