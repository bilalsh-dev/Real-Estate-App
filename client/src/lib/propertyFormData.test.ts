import { describe, expect, it } from "vitest";
import { toPropertyFormData } from "@/lib/propertyFormData";
import type { PropertyFormData } from "@/lib/schemas";

const photos = [
  new File(["a"], "a.jpg", { type: "image/jpeg" }),
  new File(["b"], "b.png", { type: "image/png" }),
];

const data: PropertyFormData = {
  name: "Loft",
  description: "Nice",
  pricePerMonth: 1800,
  securityDeposit: 900,
  applicationFee: 0,
  isPetsAllowed: true,
  isParkingIncluded: false,
  photos,
  amenities: ["Pool", "Gym"],
  highlights: ["GreatView"],
  beds: 2,
  baths: 1.5,
  squareFeet: 800,
  propertyType: "Apartment",
  address: "1 Main St",
  city: "Berlin",
  state: "Berlin",
  country: "Germany",
  postalCode: "10115",
};

describe("toPropertyFormData", () => {
  it("adds every photo under photos and the other fields as strings", () => {
    const formData = toPropertyFormData(data);
    expect(formData.getAll("photos")).toEqual(photos);
    expect(formData.get("amenities")).toBe("Pool,Gym");
    expect(formData.get("highlights")).toBe("GreatView");
    expect(formData.get("isPetsAllowed")).toBe("true");
    expect(formData.get("isParkingIncluded")).toBe("false");
    expect(formData.get("baths")).toBe("1.5");
    expect(formData.get("postalCode")).toBe("10115");
  });

  it("never sends a manager id, which the API takes from the token", () => {
    expect(toPropertyFormData(data).has("managerCognitoId")).toBe(false);
  });
});
