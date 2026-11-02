import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LandingPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/hooks/use-locate", () => ({
  useLocate: () => ({ locate: vi.fn(), isLocating: false }),
}));

vi.mock("@/components/CurrentYear", () => ({
  CurrentYear: () => <>{new Date().getFullYear()}</>,
}));

describe("LandingPage", () => {
  it("renders the five sections in order", () => {
    const { container } = render(<LandingPage />);
    const headings = screen
      .getAllByRole("heading", { level: 1 })
      .concat(screen.getAllByRole("heading", { level: 2 }));
    expect(headings.map((heading) => heading.textContent)).toEqual([
      "Start your journey to finding the perfect place to call home",
      "Quickly find the home you want using our effective search filters!",
      "Discover",
      "Find Your Dream Rental Property",
    ]);
    expect(container.lastElementChild?.tagName).toBe("FOOTER");
  });

  it("gives every informative image alt text", () => {
    const { container } = render(<LandingPage />);
    const images = Array.from(container.querySelectorAll("img"));
    const decorative = images.filter((image) => image.getAttribute("alt") === "");
    const informative = images.filter((image) => image.getAttribute("alt") !== "");

    expect(images.every((image) => image.hasAttribute("alt"))).toBe(true);
    expect(decorative).toHaveLength(3);
    expect(informative).toHaveLength(5);
  });

  it("points every feature link at the search page", () => {
    render(<LandingPage />);
    for (const name of ["Explore", "Discover"]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", "/search");
    }
    const searchLinks = screen
      .getAllByRole("link", { name: "Search" })
      .map((link) => link.getAttribute("href"));
    expect(searchLinks.every((href) => href === "/search")).toBe(true);
  });

  it("renders the footer brand, navigation and copyright", () => {
    render(<LandingPage />);
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("link", { name: "RENTIFUL" })).toHaveAttribute("href", "/");
    expect(within(footer).getByRole("navigation", { name: "Footer" })).toBeInTheDocument();
    expect(footer.querySelector("p")).toHaveTextContent(
      `© ${new Date().getFullYear()} Rentiful. All rights reserved.`,
    );
  });
});
