import type { Property } from "@/types";

export function makeProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: 1,
    name: "Sunny Loft",
    description: "Bright loft downtown",
    pricePerMonth: 2450,
    securityDeposit: 1000,
    applicationFee: 50,
    photoUrls: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
    amenities: ["WasherDryer", "Pool"],
    highlights: ["GreatView"],
    isPetsAllowed: true,
    isParkingIncluded: false,
    beds: 2,
    baths: 1.5,
    squareFeet: 950,
    propertyType: "Apartment",
    postedDate: "2026-01-01T00:00:00.000Z",
    averageRating: 4.5,
    numberOfReviews: 12,
    locationId: 1,
    managerCognitoId: "manager-1",
    location: {
      id: 1,
      address: "1 Main St",
      city: "Los Angeles",
      state: "CA",
      country: "United States",
      postalCode: "90012",
      coordinates: { longitude: -118.25, latitude: 34.05 },
    },
    ...overrides,
  };
}
