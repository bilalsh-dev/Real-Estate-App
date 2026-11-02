import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  DEFAULT_SEARCH_COORDINATES,
  DEFAULT_SEARCH_LOCATION,
  ViewMode,
  type Amenity,
  type PropertyType,
} from "@/lib/constants";

export type NumberRange = [min: number | null, max: number | null];

export type FiltersState = {
  location: string;
  coordinates: [longitude: number, latitude: number];
  beds: number | null;
  baths: number | null;
  propertyType: PropertyType | null;
  amenities: Amenity[];
  availableFrom: string | null;
  priceRange: NumberRange;
  squareFeet: NumberRange;
};

export type GlobalState = {
  filters: FiltersState;
  isFiltersFullOpen: boolean;
  viewMode: ViewMode;
};

export const DEFAULT_FILTERS: FiltersState = {
  location: DEFAULT_SEARCH_LOCATION,
  coordinates: DEFAULT_SEARCH_COORDINATES,
  beds: null,
  baths: null,
  propertyType: null,
  amenities: [],
  availableFrom: null,
  priceRange: [null, null],
  squareFeet: [null, null],
};

const initialState: GlobalState = {
  filters: DEFAULT_FILTERS,
  isFiltersFullOpen: false,
  viewMode: ViewMode.Grid,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<FiltersState>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = DEFAULT_FILTERS;
    },
    toggleFiltersFullOpen(state) {
      state.isFiltersFullOpen = !state.isFiltersFullOpen;
    },
    setViewMode(state, action: PayloadAction<ViewMode>) {
      state.viewMode = action.payload;
    },
  },
});

export const { setFilters, resetFilters, toggleFiltersFullOpen, setViewMode } = globalSlice.actions;
