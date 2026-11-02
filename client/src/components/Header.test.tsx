import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Header } from "@/components/Header";

describe("Header", () => {
  it("renders the title as a heading and the subtitle", () => {
    render(<Header title="My Properties" subtitle="View and manage your listings" />);
    expect(screen.getByRole("heading", { level: 1, name: "My Properties" })).toBeInTheDocument();
    expect(screen.getByText("View and manage your listings")).toBeInTheDocument();
  });
});
