import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthUser } from "@/hooks/use-auth-user";
import { authState, makeAuthUser } from "@/test-utils/auth";
import { makeProperty } from "@/test-utils/property";
import type { Property } from "@/types";
import { ManagerPropertiesList } from "./managers/properties/ManagerPropertiesList";
import { FavoritesList } from "./tenants/favorites/FavoritesList";
import { ResidencesList } from "./tenants/residences/ResidencesList";

let results: Property[] = [];
let favorites: { id: number }[] = [];

vi.mock("@/hooks/use-auth-user", () => ({ useAuthUser: vi.fn() }));
vi.mock("@/state/api", () => {
  const list = () => ({ data: results, isLoading: false, isError: false });
  return {
    useGetCurrentResidencesQuery: list,
    useGetManagerPropertiesQuery: list,
    useGetPropertiesQuery: list,
    useGetTenantQuery: () => ({ data: { favorites }, isLoading: false, isError: false }),
    useAddFavoritePropertyMutation: () => [vi.fn()],
    useRemoveFavoritePropertyMutation: () => [vi.fn()],
  };
});

describe("dashboard property lists", () => {
  beforeEach(() => {
    results = [];
    favorites = [];
  });

  describe("as a tenant", () => {
    beforeEach(() => {
      vi.mocked(useAuthUser).mockReturnValue(
        authState({ authStatus: "authenticated", data: makeAuthUser("tenant") }),
      );
    });

    it("shows empty states for favorites and residences", () => {
      render(<FavoritesList />);
      expect(screen.getByText("You don't have any favorited properties yet.")).toBeInTheDocument();
      render(<ResidencesList />);
      expect(screen.getByText("You don't have any current residences.")).toBeInTheDocument();
    });

    it("links favorites to the listing and residences to the residence page", () => {
      favorites = [{ id: 3 }];
      results = [makeProperty({ id: 3, name: "Canal Loft" })];
      render(<FavoritesList />);
      expect(screen.getByRole("link", { name: "Canal Loft" })).toHaveAttribute("href", "/search/3");
      expect(screen.getByRole("button", { name: "Remove from favorites" })).toBeInTheDocument();
    });

    it("links residences to their detail page", () => {
      results = [makeProperty({ id: 4, name: "Home" })];
      render(<ResidencesList />);
      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
        "href",
        "/tenants/residences/4",
      );
    });
  });

  describe("as a manager", () => {
    beforeEach(() => {
      vi.mocked(useAuthUser).mockReturnValue(
        authState({ authStatus: "authenticated", data: makeAuthUser("manager") }),
      );
    });

    it("shows an empty state, then links properties to their tenants page", () => {
      const { unmount } = render(<ManagerPropertiesList />);
      expect(screen.getByText("You don't manage any properties yet.")).toBeInTheDocument();
      unmount();

      results = [makeProperty({ id: 8, name: "Villa" })];
      render(<ManagerPropertiesList />);
      expect(screen.getByRole("link", { name: "Villa" })).toHaveAttribute(
        "href",
        "/managers/properties/8",
      );
    });
  });
});
