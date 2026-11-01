import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeroSection } from "./HeroSection";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("HeroSection", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("renders the headline, search input and search button", () => {
    render(<HeroSection />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Start your journey to finding the perfect place to call home",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search location" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("navigates to search with the trimmed location", () => {
    render(<HeroSection />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "  Los Angeles " } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(push).toHaveBeenCalledWith("/search?location=Los+Angeles");
  });

  it("does not navigate for an empty query", () => {
    render(<HeroSection />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(push).not.toHaveBeenCalled();
  });
});
