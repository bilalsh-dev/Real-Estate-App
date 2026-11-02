import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuthUser } from "@/hooks/use-auth-user";
import { NAVBAR_HEIGHT_PX } from "@/lib/constants";
import { StoreProvider } from "@/state/StoreProvider";
import { authState, makeAuthUser } from "@/test-utils/auth";

const push = vi.fn();
const signOut = vi.fn(() => Promise.resolve());

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("aws-amplify/auth", () => ({ signOut: () => signOut() }));
vi.mock("@/hooks/use-auth-user", () => ({ useAuthUser: vi.fn() }));

const mockedUseAuthUser = vi.mocked(useAuthUser);

function renderNavbar(variant?: "public" | "dashboard") {
  return render(
    <StoreProvider>
      <SidebarProvider>
        <Navbar variant={variant} />
      </SidebarProvider>
    </StoreProvider>,
  );
}

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
    mockedUseAuthUser.mockReturnValue(authState({ authStatus: "unauthenticated" }));
  });

  it("links the logo to the home page", () => {
    renderNavbar();
    expect(screen.getByRole("img", { name: "Rentiful logo" }).closest("a")).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("links to sign in and sign up when signed out", () => {
    renderNavbar();
    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute("href", "/signin");
    expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute("href", "/signup");
  });

  it("uses the shared navbar height", () => {
    renderNavbar();
    expect(screen.getByRole("banner")).toHaveStyle({ height: `${NAVBAR_HEIGHT_PX}px` });
  });

  it("shows a placeholder while the session is loading", () => {
    mockedUseAuthUser.mockReturnValue(authState({ authStatus: "configuring" }));
    renderNavbar();
    expect(screen.queryByRole("link", { name: "Sign In" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Loading account")).toBeInTheDocument();
  });

  it("shows the account menu for a signed-in tenant and signs out", async () => {
    const user = userEvent.setup();
    mockedUseAuthUser.mockReturnValue(
      authState({ authStatus: "authenticated", data: makeAuthUser("tenant") }),
    );
    renderNavbar();

    await user.click(screen.getByRole("button", { name: /Ann Smith/ }));
    expect(screen.getByRole("menuitem", { name: "Go to Dashboard" })).toHaveAttribute(
      "href",
      "/tenants/favorites",
    );
    expect(screen.getByRole("menuitem", { name: "Settings" })).toHaveAttribute(
      "href",
      "/tenants/settings",
    );

    await user.click(screen.getByRole("menuitem", { name: "Sign out" }));
    expect(signOut).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith("/");
  });

  it("shows the role action and sidebar trigger on the dashboard", () => {
    mockedUseAuthUser.mockReturnValue(
      authState({ authStatus: "authenticated", data: makeAuthUser("manager") }),
    );
    renderNavbar("dashboard");
    expect(screen.getByRole("link", { name: "Add New Property" })).toHaveAttribute(
      "href",
      "/managers/newproperty",
    );
    expect(screen.getByRole("button", { name: "Toggle Sidebar" })).toBeInTheDocument();
    expect(screen.queryByText(/Discover your perfect rental/)).not.toBeInTheDocument();
  });

  it("offers property search to tenants on the dashboard", () => {
    mockedUseAuthUser.mockReturnValue(
      authState({ authStatus: "authenticated", data: makeAuthUser("tenant") }),
    );
    renderNavbar("dashboard");
    expect(screen.getByRole("link", { name: "Search Properties" })).toHaveAttribute(
      "href",
      "/search",
    );
  });
});
