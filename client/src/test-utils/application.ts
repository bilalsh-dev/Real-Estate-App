import { makeProperty } from "@/test-utils/property";
import type { ApplicationListItem } from "@/types";

export function makeApplication(overrides: Partial<ApplicationListItem> = {}): ApplicationListItem {
  return {
    id: 1,
    applicationDate: "2026-03-01T00:00:00.000Z",
    status: "Pending",
    propertyId: 1,
    tenantCognitoId: "tenant-1",
    name: "Carol White",
    email: "carol@example.com",
    phoneNumber: "+1 512 555 0100",
    message: null,
    leaseId: null,
    property: makeProperty(),
    tenant: {
      id: 1,
      cognitoId: "tenant-1",
      name: "Carol White",
      email: "carol@example.com",
      phoneNumber: "+1 512 555 0100",
    },
    manager: {
      id: 1,
      cognitoId: "manager-1",
      name: "Mark Lee",
      email: "mark@example.com",
      phoneNumber: "+1 512 555 0199",
    },
    lease: null,
    ...overrides,
  };
}
