import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthUser } from "@/hooks/use-auth-user";
import { authState, makeAuthUser } from "@/test-utils/auth";
import { ManagerRedirect } from "./ManagerRedirect";

const replace = vi.fn();
let pathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => pathname,
}));
vi.mock("@/hooks/use-auth-user", () => ({ useAuthUser: vi.fn() }));

describe("ManagerRedirect", () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it.each(["/", "/search", "/search/4"])("sends managers from %s to their properties", (path) => {
    pathname = path;
    vi.mocked(useAuthUser).mockReturnValue(
      authState({ authStatus: "authenticated", data: makeAuthUser("manager") }),
    );
    render(<ManagerRedirect />);
    expect(replace).toHaveBeenCalledWith("/managers/properties", { scroll: false });
  });

  it("leaves tenants, visitors and other pages alone", () => {
    pathname = "/search";
    vi.mocked(useAuthUser).mockReturnValue(
      authState({ authStatus: "authenticated", data: makeAuthUser("tenant") }),
    );
    render(<ManagerRedirect />);
    vi.mocked(useAuthUser).mockReturnValue(authState({ authStatus: "unauthenticated" }));
    render(<ManagerRedirect />);
    pathname = "/searching";
    vi.mocked(useAuthUser).mockReturnValue(
      authState({ authStatus: "authenticated", data: makeAuthUser("manager") }),
    );
    render(<ManagerRedirect />);
    expect(replace).not.toHaveBeenCalled();
  });
});
