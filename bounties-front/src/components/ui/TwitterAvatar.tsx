"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface TwitterAvatarProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackInitial?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

export default function TwitterAvatar({
  src,
  alt,
  className,
  fallbackInitial,
  fill,
  width,
  height,
}: TwitterAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (src && src !== "data:image/jpeg;base64,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") {
      const optimizedSrc = src.replace("_normal", "_400x400");
      setImageSrc(optimizedSrc);
      setImgError(false);
    } else {
      setImageSrc(null);
    }
  }, [src]);

  if (imageSrc && !imgError) {
    if (fill) {
      return (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className={className}
          onError={() => setImgError(true)}
          unoptimized
        />
      );
    }

    return (
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback para a imagem substituta do Twitter
  const fallbackSrc = "/assets/twitterProfile/twitterIconSubstitute.svg";
  
  if (fill) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        fill
        className={className}
        unoptimized
      />
    );
  }

  return (
    <Image
      src={fallbackSrc}
      alt={alt}
      width={width || 40}
      height={height || 40}
      className={className}
      unoptimized
    />
  );
}

