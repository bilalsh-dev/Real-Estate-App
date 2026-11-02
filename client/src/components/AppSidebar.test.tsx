import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { UserRole } from "@/lib/constants";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

function renderSidebar(userRole: UserRole, currentPath: string) {
  pathname = currentPath;
  render(
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar userRole={userRole} />
      </SidebarProvider>
    </TooltipProvider>,
  );
  return within(screen.getByRole("navigation", { name: "Dashboard" }));
}

function linkLabels(nav: ReturnType<typeof renderSidebar>) {
  return nav.getAllByRole("link").map((link) => link.textContent);
}

describe("AppSidebar", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
  });

  it("shows the tenant links", () => {
    const nav = renderSidebar("tenant", "/tenants/favorites");
    expect(linkLabels(nav)).toEqual(["Favorites", "Applications", "Residences", "Settings"]);
    expect(screen.getByText("Renter View")).toBeInTheDocument();
  });

  it("shows the manager links", () => {
    const nav = renderSidebar("manager", "/managers/properties");
    expect(linkLabels(nav)).toEqual(["Properties", "Applications", "Settings"]);
    expect(nav.getByRole("link", { name: "Properties" })).toHaveAttribute(
      "href",
      "/managers/properties",
    );
    expect(screen.getByText("Manager View")).toBeInTheDocument();
  });

  it("highlights only the active link", () => {
    const nav = renderSidebar("tenant", "/tenants/settings");
    const active = nav.getByRole("link", { name: "Settings" });
    expect(active).toHaveAttribute("aria-current", "page");
    expect(active).toHaveAttribute("data-active", "true");
    expect(nav.getByRole("link", { name: "Favorites" })).not.toHaveAttribute("aria-current");
  });
});
