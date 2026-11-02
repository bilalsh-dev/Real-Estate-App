import { describe, expect, it } from "vitest";
import { addMonths, addYears, nextMonthlyDate } from "./dates.ts";

const utc = (value: string) => new Date(`${value}T00:00:00.000Z`);

describe("addMonths and addYears", () => {
  it("clamps to the last day of shorter months", () => {
    expect(addMonths(utc("2026-01-31"), 1)).toEqual(utc("2026-02-28"));
    expect(addMonths(utc("2028-01-31"), 1)).toEqual(utc("2028-02-29"));
    expect(addMonths(utc("2026-11-30"), 3)).toEqual(utc("2027-02-28"));
  });

  it("adds whole years, clamping leap days", () => {
    expect(addYears(utc("2026-03-15"), 1)).toEqual(utc("2027-03-15"));
    expect(addYears(utc("2028-02-29"), 1)).toEqual(utc("2029-02-28"));
  });
});

describe("nextMonthlyDate", () => {
  it("returns the start date when it is still in the future", () => {
    expect(nextMonthlyDate(utc("2026-06-01"), utc("2026-05-01"))).toEqual(utc("2026-06-01"));
  });

  it("returns the first monthly anniversary after now", () => {
    expect(nextMonthlyDate(utc("2026-01-15"), utc("2026-05-20"))).toEqual(utc("2026-06-15"));
    expect(nextMonthlyDate(utc("2026-01-15"), utc("2026-05-10"))).toEqual(utc("2026-05-15"));
  });

  it("moves past a due date that is exactly now", () => {
    expect(nextMonthlyDate(utc("2026-01-15"), utc("2026-05-15"))).toEqual(utc("2026-06-15"));
  });

  it("keeps month-end leases on the last day of the month", () => {
    expect(nextMonthlyDate(utc("2026-01-31"), utc("2026-02-10"))).toEqual(utc("2026-02-28"));
    expect(nextMonthlyDate(utc("2026-01-31"), utc("2026-03-01"))).toEqual(utc("2026-03-31"));
  });
});
