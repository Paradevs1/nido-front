"use client";

import { useCallback, useState } from "react";

type ThumbOrientation = "pending" | "landscape" | "portrait" | "square";

const ORIENTATION_RATIO = 1.12;

function detectOrientation(naturalWidth: number, naturalHeight: number): ThumbOrientation {
  if (naturalWidth <= 0 || naturalHeight <= 0) return "square";
  const r = naturalWidth / naturalHeight;
  if (r >= ORIENTATION_RATIO) return "landscape";
  if (r <= 1 / ORIENTATION_RATIO) return "portrait";
  return "square";
}

export interface AnnouncementImageThumbProps {
  src: string;
  alt: string;
  onClick?: () => void;
  variant?: "card" | "form" | "banner";
  wrapperClassName?: string;
}

/**
 * Visual anterior: borda externa + fundo claro + caixa interna escura.
 * A imagem fica colada na borda interna (`w-fit h-fit` + `leading-none`), sem faixa extra dentro do cinza.
 *
 * Variante "banner": usada quando há apenas 1 imagem landscape — ela ocupa 100% da largura do card.
 */
export default function AnnouncementImageThumb({
  src,
  alt,
  onClick,
  variant = "card",
  wrapperClassName = "",
}: AnnouncementImageThumbProps) {
  const [orientation, setOrientation] = useState<ThumbOrientation>("pending");

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setOrientation(detectOrientation(img.naturalWidth, img.naturalHeight));
  }, []);

  // Banner variant: landscape image fills full width
  const isBanner = variant === "banner";

  const imgSizing = (() => {
    if (orientation === "pending") return "";
    // Banner + landscape = full-width fill
    if (isBanner && orientation === "landscape") {
      return "w-full h-auto";
    }
    if (orientation === "portrait") {
      return variant === "card"
        ? "h-auto max-h-[13.5rem] w-auto max-w-[min(100%,12rem)] sm:max-h-[15.5rem]"
        : "h-auto max-h-[11rem] w-auto max-w-[min(100%,9rem)] sm:max-h-[12.5rem]";
    }
    if (orientation === "landscape") {
      return variant === "card"
        ? "h-auto max-h-[6.75rem] w-auto max-w-[min(100%,17.5rem)] sm:max-h-[8rem]"
        : "h-auto max-h-[5.25rem] w-auto max-w-[min(100%,11rem)] sm:max-h-24";
    }
    return variant === "card"
      ? "h-auto max-h-[9.5rem] w-auto max-w-[9.5rem] sm:max-h-[10.5rem] sm:max-w-[10.5rem]"
      : "h-auto max-h-[8rem] w-auto max-w-[8rem] sm:max-h-[9rem] sm:max-w-[9rem]";
  })();

  // Banner uses block/full-width layout; regular variants use inline layout
  const outer = isBanner
    ? "block max-w-[70%] ml-0 mr-auto flex-shrink-0 rounded-xl border border-white/10 bg-white/5 p-1 leading-[0] transition-colors " +
      (onClick
        ? "cursor-pointer hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        : "")
    : "inline-block max-w-full flex-shrink-0 rounded-xl border border-white/10 bg-white/5 p-1 leading-[0] transition-colors align-top " +
      (onClick
        ? "cursor-pointer hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        : "");

  /** Encaixa exatamente na imagem — sem "vão" entre foto e borda interna. */
  const innerFrame = isBanner
    ? "block w-full overflow-hidden rounded-lg bg-black/30 leading-none"
    : "inline-block h-fit w-fit max-w-full overflow-hidden rounded-lg bg-black/30 align-top leading-none";

  const imgLoadedClass = `m-0 block align-top object-contain ${imgSizing}`.trim();

  const contentLoaded = (
    <span className={innerFrame}>
      <img src={src} alt={alt} onLoad={handleLoad} className={imgLoadedClass} />
    </span>
  );

  if (orientation === "pending") {
    // Pending skeleton: banner uses full-width, others use fixed size
    const pendingInner = isBanner
      ? (
        <span className="block w-full h-[7rem] overflow-hidden rounded-lg bg-black/30 leading-none sm:h-[9rem]">
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            className="m-0 block h-full w-full object-contain"
          />
        </span>
      )
      : (
        <span className="inline-block h-[7rem] w-[11rem] max-w-full overflow-hidden rounded-lg bg-black/30 align-top leading-none sm:h-[8rem] sm:w-[13rem]">
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            className="m-0 block h-full w-full object-contain"
          />
        </span>
      );

    if (onClick) {
      return (
        <button type="button" onClick={onClick} className={`${outer} ${wrapperClassName}`.trim()} aria-label={alt}>
          {pendingInner}
        </button>
      );
    }
    return <div className={`${outer} ${wrapperClassName}`.trim()}>{pendingInner}</div>;
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${outer} ${wrapperClassName}`.trim()} aria-label={alt}>
        {contentLoaded}
      </button>
    );
  }

  return <div className={`${outer} ${wrapperClassName}`.trim()}>{contentLoaded}</div>;
}
