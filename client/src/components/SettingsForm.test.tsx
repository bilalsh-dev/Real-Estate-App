import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SettingsForm } from "@/components/SettingsForm";

const initialData = { name: "Ann", email: "ann@example.com", phoneNumber: "+1 555 0100 22" };

function renderForm(onSubmit = vi.fn(() => Promise.resolve())) {
  render(<SettingsForm initialData={initialData} onSubmit={onSubmit} userRole="tenant" />);
  return { onSubmit, user: userEvent.setup() };
}

describe("SettingsForm", () => {
  it("starts read-only with the current values", () => {
    renderForm();
    expect(screen.getByRole("heading", { name: "Tenant Settings" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Ann");
    expect(screen.getByLabelText("Name")).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Phone Number")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Save Changes" })).not.toBeInTheDocument();
  });

  it("enables editing on toggle and restores the values on cancel", async () => {
    const { user } = renderForm();
    await user.click(screen.getByRole("button", { name: "Edit" }));
    const name = screen.getByLabelText("Name");
    expect(name).toBeEnabled();

    await user.clear(name);
    await user.type(name, "Changed");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByLabelText("Name")).toHaveValue("Ann");
    expect(screen.getByLabelText("Name")).toBeDisabled();
  });

  it("blocks submission on invalid input", async () => {
    const { user, onSubmit } = renderForm();
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.clear(screen.getByLabelText("Phone Number"));
    await user.type(screen.getByLabelText("Phone Number"), "123");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
    expect(screen.getByText(/at least 10 digits/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits valid data and returns to read-only", async () => {
    const { user, onSubmit } = renderForm();
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Ann Smith");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(onSubmit).toHaveBeenCalledWith({ ...initialData, name: "Ann Smith" });
    expect(await screen.findByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeDisabled();
  });

  it("stays in edit mode when saving fails", async () => {
    const { user } = renderForm(vi.fn(() => Promise.reject(new Error("network"))));
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByRole("button", { name: "Save Changes" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeEnabled();
  });
});
