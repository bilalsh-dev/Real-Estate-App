import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Card, type PropertyCardProps } from "@/components/Card";
import { CardCompact } from "@/components/CardCompact";
import { makeProperty } from "@/test-utils/property";

const property = makeProperty();

describe.each([
  ["Card", Card],
  ["CardCompact", CardCompact],
])("%s", (_name, Component: (props: PropertyCardProps) => React.ReactNode) => {
  function renderCard(overrides: Partial<PropertyCardProps> = {}) {
    const onFavoriteToggle = vi.fn();
    render(
      <Component
        property={property}
        isFavorite={false}
        onFavoriteToggle={onFavoriteToggle}
        propertyLink="/search/1"
        {...overrides}
      />,
    );
    return { onFavoriteToggle };
  }

  it("renders the price, beds, baths and square feet", () => {
    renderCard();
    expect(screen.getByText(/\$2450/)).toBeInTheDocument();
    expect(screen.getByText(/^2( Bed)?$/)).toBeInTheDocument();
    expect(screen.getByText(/^1\.5( Bath)?$/)).toBeInTheDocument();
    expect(screen.getByText(/^950( sq ft)?$/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sunny Loft" })).toHaveAttribute("href", "/search/1");
  });

  it("calls onFavoriteToggle from the favorite button", async () => {
    const { onFavoriteToggle } = renderCard({ isFavorite: true });
    const button = screen.getByRole("button", { name: "Remove from favorites" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    await userEvent.setup().click(button);
    expect(onFavoriteToggle).toHaveBeenCalledOnce();
  });

  it("hides the favorite button when showFavoriteButton is false", () => {
    renderCard({ showFavoriteButton: false });
    expect(screen.queryByRole("button", { name: /favorites/ })).not.toBeInTheDocument();
  });

  it("renders the name as plain text without a link", () => {
    renderCard({ propertyLink: undefined });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sunny Loft" })).toBeInTheDocument();
  });
});
