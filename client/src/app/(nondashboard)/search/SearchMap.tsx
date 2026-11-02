"use client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import { MAP_MARKER_COLOR, MAP_STYLE, SEARCH_MAP_ZOOM } from "@/lib/constants";
import { env } from "@/lib/env";
import type { FiltersState } from "@/state/globalSlice";
import type { Property } from "@/types";

export function createPopupContent(property: Property): HTMLElement {
  const root = document.createElement("div");
  root.className = "marker-popup";

  const image = document.createElement("div");
  image.className = "marker-popup-image";

  const details = document.createElement("div");
  const link = document.createElement("a");
  link.className = "marker-popup-title";
  link.href = `/search/${property.id}`;
  link.textContent = property.name;

  const price = document.createElement("p");
  price.className = "marker-popup-price";
  price.textContent = `$${property.pricePerMonth}`;
  const unit = document.createElement("span");
  unit.className = "marker-popup-price-unit";
  unit.textContent = " / month";
  price.append(unit);

  details.append(link, price);
  root.append(image, details);
  return root;
}

type SearchMapProps = {
  center: FiltersState["coordinates"];
  properties: Property[];
};

export function SearchMap({ center, properties }: SearchMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const initialCenter = useRef(center);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new mapboxgl.Map({
      accessToken: env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
      container: containerRef.current,
      style: MAP_STYLE,
      center: initialCenter.current,
      zoom: SEARCH_MAP_ZOOM,
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    mapRef.current?.flyTo({ center });
  }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = properties.map((property) =>
      new mapboxgl.Marker({ color: MAP_MARKER_COLOR })
        .setLngLat([
          property.location.coordinates.longitude,
          property.location.coordinates.latitude,
        ])
        .setPopup(new mapboxgl.Popup().setDOMContent(createPopupContent(property)))
        .addTo(map),
    );
    return () => markers.forEach((marker) => marker.remove());
  }, [properties]);

  return (
    <div className="min-h-80 grow basis-5/12 overflow-hidden rounded-xl">
      <div
        ref={containerRef}
        role="region"
        aria-label="Map of search results"
        className="size-full"
      />
    </div>
  );
}
