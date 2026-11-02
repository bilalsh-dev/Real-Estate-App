import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthUser } from "@/hooks/use-auth-user";
import { makeApplication } from "@/test-utils/application";
import { authState, makeAuthUser } from "@/test-utils/auth";
import type { ApplicationListItem } from "@/types";
import { ContactWidget } from "./ContactWidget";

let applications: ApplicationListItem[] = [];
const createApplication = vi.fn();

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/hooks/use-auth-user", () => ({ useAuthUser: vi.fn() }));
vi.mock("@/state/api", () => ({
  useGetApplicationsQuery: (arg: unknown) =>
    typeof arg === "symbol" ? { isLoading: false } : { data: applications, isLoading: false },
  useCreateApplicationMutation: () => [createApplication, { isLoading: false }],
}));

function signInAs(role: "tenant" | "manager") {
  vi.mocked(useAuthUser).mockReturnValue(
    authState({ authStatus: "authenticated", data: makeAuthUser(role) }),
  );
}

describe("ContactWidget", () => {
  beforeEach(() => {
    applications = [];
    createApplication.mockReset();
    createApplication.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  });

  it("asks signed-out visitors to sign in and come back", () => {
    vi.mocked(useAuthUser).mockReturnValue(authState({ authStatus: "unauthenticated" }));
    render(<ContactWidget propertyId={7} />);
    expect(screen.getByRole("link", { name: "Sign In to Apply" })).toHaveAttribute(
      "href",
      "/signin?next=%2Fsearch%2F7",
    );
  });

  it("offers no application to managers", () => {
    signInAs("manager");
    render(<ContactWidget propertyId={7} />);
    expect(screen.queryByRole("button", { name: "Submit Application" })).not.toBeInTheDocument();
  });

  it("shows a pending application instead of the apply button", () => {
    signInAs("tenant");
    applications = [makeApplication({ propertyId: 7, status: "Pending" })];
    render(<ContactWidget propertyId={7} />);
    expect(screen.getByText(/Your application is pending review/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View applications" })).toHaveAttribute(
      "href",
      "/tenants/applications",
    );
    expect(screen.queryByRole("button", { name: "Submit Application" })).not.toBeInTheDocument();
  });

  it("lets a tenant apply again after a denial", () => {
    signInAs("tenant");
    applications = [makeApplication({ propertyId: 7, status: "Denied" })];
    render(<ContactWidget propertyId={7} />);
    expect(screen.getByRole("button", { name: "Submit Application" })).toBeInTheDocument();
  });

  it("submits a prefilled application for the property", async () => {
    signInAs("tenant");
    render(<ContactWidget propertyId={7} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit Application" }));

    const dialog = await screen.findByRole("dialog");
    expect(screen.getByLabelText("Name")).toHaveValue("Ann Smith");
    expect(screen.getByLabelText("Email")).toHaveValue("ann@example.com");
    fireEvent.change(screen.getByLabelText("Phone Number"), {
      target: { value: "+1 512 555 0100" },
    });
    fireEvent.change(screen.getByLabelText("Message (Optional)"), {
      target: { value: "  Moving in June " },
    });
    fireEvent.click(
      Array.from(dialog.querySelectorAll("button")).find(
        (button) => button.textContent === "Submit Application",
      )!,
    );

    await waitFor(() =>
      expect(createApplication).toHaveBeenCalledWith({
        propertyId: 7,
        name: "Ann Smith",
        email: "ann@example.com",
        phoneNumber: "+1 512 555 0100",
        message: "Moving in June",
      }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("blocks an invalid phone number", async () => {
    signInAs("tenant");
    render(<ContactWidget propertyId={7} />);
    fireEvent.click(screen.getByRole("button", { name: "Submit Application" }));
    await screen.findByRole("dialog");
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "123" } });
    fireEvent.submit(screen.getByLabelText("Phone Number").closest("form")!);
    expect(await screen.findByText("Phone number must be at least 10 digits")).toBeInTheDocument();
    expect(createApplication).not.toHaveBeenCalled();
  });
});
