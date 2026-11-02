import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthUser } from "@/hooks/use-auth-user";
import { authState, makeAuthUser } from "@/test-utils/auth";
import { DashboardShell } from "./DashboardShell";

const replace = vi.fn();
let pathname = "/tenants/settings";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace, push: vi.fn() }),
}));
vi.mock("@/hooks/use-auth-user", () => ({ useAuthUser: vi.fn() }));
vi.mock("@/components/Navbar", () => ({ Navbar: () => <header /> }));
vi.mock("@/components/AppSidebar", () => ({
  AppSidebar: ({ userRole }: { userRole: string }) => <aside>{userRole} sidebar</aside>,
}));

const mockedUseAuthUser = vi.mocked(useAuthUser);

function renderShell(path: string) {
  pathname = path;
  render(
    <DashboardShell>
      <p>page content</p>
    </DashboardShell>,
  );
}

describe("DashboardShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
  });

  it("redirects signed-out visitors to sign in and back", () => {
    mockedUseAuthUser.mockReturnValue(authState({ authStatus: "unauthenticated" }));
    renderShell("/tenants/settings");
    expect(replace).toHaveBeenCalledWith("/signin?next=%2Ftenants%2Fsettings", { scroll: false });
    expect(screen.queryByText("page content")).not.toBeInTheDocument();
  });

  it("shows a loading state while the session resolves", () => {
    mockedUseAuthUser.mockReturnValue(authState({ authStatus: "configuring" }));
    renderShell("/tenants/settings");
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    expect(replace).not.toHaveBeenCalled();
  });

  it("sends a manager away from tenant pages", () => {
    mockedUseAuthUser.mockReturnValue(
      authState({ authStatus: "authenticated", data: makeAuthUser("manager") }),
    );
    renderShell("/tenants/favorites");
    expect(replace).toHaveBeenCalledWith("/managers/properties", { scroll: false });
    expect(screen.queryByText("page content")).not.toBeInTheDocument();
  });

  it("sends a tenant away from manager pages", () => {
    mockedUseAuthUser.mockReturnValue(
      authState({ authStatus: "authenticated", data: makeAuthUser("tenant") }),
    );
    renderShell("/managers/settings");
    expect(replace).toHaveBeenCalledWith("/tenants/favorites", { scroll: false });
  });

  it("renders the page with the role's sidebar", () => {
    mockedUseAuthUser.mockReturnValue(
      authState({ authStatus: "authenticated", data: makeAuthUser("tenant") }),
    );
    renderShell("/tenants/settings");
    expect(screen.getByText("page content")).toBeInTheDocument();
    expect(screen.getByText("tenant sidebar")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("offers a retry when the account fails to load", () => {
    mockedUseAuthUser.mockReturnValue(authState({ authStatus: "authenticated", isError: true }));
    renderShell("/tenants/settings");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
