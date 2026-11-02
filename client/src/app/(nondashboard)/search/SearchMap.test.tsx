import { describe, expect, it, vi } from "vitest";
import { makeProperty } from "@/test-utils/property";
import { createPopupContent } from "./SearchMap";

vi.mock("mapbox-gl", () => ({ default: {} }));

describe("createPopupContent", () => {
  it("links to the property and shows the monthly price", () => {
    const popup = createPopupContent(makeProperty({ id: 7, name: "Loft", pricePerMonth: 1800 }));
    expect(popup.querySelector("a")?.getAttribute("href")).toBe("/search/7");
    expect(popup.textContent).toContain("Loft");
    expect(popup.textContent).toContain("$1800 / month");
  });

  it("renders property names as text, never as HTML", () => {
    const name = '<img src=x onerror="alert(1)">';
    const popup = createPopupContent(makeProperty({ name }));
    expect(popup.querySelector("img")).toBeNull();
    expect(popup.querySelector("a")?.textContent).toBe(name);
  });
});
