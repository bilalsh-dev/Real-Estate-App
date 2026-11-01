import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Navbar } from "@/components/Navbar";
import { NAVBAR_HEIGHT_PX } from "@/lib/constants";

describe("Navbar", () => {
  it("links the logo to the home page", () => {
    render(<Navbar />);
    expect(screen.getByRole("img", { name: "Rentiful logo" }).closest("a")).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("links to sign in and sign up", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute("href", "/signin");
    expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute("href", "/signup");
  });

  it("uses the shared navbar height", () => {
    render(<Navbar />);
    expect(screen.getByRole("banner")).toHaveStyle({ height: `${NAVBAR_HEIGHT_PX}px` });
  });
});
