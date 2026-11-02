"use client";

import Image from "next/image";
import { useState } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

type PropertyImageProps = {
  src: string | undefined;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
};

export function PropertyImage({ src, alt, sizes, preload, className }: PropertyImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolved = src && src !== failedSrc ? src : PLACEHOLDER_IMAGE;

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      className={className ?? "object-cover"}
      onError={() => setFailedSrc(resolved)}
    />
  );
}
