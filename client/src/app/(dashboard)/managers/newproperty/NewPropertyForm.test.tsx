import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NewPropertyForm } from "./NewPropertyForm";

const push = vi.fn();
const createProperty = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/state/api", () => ({
  useCreatePropertyMutation: () => [
    (body: FormData) => ({ unwrap: () => Promise.resolve(createProperty(body)) }),
  ],
}));

const photo = new File(["jpeg"], "front.jpg", { type: "image/jpeg" });

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Property Name"), "Canal Loft");
  await user.type(screen.getByLabelText("Description"), "Bright loft by the canal");
  await user.click(screen.getByRole("button", { name: "Pool" }));
  await user.click(screen.getByRole("button", { name: "Great View" }));
  await user.type(screen.getByLabelText("Address"), "1 Main St");
  await user.type(screen.getByLabelText("City"), "Berlin");
  await user.type(screen.getByLabelText("State"), "Berlin");
  await user.type(screen.getByLabelText("Postal Code"), "10115");
  await user.type(screen.getByLabelText("Country"), "Germany");
}

describe("NewPropertyForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "URL",
      Object.assign(URL, { createObjectURL: () => "blob:preview", revokeObjectURL: vi.fn() }),
    );
  });

  it("blocks submission when required fields and photos are missing", async () => {
    const user = userEvent.setup();
    render(<NewPropertyForm />);
    await user.click(screen.getByRole("button", { name: "Create Property" }));

    expect(await screen.findByText("At least one photo is required")).toBeInTheDocument();
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Select at least one amenity")).toBeInTheDocument();
    expect(createProperty).not.toHaveBeenCalled();
  });

  it("blocks submission without photos even when everything else is valid", async () => {
    const user = userEvent.setup();
    render(<NewPropertyForm />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Create Property" }));

    expect(await screen.findByText("At least one photo is required")).toBeInTheDocument();
    expect(createProperty).not.toHaveBeenCalled();
  });

  it("submits FormData with the photos and comma-separated arrays, then opens the list", async () => {
    const user = userEvent.setup();
    render(<NewPropertyForm />);
    await fillRequiredFields(user);
    await user.upload(screen.getByLabelText("Property Photos"), photo);
    expect(
      within(screen.getByRole("list", { name: "Selected photos" })).getByAltText("front.jpg"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Create Property" }));

    await vi.waitFor(() => expect(createProperty).toHaveBeenCalledOnce());
    const body = createProperty.mock.calls[0]?.[0] as FormData;
    expect(body.getAll("photos")).toEqual([photo]);
    expect(body.get("amenities")).toBe("Pool");
    expect(body.get("highlights")).toBe("GreatView");
    expect(body.get("name")).toBe("Canal Loft");
    expect(body.get("pricePerMonth")).toBe("1000");
    expect(body.get("isPetsAllowed")).toBe("true");
    expect(body.has("managerCognitoId")).toBe(false);
    expect(push).toHaveBeenCalledWith("/managers/properties");
  });

  it("removes a selected photo", async () => {
    const user = userEvent.setup();
    render(<NewPropertyForm />);
    await user.upload(screen.getByLabelText("Property Photos"), photo);
    await user.click(screen.getByRole("button", { name: "Remove front.jpg" }));
    expect(screen.queryByRole("list", { name: "Selected photos" })).not.toBeInTheDocument();
  });
});
