import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthUser } from "@/hooks/use-auth-user";
import { setViewMode } from "@/state/globalSlice";
import { makeStore } from "@/state/store";
import { authState, makeAuthUser } from "@/test-utils/auth";
import { makeProperty } from "@/test-utils/property";
import { Provider } from "react-redux";
import type * as apiModule from "@/state/api";
import { Listings } from "./Listings";

const addFavorite = vi.fn();
const removeFavorite = vi.fn();
let favorites = [{ id: 2 }];

vi.mock("@/hooks/use-auth-user", () => ({ useAuthUser: vi.fn() }));
vi.mock("@/state/api", async (importOriginal) => ({
  ...(await importOriginal<typeof apiModule>()),
  useGetTenantQuery: () => ({ data: { favorites } }),
  useAddFavoritePropertyMutation: () => [
    (args: unknown) => ({ unwrap: () => Promise.resolve(addFavorite(args)) }),
  ],
  useRemoveFavoritePropertyMutation: () => [
    (args: unknown) => ({ unwrap: () => Promise.resolve(removeFavorite(args)) }),
  ],
}));

const properties = [
  makeProperty({ id: 1, name: "First" }),
  makeProperty({ id: 2, name: "Second" }),
];

function renderListings(viewMode: "grid" | "list" = "grid") {
  const store = makeStore();
  store.dispatch(setViewMode(viewMode));
  render(
    <Provider store={store}>
      <Listings properties={properties} location="Los Angeles" />
    </Provider>,
  );
}

describe("Listings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    favorites = [{ id: 2 }];
    vi.mocked(useAuthUser).mockReturnValue(authState({ authStatus: "unauthenticated" }));
  });

  it("shows the result count and location", () => {
    renderListings();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("2 Places in Los Angeles");
  });

  it("renders full cards in grid view and compact cards in list view", () => {
    renderListings("grid");
    expect(screen.getAllByText("/month")).toHaveLength(2);
    expect(screen.queryByText("/mo")).not.toBeInTheDocument();
  });

  it("renders compact cards in list view", () => {
    renderListings("list");
    expect(screen.getAllByText("/mo")).toHaveLength(2);
    expect(screen.queryByText("/month")).not.toBeInTheDocument();
  });

  it("hides favorite buttons for visitors and managers", () => {
    renderListings();
    expect(screen.queryByRole("button", { name: /favorites/ })).not.toBeInTheDocument();
  });

  it("lets a tenant add and remove favorites", async () => {
    vi.mocked(useAuthUser).mockReturnValue(
      authState({ authStatus: "authenticated", data: makeAuthUser("tenant") }),
    );
    renderListings();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Add to favorites" }));
    expect(addFavorite).toHaveBeenCalledWith({ cognitoId: "tenant-1", propertyId: 1 });

    await user.click(screen.getByRole("button", { name: "Remove from favorites" }));
    expect(removeFavorite).toHaveBeenCalledWith({ cognitoId: "tenant-1", propertyId: 2 });
  });
});
