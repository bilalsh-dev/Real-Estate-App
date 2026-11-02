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

export const SIGN_IN_PATH = "/signin";
export const SIGN_UP_PATH = "/signup";
export const REDIRECT_PARAM = "next";

export const DASHBOARD_PREFIX: Record<UserRole, string> = {
  tenant: "/tenants",
  manager: "/managers",
};

export const DASHBOARD_HOME: Record<UserRole, string> = {
  tenant: "/tenants/favorites",
  manager: "/managers/properties",
};

export const SETTINGS_PATH: Record<UserRole, string> = {
  tenant: "/tenants/settings",
  manager: "/managers/settings",
};

export const DEFAULT_SEARCH_LOCATION = "Los Angeles";
export const DEFAULT_SEARCH_COORDINATES: [longitude: number, latitude: number] = [-118.25, 34.05];

export const MAP_STYLE = "mapbox://styles/mapbox/streets-v12";
export const SEARCH_MAP_ZOOM = 9;
export const PROPERTY_MAP_ZOOM = 14;
export const MAP_MARKER_COLOR = "#000000";

export const MIN_PRICE_OPTIONS = [500, 1000, 1500, 2000, 3000, 5000, 10000] as const;
export const MAX_PRICE_OPTIONS = [1000, 2000, 3000, 5000, 10000] as const;
export const BED_OPTIONS = [1, 2, 3, 4] as const;
export const BATH_OPTIONS = [1, 2, 3] as const;

export const PRICE_SLIDER = { min: 0, max: 10000, step: 100 } as const;
export const SQUARE_FEET_SLIDER = { min: 0, max: 5000, step: 100 } as const;

export const PLACEHOLDER_IMAGE = "/placeholder.jpg";

export const ViewMode = {
  Grid: "grid",
  List: "list",
} as const;

export type ViewMode = (typeof ViewMode)[keyof typeof ViewMode];
