import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeroSection } from "./HeroSection";

const push = vi.fn();
const locate = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("@/hooks/use-locate", () => ({
  useLocate: () => ({ locate, isLocating: false }),
}));

function search(value: string) {
  fireEvent.change(screen.getByRole("searchbox"), { target: { value } });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
}

describe("HeroSection", () => {
  beforeEach(() => {
    push.mockClear();
    locate.mockReset();
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

  it("navigates to search with the geocoded location", async () => {
    locate.mockResolvedValue({ location: "Austin", coordinates: [-97.74, 30.27] });
    render(<HeroSection />);
    search("  Austin ");
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/search?location=Austin&coordinates=-97.74%2C30.27"),
    );
    expect(locate).toHaveBeenCalledWith("  Austin ");
  });

  it("stays on the page when the location cannot be found", async () => {
    locate.mockResolvedValue(null);
    render(<HeroSection />);
    search("Nowhere");
    await waitFor(() => expect(locate).toHaveBeenCalled());
    expect(push).not.toHaveBeenCalled();
  });
});
