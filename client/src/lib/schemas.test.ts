import { describe, expect, it } from "vitest";
import { applicationSchema, propertySchema, settingsSchema } from "@/lib/schemas";

const validProperty = {
  name: "Sunny Loft",
  description: "Bright loft downtown",
  pricePerMonth: "2500",
  securityDeposit: "500",
  applicationFee: "0",
  isPetsAllowed: true,
  isParkingIncluded: false,
  photos: [new File(["x"], "photo.jpg", { type: "image/jpeg" })],
  amenities: ["Pool", "Gym"],
  highlights: ["GreatView"],
  beds: "2",
  baths: "1.5",
  squareFeet: "900",
  propertyType: "Apartment",
  address: "1 Main St",
  city: "Austin",
  state: "TX",
  country: "United States",
  postalCode: "78701",
};

describe("propertySchema", () => {
  it("accepts a valid property and coerces numeric fields", () => {
    const result = propertySchema.parse(validProperty);
    expect(result.pricePerMonth).toBe(2500);
    expect(result.baths).toBe(1.5);
    expect(result.applicationFee).toBe(0);
  });

  it("rejects quarter baths", () => {
    expect(propertySchema.safeParse({ ...validProperty, baths: "1.25" }).success).toBe(false);
  });

  it("requires at least one photo, amenity and highlight", () => {
    const result = propertySchema.safeParse({
      ...validProperty,
      photos: [],
      amenities: [],
      highlights: [],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual([
      "photos",
      "amenities",
      "highlights",
    ]);
  });

  it("rejects unknown enum values", () => {
    expect(propertySchema.safeParse({ ...validProperty, propertyType: "Castle" }).success).toBe(
      false,
    );
    expect(propertySchema.safeParse({ ...validProperty, amenities: ["Sauna"] }).success).toBe(
      false,
    );
  });

  it("rejects blank required strings", () => {
    expect(propertySchema.safeParse({ ...validProperty, city: "   " }).success).toBe(false);
  });
});

describe("applicationSchema", () => {
  const validApplication = {
    name: "Carol White",
    email: "carol@example.com",
    phoneNumber: "5125550100",
  };

  it("accepts a valid application without a message", () => {
    expect(applicationSchema.safeParse(validApplication).success).toBe(true);
  });

  it("rejects an invalid email and a short phone number", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      email: "nope",
      phoneNumber: "123",
    });
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(["email", "phoneNumber"]);
  });
});

describe("settingsSchema", () => {
  it("requires a name", () => {
    expect(
      settingsSchema.safeParse({ name: "", email: "a@b.co", phoneNumber: "5125550100" }).success,
    ).toBe(false);
  });
});
