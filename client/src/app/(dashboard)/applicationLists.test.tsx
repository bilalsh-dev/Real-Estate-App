import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeApplication } from "@/test-utils/application";
import type { ApplicationListItem } from "@/types";
import { ManagerApplicationsList } from "./managers/applications/ManagerApplicationsList";
import { TenantApplicationsList } from "./tenants/applications/TenantApplicationsList";

let applications: ApplicationListItem[] = [];
const reviewApplication = vi.fn();

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/state/api", () => ({
  useGetApplicationsQuery: () => ({ data: applications, isLoading: false, isError: false }),
  useReviewApplicationMutation: () => [reviewApplication, { isLoading: false }],
}));

const activeLease = {
  id: 9,
  startDate: "2026-01-15T00:00:00.000Z",
  endDate: "2099-01-15T00:00:00.000Z",
  rent: 2450,
  deposit: 1000,
  propertyId: 2,
  tenantCognitoId: "tenant-1",
  nextPaymentDate: "2026-12-15T00:00:00.000Z",
};

const mixed = () => [
  makeApplication({ id: 1, status: "Pending", propertyId: 1 }),
  makeApplication({ id: 2, status: "Approved", propertyId: 2, leaseId: 9, lease: activeLease }),
  makeApplication({
    id: 3,
    status: "Approved",
    propertyId: 3,
    leaseId: 10,
    lease: {
      ...activeLease,
      id: 10,
      endDate: "2025-01-15T00:00:00.000Z",
      nextPaymentDate: null,
    },
  }),
  makeApplication({ id: 4, status: "Denied", propertyId: 4 }),
];

describe("application lists", () => {
  beforeEach(() => {
    applications = [];
    reviewApplication.mockReset();
    reviewApplication.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  });

  describe("tenant", () => {
    it("shows an empty state", () => {
      render(<TenantApplicationsList />);
      expect(screen.getByText("You haven't applied to any properties yet.")).toBeInTheDocument();
    });

    it("describes each status, lease dates and the manager contact", () => {
      applications = mixed();
      render(<TenantApplicationsList />);
      expect(screen.getByText("Your application is pending approval")).toBeInTheDocument();
      expect(
        screen.getByText("The property is being rented by you until Jan 15, 2099"),
      ).toBeInTheDocument();
      expect(screen.getByText("Your lease ended on Jan 15, 2025")).toBeInTheDocument();
      expect(screen.getByText("Your application has been denied")).toBeInTheDocument();
      expect(screen.getByText("Dec 15, 2026")).toBeInTheDocument();
      expect(screen.getByText("None")).toBeInTheDocument();
      expect(screen.getAllByRole("link", { name: /mark@example.com/ })[0]).toHaveAttribute(
        "href",
        "mailto:mark@example.com",
      );
      expect(screen.getAllByRole("link", { name: "View Residence" })[0]).toHaveAttribute(
        "href",
        "/tenants/residences/2",
      );
      expect(screen.getAllByRole("link", { name: "View Property" })[0]).toHaveAttribute(
        "href",
        "/search/1",
      );
    });
  });

  describe("manager", () => {
    it("counts and filters applications by status", () => {
      applications = mixed();
      render(<ManagerApplicationsList />);
      expect(screen.getByRole("tab", { name: "All (4)" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Approved (2)" })).toBeInTheDocument();
      expect(screen.getAllByRole("article")).toHaveLength(4);

      fireEvent.mouseDown(screen.getByRole("tab", { name: "Denied (1)" }), { button: 0 });
      const panel = screen.getByRole("tabpanel");
      expect(within(panel).getAllByRole("article")).toHaveLength(1);
      expect(within(panel).getByText("This application has been denied.")).toBeInTheDocument();
      expect(within(panel).getByText("carol@example.com")).toBeInTheDocument();
    });

    it("only offers review actions on pending applications", () => {
      applications = mixed();
      render(<ManagerApplicationsList />);
      expect(screen.getAllByRole("button", { name: "Approve" })).toHaveLength(1);
      expect(screen.getAllByRole("button", { name: "Deny" })).toHaveLength(1);
    });

    it.each([
      ["Approve", "Approved"],
      ["Deny", "Denied"],
    ])("asks for confirmation before %s", async (action, status) => {
      applications = [makeApplication({ id: 5 })];
      render(<ManagerApplicationsList />);
      fireEvent.click(screen.getByRole("button", { name: action }));
      const dialog = await screen.findByRole("dialog");
      expect(reviewApplication).not.toHaveBeenCalled();

      fireEvent.click(within(dialog).getByRole("button", { name: action }));
      await waitFor(() => expect(reviewApplication).toHaveBeenCalledWith({ id: 5, status }));
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });

    it("cancelling the confirmation sends nothing", async () => {
      applications = [makeApplication({ id: 5 })];
      render(<ManagerApplicationsList />);
      fireEvent.click(screen.getByRole("button", { name: "Approve" }));
      fireEvent.click(
        within(await screen.findByRole("dialog")).getByRole("button", { name: "Cancel" }),
      );
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(reviewApplication).not.toHaveBeenCalled();
    });
  });
});
