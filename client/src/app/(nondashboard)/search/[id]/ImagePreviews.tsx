"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { PropertyImage } from "@/components/PropertyImage";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_BUTTON_CLASS =
  "absolute top-1/2 -translate-y-1/2 rounded-full bg-primary-700/50 p-2 focus:ring focus:ring-secondary-300 focus:outline-none";

type ImagePreviewsProps = {
  images: string[];
  name: string;
};

export function ImagePreviews({ images, name }: ImagePreviewsProps) {
  const slides = images.length > 0 ? images : [PLACEHOLDER_IMAGE];
  const [current, setCurrent] = useState(0);

  const showPrevious = () => setCurrent((index) => (index === 0 ? slides.length - 1 : index - 1));
  const showNext = () => setCurrent((index) => (index === slides.length - 1 ? 0 : index + 1));

  return (
    <div
      className="relative h-112 w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${name} photos`}
    >
      {slides.map((image, index) => (
        <div
          key={image}
          aria-hidden={index !== current}
          className={cn(
            "absolute inset-0 transition-opacity duration-500 ease-in-out",
            index === current ? "opacity-100" : "opacity-0",
          )}
        >
          <PropertyImage
            src={image}
            alt={`${name} photo ${index + 1} of ${slides.length}`}
            sizes="100vw"
            preload={index === 0}
          />
        </div>
      ))}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            className={cn(NAV_BUTTON_CLASS, "left-0")}
            aria-label="Previous image"
          >
            <ChevronLeft className="text-white" aria-hidden />
          </button>
          <button
            type="button"
            onClick={showNext}
            className={cn(NAV_BUTTON_CLASS, "right-0")}
            aria-label="Next image"
          >
            <ChevronRight className="text-white" aria-hidden />
          </button>
        </>
      )}
    </div>
  );
}
