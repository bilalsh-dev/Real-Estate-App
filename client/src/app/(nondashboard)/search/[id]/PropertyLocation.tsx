"use client";

import { Compass, MapPin } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import { MAP_MARKER_COLOR, MAP_STYLE, PROPERTY_MAP_ZOOM } from "@/lib/constants";
import { env } from "@/lib/env";
import type { Property } from "@/types";

const DIRECTIONS_URL = "https://www.google.com/maps/search/?api=1&query=";

export function PropertyLocation({ property }: { property: Property }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { location } = property;
  const { longitude, latitude } = location.coordinates;
  const fullAddress = [
    location.address,
    location.city,
    location.state,
    location.postalCode,
    location.country,
  ].join(", ");

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new mapboxgl.Map({
      accessToken: env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
      container: containerRef.current,
      style: MAP_STYLE,
      center: [longitude, latitude],
      zoom: PROPERTY_MAP_ZOOM,
    });
    new mapboxgl.Marker({ color: MAP_MARKER_COLOR }).setLngLat([longitude, latitude]).addTo(map);
    return () => map.remove();
  }, [longitude, latitude]);

  return (
    <section className="py-16">
      <h2 className="text-xl font-semibold text-primary-800">Map and Location</h2>
      <div className="mt-2 flex items-center justify-between text-sm text-primary-500">
        <div className="flex items-center text-gray-500">
          <MapPin className="mr-1 size-4 text-gray-700" aria-hidden />
          Property Address:
          <span className="ml-2 font-semibold text-gray-700">{fullAddress}</span>
        </div>
        <a
          href={`${DIRECTIONS_URL}${encodeURIComponent(fullAddress)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary-600 hover:underline"
        >
          <Compass className="size-5" aria-hidden />
          Get Directions
        </a>
      </div>
      <div
        ref={containerRef}
        role="region"
        aria-label={`Map of ${property.name}`}
        className="relative mt-4 h-75 overflow-hidden rounded-lg"
      />
    </section>
  );
}
