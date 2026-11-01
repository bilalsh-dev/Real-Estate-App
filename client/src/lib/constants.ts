import {
  Bath,
  Building,
  Bus,
  Cable,
  Car,
  Castle,
  Cigarette,
  Dumbbell,
  Hammer,
  Home,
  Maximize,
  Mountain,
  PawPrint,
  Phone,
  Sprout,
  Thermometer,
  Trees,
  Tv,
  VolumeX,
  Warehouse,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react";

export const Amenity = {
  WasherDryer: "WasherDryer",
  AirConditioning: "AirConditioning",
  Dishwasher: "Dishwasher",
  HighSpeedInternet: "HighSpeedInternet",
  HardwoodFloors: "HardwoodFloors",
  WalkInClosets: "WalkInClosets",
  Microwave: "Microwave",
  Refrigerator: "Refrigerator",
  Pool: "Pool",
  Gym: "Gym",
  Parking: "Parking",
  PetsAllowed: "PetsAllowed",
  WiFi: "WiFi",
} as const;

export type Amenity = (typeof Amenity)[keyof typeof Amenity];

export const AMENITY_ICONS: Record<Amenity, LucideIcon> = {
  WasherDryer: Waves,
  AirConditioning: Thermometer,
  Dishwasher: Waves,
  HighSpeedInternet: Wifi,
  HardwoodFloors: Home,
  WalkInClosets: Maximize,
  Microwave: Tv,
  Refrigerator: Thermometer,
  Pool: Waves,
  Gym: Dumbbell,
  Parking: Car,
  PetsAllowed: PawPrint,
  WiFi: Wifi,
};

export const Highlight = {
  HighSpeedInternetAccess: "HighSpeedInternetAccess",
  WasherDryer: "WasherDryer",
  AirConditioning: "AirConditioning",
  Heating: "Heating",
  SmokeFree: "SmokeFree",
  CableReady: "CableReady",
  SatelliteTV: "SatelliteTV",
  DoubleVanities: "DoubleVanities",
  TubShower: "TubShower",
  Intercom: "Intercom",
  SprinklerSystem: "SprinklerSystem",
  RecentlyRenovated: "RecentlyRenovated",
  CloseToTransit: "CloseToTransit",
  GreatView: "GreatView",
  QuietNeighborhood: "QuietNeighborhood",
} as const;

export type Highlight = (typeof Highlight)[keyof typeof Highlight];

export const HIGHLIGHT_ICONS: Record<Highlight, LucideIcon> = {
  HighSpeedInternetAccess: Wifi,
  WasherDryer: Waves,
  AirConditioning: Thermometer,
  Heating: Thermometer,
  SmokeFree: Cigarette,
  CableReady: Cable,
  SatelliteTV: Tv,
  DoubleVanities: Maximize,
  TubShower: Bath,
  Intercom: Phone,
  SprinklerSystem: Sprout,
  RecentlyRenovated: Hammer,
  CloseToTransit: Bus,
  GreatView: Mountain,
  QuietNeighborhood: VolumeX,
};

export const PropertyType = {
  Rooms: "Rooms",
  Tinyhouse: "Tinyhouse",
  Apartment: "Apartment",
  Villa: "Villa",
  Townhouse: "Townhouse",
  Cottage: "Cottage",
} as const;

export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

export const PROPERTY_TYPE_ICONS: Record<PropertyType, LucideIcon> = {
  Rooms: Home,
  Tinyhouse: Warehouse,
  Apartment: Building,
  Villa: Castle,
  Townhouse: Home,
  Cottage: Trees,
};

export const ApplicationStatus = {
  Pending: "Pending",
  Denied: "Denied",
  Approved: "Approved",
} as const;

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const PaymentStatus = {
  Pending: "Pending",
  Paid: "Paid",
  PartiallyPaid: "PartiallyPaid",
  Overdue: "Overdue",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const UserRole = {
  Tenant: "tenant",
  Manager: "manager",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const NAVBAR_HEIGHT_PX = 52;
