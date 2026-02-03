"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackClassName?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackClassName,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={cn(
          "w-full h-full bg-gradient-to-br from-brand-void to-black opacity-80 animate-in fade-in",
          fallbackClassName,
        )}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn(
        "w-full h-full object-cover opacity-90 transition-opacity duration-700",
        className,
      )}
      onError={() => setError(true)}
      {...props}
    />
  );
}
