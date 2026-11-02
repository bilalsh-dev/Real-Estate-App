import type {
  Amenity,
  ApplicationStatus,
  Highlight,
  PaymentStatus,
  PropertyType,
} from "@/lib/constants";

export type Coordinates = {
  longitude: number;
  latitude: number;
};

export type Location = {
  id: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates: Coordinates;
};

export type Manager = {
  id: number;
  cognitoId: string;
  name: string;
  email: string;
  phoneNumber: string;
};

export type Tenant = {
  id: number;
  cognitoId: string;
  name: string;
  email: string;
  phoneNumber: string;
  favorites?: Property[];
};

export type Property = {
  id: number;
  name: string;
  description: string;
  pricePerMonth: number;
  securityDeposit: number;
  applicationFee: number;
  photoUrls: string[];
  amenities: Amenity[];
  highlights: Highlight[];
  isPetsAllowed: boolean;
  isParkingIncluded: boolean;
  beds: number;
  baths: number;
  squareFeet: number;
  propertyType: PropertyType;
  postedDate: string;
  averageRating: number | null;
  numberOfReviews: number | null;
  locationId: number;
  managerCognitoId: string;
  location: Location;
};

export type Lease = {
  id: number;
  startDate: string;
  endDate: string;
  rent: number;
  deposit: number;
  propertyId: number;
  tenantCognitoId: string;
  property?: Property;
  tenant?: Tenant;
  payments?: Payment[];
  nextPaymentDate?: string;
};

export type Payment = {
  id: number;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  paymentDate: string;
  paymentStatus: PaymentStatus;
  leaseId: number;
};

export type Application = {
  id: number;
  applicationDate: string;
  status: ApplicationStatus;
  propertyId: number;
  tenantCognitoId: string;
  name: string;
  email: string;
  phoneNumber: string;
  message: string | null;
  leaseId: number | null;
  property?: Property;
  tenant?: Tenant;
  lease?: Lease | null;
  manager?: Manager;
};
